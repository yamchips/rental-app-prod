import express from "express"
import { testAIResponse } from "../controllers/aiControllers";

const router = express.Router();

router.post("/test", testAIResponse);

export default router;
