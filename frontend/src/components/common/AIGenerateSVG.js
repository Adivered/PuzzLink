import React, { useState, useEffect, useRef } from 'react';
import { POST as generateSVGAPI } from '../services/openaiapi';

const Alert = ({ children }) => (
    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
        {children}
    </div>
);

const AlertTitle = ({ children }) => (
    <h3 className="text-sm font-medium text-yellow-800">{children}</h3>
);

const AlertDescription = ({ children }) => (
    <div className="mt-2 text-sm text-yellow-700">{children}</div>
);

const Progress = ({ value }) => (
    <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div style={{ width: `${value}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
        </div>
    </div>
);

const AIGenerateSVG = ({ prompt, animated, colored, is3D, onError }) => {
    const [stage, setStage] = useState('analyzing');
    const [progress, setProgress] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [svgContent, setSvgContent] = useState(null);
    const generationStarted = useRef(false);

    useEffect(() => {
        if (generationStarted.current) return;

        generationStarted.current = true;

        const generateSVG = async () => {
            console.log("Generating")
            try {
                setStage('analyzing');
                setProgress(10);

                if (prompt.split(' ').length < 2) {
                    setFeedback("Your prompt seems a bit short. Can you provide more details about what you want to see in the SVG?");
                    generationStarted.current = false; // Reset the flag if prompt is too short
                    return;
                }

                setStage('generating');
                setProgress(30);
                console.log("Generating")
                const response = await generateSVGAPI({
                    json: async () => ({ prompt, animated, colored, is3D }),
                });

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('API error response:', errorData);
                    throw new Error(errorData.error || 'Unexpected JSON response');
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const svgString = await response.text();
                if (!svgString.trim().startsWith('<svg')) {
                    throw new Error('Invalid SVG response');
                }

                setSvgContent(svgString);

                setStage('refining');
                setProgress(70);

                // Simulate refining stage
                // await new Promise(resolve => setTimeout(resolve, 1000));

                setStage('complete');
                setProgress(100);
            } catch (error) {
                console.error('Error generating SVG:', error);
                onError(`An error occurred while generating the SVG: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                console.log("Completed")
                generationStarted.current = false; // Reset the flag after completion
            }
        };

        generateSVG();
    }, [prompt, animated, colored, is3D, onError]);

    return (
        <div className="space-y-4">
            {feedback ? (
                <Alert>
                    <AlertTitle>AI Feedback</AlertTitle>
                    <AlertDescription>{feedback}</AlertDescription>
                </Alert>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold capitalize">{stage}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                    {svgContent && (
                        <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AIGenerateSVG;
