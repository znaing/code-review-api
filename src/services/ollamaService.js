const ollama = require('ollama').default;

const reviewCode = async ({ diff, language, filename }) => {
    const prompt = `You are an expert code reviewver. Ananlyze the following ${language} code diff from the file "${filename}" and return a structured review.

    You must respond with valid JSON only. No explanations, no markdowns, no code blocks, Just raw JSON.

    The JSON must follow this exact structure:

    {
        "issues": [
            {
                "severity": "critical" | "high" | "medium" | "low",
                "line": <line number as integer or null if unknown>,
                "message": "<what the issue is>",
                "suggestion": "<how to fix it>"
            }
        ]
        "summary": "<one sentence overall assessment>",
        "approved": <true if no high severity issues, false otherwise>        
    }
    Code diff to review:
    ${diff}`;
    const response = await ollama.generate({
        model: 'gemma4:e4b',
        prompt,
        stream: false,
        options: {
            temperature: 0.2,// low temperature = more consistent, less creative responses
            num_predict: 1024// max tokens to generate
        }
    });
    //parse the JSON model returns 
    //Models sometimes wrap JSON in markdown code blocks - Strio those first 
    const raw = response.response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

    const parsed = JSON.parse(raw)
    return parsed;
};

module.exports = { reviewCode };
