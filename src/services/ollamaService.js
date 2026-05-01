const ollama = require('ollama').default;

const VALID_SEVERITIES = ['high', 'medium', 'low'];

//Normalize whatever the model returns into our accepted values

const normalizeSeverity = (severity) => {
    if (!severity) return 'medium'
    const s = severity.toLowerCase()
    if (s === 'critical' || s === 'high') return 'high';
    if (s === 'moderate' || s === 'medium') return 'medium';
    if (s === 'minor' || s === 'low' || s === 'info') return 'low';
    return 'medium'; //safe default
};

const withRetry = async (fn, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isLastAttempt = attempt === retries;
            if (isLastAttempt) throw err;
            console.warn(`Attempt ${attempt} failed — retrying...`);
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const reviewCode = async ({ diff, language, filename }) => {
    if (!diff || diff.trim().length === 0) {
        return {
            issues: [],
            summary: 'No changes detected in diff.',
            approved: true,
        };
    }
    // ... rest of the function
    const prompt = `You are an expert code reviewver. Ananlyze the following ${language} code diff from the file "${filename}" and return a structured review.

    You must respond with valid JSON only. No explanations, no markdowns, no code blocks, Just raw JSON.

    Severity levels must be exactly one of: "high", "medium", or "low".

    The JSON must follow this exact structure:

    {
        "issues": [
            {
                "severity":  "high" | "medium" | "low",
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

    // Replace the ollama.generate() call with this
    const parsed = await withRetry(async () => {
        const response = await ollama.generate({
            model: 'gemma4:e4b',
            prompt,
            stream: false,
            options: {
                temperature: 0.2,
                num_predict: 1024,
            },
        });

        const raw = response.response
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const result = JSON.parse(raw);

        if (!Array.isArray(result.issues)) {
            result.issues = []
        }
        return result;
    });

    //normalize severity values so they always match our enum

    parsed.issues = parsed.issues.map(issue => ({
        ...issue,
        severity: normalizeSeverity(issue.severity),
    }));

    //Recalculate approved based on normalized severities 
    parsed.approved = !parsed.issues.some(i => i.severity === 'high');

    return parsed;
};

module.exports = { reviewCode };
