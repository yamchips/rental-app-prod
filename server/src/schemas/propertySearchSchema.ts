import { z } from "zod";

export const propertySearchSchema = z.object({
  favoriteId: z
    .string()
    .optional()
    .transform((value) => value?.split(",").map(Number)),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  beds: z.coerce.number().optional(),
  baths: z.coerce.number().optional(),
  propertyType: z.string().optional(),

  squareFeetMin: z.coerce.number().optional(),
  squareFeetMax: z.coerce.number().optional(),
  amenities: z
    .string()
    .optional()
    .transform((value) => value?.split(",")),

  availableFrom: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});
