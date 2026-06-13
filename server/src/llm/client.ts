import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const llmClient = {
  async generateText(text: string): Promise<string> {
    const response = await openaiClient.responses.create({
      model: 'gpt-5.4-mini',
      input: text,
      max_output_tokens: 300
    })
    return response.output_text
  }
}