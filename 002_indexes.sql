-- 002_indexes.sql
CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON scores (score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores (created_at);
