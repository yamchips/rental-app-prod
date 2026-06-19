"use client";

import { useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Minus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/state/redux";
import { cleanParams } from "@/lib/utils";
import Link from "next/link";

type RecommendedProperty = {
  id: number;
  name: string;
  link: string;
  reason: string;
  tradeOff: string;
};

type AdvisorResponse = {
  message: string;
  properties: RecommendedProperty[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  properties?: RecommendedProperty[];
};

const AiPropertyAdvisor = () => {
  const filters = useAppSelector((state) => state.global.filters);
  const conversationIdRef = useRef(crypto.randomUUID());

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const buildQueryString = () => {
    const params = cleanParams({
      location: filters.location,
      priceMin: filters.priceRange?.[0],
      priceMax: filters.priceRange?.[1],
      beds: filters.beds,
      baths: filters.baths,
      propertyType: filters.propertyType,
      squareFeetMin: filters.squareFeet?.[0],
      squareFeetMax: filters.squareFeet?.[1],
      amenities: filters.amenities?.join(","),
      availableFrom: filters.availableFrom,
      latitude: filters.coordinates?.[1],
      longitude: filters.coordinates?.[0],
    });

    return new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ).toString();
  };

  const handleSubmit = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmedQuestion },
    ]);
    setQuestion("");
    setIsLoading(true);

    try {
      const queryString = buildQueryString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ai/property-advisor?${queryString}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: trimmedQuestion,
            conversationId: conversationIdRef.current,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = (await response.json()) as AdvisorResponse;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          properties: data.properties,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not generate a recommendation right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-white"
        aria-label="Open AI Property Advisor"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-xl border bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <Bot className="h-5 w-5" />
          <span>AI Property Advisor</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          aria-label="Minimize AI Property Advisor"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Ask me to compare the current search results, find the best value,
            or recommend properties for your needs.
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary-700 px-3 py-2 text-sm text-white"
                : "mr-auto max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm"
            }
          >
            <p>{message.content}</p>

            {message.properties && message.properties.length > 0 && (
              <div className="mt-3 space-y-3">
                {message.properties.map((property) => (
                  <div key={property.id} className="border-t pt-2">
                    <Link
                      href={property.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary-700 underline"
                    >
                      {property.name}
                    </Link>
                    <p className="mt-1">
                      <span className="font-medium">Reason:</span>{" "}
                      {property.reason}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">Tradeoff:</span>{" "}
                      {property.tradeOff}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="mr-auto flex max-w-[90%] items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about these properties..."
            className="min-h-12 resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />

          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isLoading}
            size="icon"
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiPropertyAdvisor;
