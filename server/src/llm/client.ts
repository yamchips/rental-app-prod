import OpenAI from "openai";

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateTextOptions = {
  model?: string;
  prompt: string;
  instructions?: string;
  maxToken?: number;
  previousResponseId?: string;
}

const conversations = new Map<string, string>();

export const llmClient = {
  async generateText({ model = 'gpt-5.4-mini',
    prompt,
    instructions,
    maxToken = 300,
    previousResponseId
  }: GenerateTextOptions): Promise<string> {
    const response = await openaiClient.responses.create({
      model,
      instructions,
      input: prompt,
      max_output_tokens: maxToken,
    })
    return response.output_text
  }
}