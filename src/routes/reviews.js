// src/routes/reviews.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getReviews, getReviewById } = require('../db/reviewRepository');

// GET /api/v1/reviews — paginated history
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50
        const offset = parseInt(req.query.offset) || 0;
        const filename = req.query.filename || null;

        const reviews = await getReviews({ limit, offset, filename });

        res.json({
            reviews,
            pagination: {
                limit,
                offset,
                count: reviews.length,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/reviews/:reviewId — single review with issues
router.get('/:reviewId', authMiddleware, async (req, res, next) => {
    try {
        const review = await getReviewById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                error: 'Not Found',
                message: `No review found with id ${req.params.reviewId}`,
            });
        }

        res.json(review);
    } catch (err) {
        next(err);
    }
});

module.exports = router;