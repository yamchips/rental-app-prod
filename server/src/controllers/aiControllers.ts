import { Request, Response } from "express";
import { llmClient } from "../llm/client";

export const testAIResponse = async (
  req: Request,
  res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        res.status(400).json({ message: "Prompt is required" })
        return;
      }
      const response = await llmClient.generateText(prompt);
      res.json({message: response})
    } catch (error) {
      res.status(500).json({error: "Failed to generate a response."})
    }
}