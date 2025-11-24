-- Fix corrupted evaluations JSON field in SportIndication table
UPDATE SportIndication
SET
    evaluations = '[]'
WHERE
    evaluations IS NULL
    OR evaluations = ''
    OR json_valid(evaluations) = 0;