import { Request, Response } from "express";
import { openaiClient } from "../llm/client";
import { instructions } from '../llm/prompts/define-bot'

const conversations = new Map<string, string>();

export const getAiAdvise = async (
  req: Request,
  res: Response) => {
    try {
      const { prompt, conversationId } = req.body;
      if (!prompt) {
        res.status(400).json({ message: "Prompt is required" })
        return;
      }
      const response = await openaiClient.responses.create({
        model: 'gpt-5.4-mini',
        instructions,
        input: prompt,
        max_output_tokens: 300,
        previous_response_id: conversations.get(conversationId)
      });
      conversations.set(conversationId, response.id)
      res.json({message: response.output_text})
    } catch (error) {
      res.status(500).json({error: "Failed to generate a response."})
    }
}