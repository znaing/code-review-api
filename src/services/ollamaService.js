const ollama = require('ollama').default;
const { buildReviewPrompt } = require('../prompts/reviewPrompt');

//Read model name from environment - never hardcode it 
const MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';


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
            durationMs: 0,
            promptVersion: null,
            model: MODEL,
        };
    }
    // ... rest of the function
    const { prompt, promptVersion } = buildReviewPrompt({ diff, language, filename });

    //Start the timer right before calling ollama
    const startTime = Date.now();

    // Replace the ollama.generate() call with this
    const parsed = await withRetry(async () => {
        const response = await ollama.generate({
            model: MODEL,
            prompt,
            stream: false,
            keep_alive: process.env.OLLAMA_KEEP_ALIVE || '5m',
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

    //Calculate how long ollama took 
    const durationMs = Date.now() - startTime
    //normalize severity values so they always match our enum

    parsed.issues = parsed.issues.map(issue => ({
        ...issue,
        severity: normalizeSeverity(issue.severity),
    }));

    //Recalculate approved based on normalized severities 
    parsed.approved = !parsed.issues.some(i => i.severity === 'high');

    //Attach timing and model info to the result
    parsed.durationMs = durationMs
    parsed.model = MODEL;
    parsed.promptVersion = promptVersion;

    return parsed;
};

module.exports = { reviewCode };

