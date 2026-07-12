# AI Property Advisor Backend Endpoint Design

## Goal

Allow visitors to ask questions about the current property search results.
The AI must only use properties from the current filtered result set.

## Non-goals

- No login required
- No persisted long-term chat memory
- No answers from the internet
- No recommendations outside current search results

## Endpoint

POST /ai/property-advisor?location=Los%20Angeles&priceMin=1000&priceMax=3000&beds=2

The endpoint receives the current property search filters as URL query parameters.
These filters use the same shape as the normal property search endpoint.

## Request Body

```json
{
  "prompt": "Which property is best for a family?",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Backend Flow

1. Validate URL query parameters with `propertySearchSchema`.
2. Validate request body with `chatSchema`.
3. Re-fetch matching properties from PostgreSQL using the current search filters.
4. Limit the property set to at most 100 properties.
5. Build compact property summaries.
6. Send the user question and property summaries to OpenAI.
7. Ask OpenAI for a structured response with `message` and `recommendations`.
8. Map recommended `propertyId`s back to real properties from the filtered result set.
9. Return `{ message, properties }` to the frontend.

## Memory

- The frontend creates one `conversationId` per AI advisor session using `crypto.randomUUID()`.
- The backend stores short-lived in-memory conversation state by `conversationId`.
- The backend passes the previous OpenAI response ID into the next request for the same conversation.
- Conversation state is lost when the server restarts.

## Guardrails

- Only answer from provided property data.
- If data is missing, say it is missing.
- Do not invent property details.
- Do not give legal or financial advice.

## Response Shape

```json
{
  "message": "Based on the current search results, I recommend...",
  "properties": [
    {
      "id": 1,
      "name": "Sunset Apartments",
      "link": "/search/1",
      "reason": "Good fit because...",
      "tradeOff": "The main tradeoff is..."
    }
  ]
}
```

## Manual Testing

- Valid prompt, valid UUID conversationId, and valid query filters
- Missing question
- Empty question
- Prompt longer than 1000 characters
- Missing conversationId
- Invalid conversationId format
- Invalid query filters, such as non-numeric `priceMin`
- No matching properties
- Many matching properties, verifying the backend limits to 100
- OpenAI/API failure
