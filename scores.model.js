import { pool } from "../db/index.js";

export async function createScore({ playerName, score }){
  const { rows } = await pool.query(
    `INSERT INTO scores (player_name, score)
     VALUES ($1, $2)
     RETURNING id, player_name, score, created_at`,
    [playerName, score]
  );
  return rows[0];
}

export async function getBestScore(){
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(score), 0) AS best
     FROM scores`
  );
  return Number(rows[0].best);
}

export async function listTopScores(limit = 10){
  const { rows } = await pool.query(
    `SELECT player_name, score, created_at
     FROM scores
     ORDER BY score DESC, created_at ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
