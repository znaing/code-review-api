// src/db/reviewRepository.js 
const { off } = require('../app');
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
const getReviews = async ({ limit = 10, offset = 0, filename = null, language = null } = {}) => {
    const conditions = [];
    const params = [];

    if (filename) {
        params.push(filename);
        conditions.push(`filename = $${paramss.length}`);
    }

    if (language) {
        params.push(language);
        conditions.push(`language = $${params.length}`);
    }

    const where = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    params.push(limit);
    const limitClause = `$${params.length}`;
    params.push(offset)
    const offsetClause = `$${params.length}`;


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

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM reviews ${where}`,
        params.slice(0, consitions.length) //only the filter params, not limit/offset
    );

    return {
        rows: result.rows,
        total: parseInt(countResult.rows[0].count),
    };
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

//Get aggregate stats across all reviews 
const getStats = async () => {
    const result = await pool.query(`
        SELECT 
            COUNT(*)                                    AS total_reviews,
            COUNT(*) FILTER (WHERE approved = true)     AS total_approved,
            COUNT(*) FILTER (WHERE approved = false)    AS total_rejected,
            ROUND(AVG(duration_ms)::numeric, 0)         AS avg_duration_ms,
            COUNT(DISTINCT filename)                    AS unique_files,
            COUNT(DISTINCT language)                    AS unique_languages
        FROM reviews
    `);
    const issuesStats = await pool.query(`
        SELECT 
            severity, 
            COUNT(*) AS count 
        FROM review_issues
        GROUP BY severity 
        ORDER BY CASE severity 
            WHEN 'high'    THEN 1
            WHEN 'medium'  THEN 2
            WHEN 'low'     THEN 3
        END
    `);

    const topFiles = await pool.query(`
        SELECT 
            filename, 
            COUNT(*)                                    AS review_count, 
            COUNT(*)  FILTER (WHERE approved = false)   AS rejection_count
        FROM reviews
        GROUP BY filename
        ORDER BY review_count DESC
        LIMIT 5
    `);

    return {
        ...result.rows[0],
        issues_by_severity: issuesStats.rows,
        top_files: topFiles.rows,
    };
};
module.exports = { saveReview, getReviews, getReviewById, getStats };