# AI Property Advisor Backend Endpoint Design

## Goal
Allow visitors to ask questions about the current property search results.
The AI must only use properties from the current filtered result set.

## Non-goals
- No login required
- No long-term chat memory
- No answers from the internet
- No recommendations outside current search results

## Endpoint
POST /ai/property-advisor

## Request Body
{
  "prompt": "Which property is best for a family?",
  "conversationId": a_conversation_id,
  "filters": { ... },
  "propertyIds": [1, 2, 3]
}

## Backend Flow
1. Validate request body.
2. Re-fetch matching properties from PostgreSQL.
3. Build compact property summaries.
4. Send question + summaries to OpenAI, or other LLM.
5. Ask for a structured JSON response.
6. Return response to frontend/Postman.

## Guardrails
- Only answer from provided property data.
- If data is missing, say it is missing.
- Do not invent property details.
- Do not give legal or financial advice.

## Response Shape
{
  "summary": "...",
  "recommendations": [
    {
      "propertyId": 1,
      "rank": 1,
      "reason": "...",
      "tradeOff": "..."
    },
    {
      "propertyId": 2,
      "rank": 2,
      "reason": "...",
      "tradeOff": "..." 
    }
  ],
  "followUpQuestions": [...]
}

## Testing With Postman
- Valid question + propertyIds
- Missing question
- Empty propertyIds
- Invalid propertyIds
- Too many properties
- OpenAI/API failure