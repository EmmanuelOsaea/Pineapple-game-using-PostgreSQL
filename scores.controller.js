import * as Scores from "../models/scores.model.js";

export async function getBestScore(req, res){
  const bestScore = await Scores.getBestScore();
  res.json({ bestScore });
}

export async function listTopScores(req, res){
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
  const rows = await Scores.listTopScores(limit);
  res.json({ rows });
}

export async function createScore(req, res){
  const { playerName, score } = req.body || {};

  if (typeof playerName !== "string" || playerName.trim().length < 1 || playerName.length > 20){
    return res.status(400).json({ error: "playerName must be 1-20 chars" });
  }
  if (!Number.isInteger(score) || score < 0 || score > 1_000_000){
    return res.status(400).json({ error: "score must be an integer 0..1000000" });
  }

  const created = await Scores.createScore({ playerName: playerName.trim(), score });
  res.status(201).json({ created });
}
