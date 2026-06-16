import { Prisma, Property } from "@prisma/client";
import prisma from "../../prisma/prisma";

export type PropertySearchFilters = {
  favoriteIds?: number[];
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  squareFeetMin?: number;
  squareFeetMax?: number;
  amenities?: string[];
  availableFrom?: string;
  latitude?: number;
  longitude?: number;
  limit?: number;
};

export type PropertyWithLocation = Property & {
  location: {
    id: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
};

export const getPropertiesByFilters = async ({
  favoriteIds,
  priceMin,
  priceMax,
  beds,
  baths,
  propertyType,
  squareFeetMin,
  squareFeetMax,
  amenities,
  availableFrom,
  latitude,
  longitude,
  limit,
}: PropertySearchFilters): Promise<PropertyWithLocation[]> => {
  const whereConditions: Prisma.Sql[] = [];
  if (favoriteIds) {
    whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIds)})`);
  }
  if (priceMin) {
    whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
  }
  if (priceMax) {
    whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
  }
  if (beds) {
    whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
  }
  if (baths) {
    whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
  }
  if (squareFeetMin) {
    whereConditions.push(
      Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`,
    );
  }
  if (squareFeetMax) {
    whereConditions.push(
      Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`,
    );
  }
  if (propertyType && propertyType !== "any") {
    whereConditions.push(
      Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`,
    );
  }
  if (amenities) {
    const amenitiesLiteral = Prisma.sql`ARRAY[${Prisma.join(
      amenities.map((a) => Prisma.sql`${a}`),
    )}]::"Amenity"[]`;
    whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesLiteral}`);
  }
  if (availableFrom && availableFrom !== "any") {
    const availableFromDate =
      typeof availableFrom === "string" ? availableFrom : null;
    if (availableFromDate) {
      const date = new Date(availableFromDate);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l
              WHERE l."propertyId" = p.id
              AND l."startDate" <= ${date.toISOString()}::timestamp
            )`,
        );
      }
    }
  }
  if (latitude && longitude) {
    const radiusInKilometers = 1000;
    const degrees = radiusInKilometers / 111; // convert kilometers to degrees

    whereConditions.push(
      Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${degrees}
        )`,
    );
  }
  const completeQuery = Prisma.sql`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address',l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
        ${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
    `;
  return prisma.$queryRaw<PropertyWithLocation[]>(completeQuery);
};
