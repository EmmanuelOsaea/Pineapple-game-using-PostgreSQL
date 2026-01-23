import { Router } from "express";
import {
  getBestScore,
  createScore,
  listTopScores
} from "../controllers/scores.controller.js";

const router = Router();

router.get("/best", getBestScore);
router.get("/top", listTopScores);
router.post("/", createScore);

export default router;
