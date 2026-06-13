import express from "express"
import { getAiAdvise } from "../controllers/aiControllers";

const router = express.Router();

router.post("/property-advisor", getAiAdvise);

export default router;
