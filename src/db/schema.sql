--src/db/schema.sql 

--Store every code review result 

CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    review_id   VARCHAR(64)     NOT NULL UNIQUE,
    filename    VARCHAR(255)    NOT NULL,
    language    VARCHAR(64)     NOT NULL,
    diff        TEXT            NOT NULL,
    summary     TEXT,
    approved    BOOLEAN         DEFAULT FALSE,
    model       VARCHAR(16),
    prompt_version VARCHAR(16),
    duration_ms INTEGER,
    created_at  TIMESTAMP       DEFAULT NOW()
); 



--Store indivaidual issues found per review 
CREATE TABLE IF NOT EXISTS review_issues (
    id          SERIAL PRIMARY KEY,
    review_id   VARCHAR(64)     NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    severity    VARCHAR(16)     NOT NULL CHECK(severity IN ('high', 'medium', 'low')),
    line        INTEGER,
    message     TEXT            NOT NULL,
    suggestion  TEXT,
    created_at  TIMESTAMP       DEFAULT NOW()
);

--Index for fast lookups by review_id and filename
CREATE INDEX IF NOT EXISTS idx_reviews_review_id    ON reviews(review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_filename     ON reviews(filename);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at   ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_review_id     ON review_issues(review_id);