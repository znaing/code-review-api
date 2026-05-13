// src/db/reviewRepository.js 
const pool = require('./pool');

//save a completed review + its issues in on transaction 
const saveReview = async ({ reviewId, filename, language, diff, summary, approved, model, promptVersion, durationMs, issues }) => {

    //A transaction means both inserts succeed or both fail together
    //You ever want a review saved wihtout its issues, or vice versa


    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        //insert the review record
        const reviewResult = await client.query(
            `INSERT INTO reviews
            (review_id, filename, language, diff, summary, approved, model, prompt_version, duration_ms)
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [reviewId, filename, language, diff, summary, approved, model, promptVersion, durationMs]
        );

        //Insert each issue linked to this review. 
        for (const issue of issues) {
            await client.query(
                `INSERT INTO review_issues
                (review_id, severity, line, message, suggestion)
                VALUES($1,$2,$3,$4,$5)`,
                [reviewId, issue.severity, issue.line || null, issue.message, issue.suggestion]
            );
        }
        await client.query('COMMIT');
        return reviewResult.rows[0];
    } catch (err) {
        //If anything fails , roll back everything - No partial data
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
// Get paginated review history
const getReviews = async ({ limit = 10, offset = 0, filename = null } = {}) => {
    // Optionally filter by filename
    const conditions = filename ? `WHERE filename = $3` : '';
    const params = filename
        ? [limit, offset, filename]
        : [limit, offset];

    const result = await pool.query(
        `SELECT
      review_id, filename, language, summary,
      approved, model, prompt_version, duration_ms, created_at
     FROM reviews
     ${conditions}
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
        params
    );

    return result.rows;
};

// Get a single review with all its issues
const getReviewById = async (reviewId) => {
    const reviewResult = await pool.query(
        `SELECT * FROM reviews WHERE review_id = $1`,
        [reviewId]
    );

    if (reviewResult.rows.length === 0) return null;

    const issuesResult = await pool.query(
        `SELECT severity, line, message, suggestion
     FROM review_issues
     WHERE review_id = $1
     ORDER BY severity DESC`,
        [reviewId]
    );

    return {
        ...reviewResult.rows[0],
        issues: issuesResult.rows,
    };
};
module.exports = { saveReview, getReviews, getReviewById };