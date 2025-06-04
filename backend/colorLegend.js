// backend/colorLegend.js
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getColorLegendFromImage(imagePath) {
  const imageBytes = fs.readFileSync(imagePath).toString("base64");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
  {
    inlineData: {
      mimeType: "image/png",
      data: imageBytes,
    },
  },
  {
    text: `
This is a black and white coloring page.
Please analyze the image and return a list of objects and their suggested colors.

Format the output as:
- [object name] – [color]

Do not include any explanation or notes. Only output the color legend in the format above.
For example:
- Sky – Blue

      `.trim(),
  },
]);


  const text = result.response.text();
  return text;
}

module.exports = { getColorLegendFromImage };
