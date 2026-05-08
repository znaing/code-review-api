//src/prompts/reviewPrompt.js

//Bump this version number every time you change the prompt text
//Format; v<major>.<minor> - Bump major for structural changes, minor for tweaks 
const PROMPT_VERSION = 'v1.0';

const buildReviewPrompt = ({ diff, language, filename }) => {
    const prompt = `You are an expert code reviewer. Analyzethe following ${language} code diff from the file "${filename}" and return a structured review.

You MUST respond with valid JSON only. No explanation, no markdown, no code blocks. Just raw JSON.

Severity levels must be exactly one of: "high", "medium", or "low".

The JSON must follow this exact structure:
{
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "line": <line number as integer or null if unknown>,
      "message": "<what the issue is>",
      "suggestion": "<how to fix it>"
    }
  ],
  "summary": "<one sentence overall assessment>",
  "approved": <true if no high severity issues, false otherwise>
}

Code diff to review:
${diff}`;

    return { prompt, promptVersion: PROMPT_VERSION };

};

module.exports = { buildReviewPrompt, PROMPT_VERSION };
