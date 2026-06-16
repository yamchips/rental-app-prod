import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Location, Property } from "@prisma/client";
import prisma from "../../prisma/prisma";
import { wktToGeoJSON } from "@terraformer/wkt";
import axios from "axios";
import { Request, Response } from "express";
import { propertySearchSchema } from "../schemas/propertySearchSchema";
import { getPropertiesByFilters } from "../services/propertyService";
import z from "zod";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parseResult = propertySearchSchema.safeParse(req.query);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Invalid property filters",
        errors: z.treeifyError(parseResult.error),
      });
      return;
    }
    const properties = await getPropertiesByFilters(parseResult.data);

    res.json(properties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

export const getProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });
    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];
      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${error.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log("files are: ", files);
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;
    const photoUrls: string[] = [];
    for (const file of files) {
      const key = `properties/${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        photoUrls.push(fileUrl);
      } catch (err) {
        console.error(`Failed to upload ${file.originalname}:`, err);
      }
    }
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      },
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (rentaltest@gmail.com)",
      },
    });
    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0];
    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
    INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
    VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, 
    ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)) 
    RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;`;
    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${error.message}` });
  }
};

export const getPropertyLeases = async (req: Request, res: Response) => {
  const { id } = req.params;
  const propertyId = Number(id);

  try {
    const leases = await prisma.lease.findMany({
      where: { propertyId },
      include: { tenant: true },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error getting property leases: ${error.message}` });
  }
};
