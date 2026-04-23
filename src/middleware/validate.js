const { z } = require('zod');
//Define the exact shape a valid review request must have
const reviewSchema = z.object({
    diff: z
        .string()
        .min(1, 'diff cannot be empty')
        .max(20000, 'diff is too large -- max 20,000 characters'),
    language: z
        .string()
        .min(1, 'language is required')
        .toLowerCase(),
    filename: z
        .string()
        .min(1, 'filename is required')

});

const validateReview = (req, res, next) => {
    //Ask Zod to parse and validate req.body against our schema 
    const result = reviewSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: 'Validation Failed',
            //Zod's .flattan() gives you clean, readable error messages per field 
            issues: result.error.flatten().fieldErrors,
        });
    }

    //Replace req.body with the validated, cleaned data
    //This means downstream code can trust it's clean
    req.body = result.data;
    next();
};

module.exports = validateReview;