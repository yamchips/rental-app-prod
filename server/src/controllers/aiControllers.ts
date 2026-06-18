import { Request, Response } from "express";
import { openaiClient } from "../llm/client";
import baseInstructions from "../llm/prompts/define-bot";
import z from "zod";
import { propertySearchSchema } from "../schemas/propertySearchSchema";
import { getPropertiesByFilters } from "../services/propertyService";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const conversations = new Map<string, string>();

const chatSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(1000, "Prompt is too long (max 1000 characters)"),
  conversationId: z.uuid(),
});

const advisorResponseSchema = z.object({
  message: z.string(),
  recommendations: z.array(
    z.object({
      propertyId: z.number().int().positive(),
      reason: z.string(),
      tradeOff: z.string(),
    }),
  ),
});

export const getAiAdvise = async (req: Request, res: Response) => {
  try {
    const parsedQuery = propertySearchSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).json({
        message: "Invalid property filters",
        errors: z.treeifyError(parsedQuery.error),
      });
      return;
    }

    const parsedBody = chatSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json(z.treeifyError(parsedBody.error));
      return;
    }
    const { prompt, conversationId } = parsedBody.data;

    // get at most 100 properties
    const properties = await getPropertiesByFilters({
      ...parsedQuery.data,
      limit: 100,
    });

    const propertiesInfo = properties.map((property) => ({
      id: property.id,
      name: property.name,
      pricePerMonth: property.pricePerMonth,
      totalMoveInEstimate:
        property.securityDeposit +
        property.applicationFee +
        property.pricePerMonth,
      beds: property.beds,
      baths: property.baths,
      squareFeet: property.squareFeet,
      propertyType: property.propertyType,
      amenities: property.amenities,
      highlights: property.highlights,
      isPetsAllowed: property.isPetsAllowed,
      isParkingIncluded: property.isParkingIncluded,
      averageRating: property.averageRating,
      numberOfReviews: property.numberOfReviews,
      location: {
        city: property.location.city,
        state: property.location.state,
        country: property.location.country,
      },
      description: property.description,
      link: `/search/${property.id}`,
    }));

    // build instructions
    const llmInput = `Read these property info, then answer user's question concisely.
    
    This is the property info you need to understand: ${JSON.stringify(propertiesInfo)}
    
    This is the user's question: ${prompt}
    
    Answer question only using the given properties info. 
    If no suitable property, don't make up; just say it politely.
    `;

    // send request to LLM
    const response = await openaiClient.responses.parse({
      model: "gpt-5.4-mini",
      instructions: baseInstructions,
      input: llmInput,
      max_output_tokens: 700,
      previous_response_id: conversations.get(conversationId),
      text: {
        format: zodTextFormat(
          advisorResponseSchema,
          "property_advisor_response",
        ),
      },
    });

    conversations.set(conversationId, response.id);

    const aiResult = response.output_parsed;
    if (!aiResult) {
      res.status(500).json({ error: "Failed to parse AI response." });
      return;
    }
    const propertyById = new Map(
      propertiesInfo.map((property) => [property.id, property]),
    );
    const recommendedProperties = aiResult.recommendations
      .map((recommendation) => {
        const property = propertyById.get(recommendation.propertyId);
        if (!property) return null;
        return {
          id: property.id,
          name: property.name,
          link: property.link,
          reason: recommendation.reason,
          tradeOff: recommendation.tradeOff,
        };
      })
      .filter(Boolean);

    res.json({ message: aiResult.message, properties: recommendedProperties });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate a response." });
  }
};
