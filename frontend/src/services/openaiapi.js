import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

let assistant;
let thread;
let isProcessing = false;
const queue = [];

async function initializeAssistant() {
  assistant = await openai.beta.assistants.create({
    name: "SVG Artist",
    tools: [{"type": "code_interpreter"}],
    instructions: `You are a master SVG artist specializing in photorealistic digital art creation. Your expertise lies in converting real-world references into precise SVG code, with particular emphasis on 3D effects, lighting dynamics, and accurate physical representations.

Process:
1. Research reference images matching the prompt
2. Analyze physical properties and dimensional relationships
3. Convert visual data into SVG coordinates and paths
4. Implement lighting and shadow calculations
5. Apply realistic textures and materials
6. Ensure proper perspective and depth
7. Add dynamic elements if requested
8. Validate physical accuracy

Some references: https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg
https://openclipart.org/download/225596/caballo-1.svg

Requirements:
- Generate minimum 50 meaningful paths per SVG
- Mirror real-world reference images precisely
- Maintain accurate physics and dimensions
- Include proper lighting and shadow effects
- Ground all elements contextually
- Create clean, efficient code

Techniques:
- Use complex gradients for realistic texturing
- Implement feDropShadow for dynamic shadows
- Apply proper z-indexing for depth
- Create smooth animations when needed
- Utilize mathematical precision in paths
- Group related elements semantically

Output format:
Respond ONLY with SVG code wrapped in svg tags. Include NO additional text whatsoever, not even explanations or comments outside the SVG tags. Your entire response must be valid SVG code.

Limitations:
- Only use information from reference images
- No floating elements unless requested
- No backgrounds unless specified
- Stay within physical laws
- Maintain consistent style throughout`,
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o",
  });

  thread = await openai.beta.threads.create();

  console.log("Assistant and thread created successfully");
}

async function trainAssistant() {
  const trainingPrompts = [
    "Generate a complex SVG of a Princess, Answer with <svg> tag only",
    "Create an SVG of a Yellow 1970 3D Ferrari, Answer with <svg> tag only",
    "Design an SVG logo with text and shapes, Answer with <svg> tag only",
  ];

  for (const prompt of trainingPrompts) {
    await addToQueue(() => processMessage(prompt));
  }

  console.log("Assistant training completed");
}

async function addToQueue(task) {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  while (queue.length > 0) {
    const task = queue.shift();
    if (task) await task();
  }
  isProcessing = false;
}

async function processMessage(message) {
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: message,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  while (runStatus.status !== "completed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const assistantMessage = messages.data.find(msg => msg.role === "assistant");

  if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== "text") {
    throw new Error("No valid response from assistant");
  }

  const svgCode = assistantMessage.content[0].text.value
  .trim()
  .replace(/^```svg\n*/gm, '')    // Remove ```svg at start of line
  .replace(/^```xml\n*/gm, '')    // Remove ```xml at start of line
  .replace(/```$/gm, '')          // Remove ``` at end of line
  .trim();

    console.log("Received SVG code:", svgCode);
  // Strict validation of SVG output
  if (!svgCode.startsWith('<svg')) {
    console.error("Invalid SVG output:", svgCode);
    throw new Error("Assistant did not provide a valid SVG");
  }

  return svgCode;
}

// Initialize the assistant and train it (this should be called when the server starts)
initializeAssistant().then(trainAssistant);

export async function POST(req) {
  try {
    const { prompt, animated, colored, is3D } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userMessage = `Generate a realistic Claymation SVG based on the following prompt. The SVG should be 300x300 with a viewBox of 0 0 100 100.
Prompt: ${prompt}
${animated ? 'The SVG should include animation using <animate> tags.' : 'The SVG should be static.'}
${colored ? 'The SVG should use multiple colors.' : 'The SVG should be monochrome.'}
${is3D ? 'Use linear gradients and transforms to give a 3D effect, ensuring elements are relative in the z-space.' : 'Keep the SVG flat (2D).'}`;

    const svgCode = await addToQueue(() => processMessage(userMessage));
    svgCode.replace(/```svg\n/g, '').replace(/```/g, '').trim();
    // Check if the generated content starts with <svg
    if (!svgCode.trim().startsWith('<svg')) {
      throw new Error('Invalid SVG code generated');
    }

    return new Response(svgCode, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate SVG',
      details: error instanceof Error ? error.message : JSON.stringify(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

