import { Request, Response } from "express";
import { openaiClient } from "../llm/client";
import { instructions } from "../llm/prompts/define-bot";
import z from "zod";

const conversations = new Map<string, string>();

const chatSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(1000, "Prompt is too long (max 1000 characters)"),
  conversationId: z.uuid(),
});

export const getAiAdvise = async (req: Request, res: Response) => {
  try {
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json(z.treeifyError(parseResult.error));
      return;
    }
    const { prompt, conversationId } = req.body;

    const response = await openaiClient.responses.create({
      model: "gpt-5.4-mini",
      instructions,
      input: prompt,
      max_output_tokens: 300,
      previous_response_id: conversations.get(conversationId),
    });
    conversations.set(conversationId, response.id);
    res.json({ message: response.output_text });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate a response." });
  }
};
