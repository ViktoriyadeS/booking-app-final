import { Router } from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const propertiesRouter = Router();

// CREATE property (host only)
propertiesRouter.post(
  "/",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      const property = await prisma.property.create({
        data: {
          ...req.body,
          hostId: req.account.id,
        },
      });
      res.status(201).json(property);
    } catch (err) {
      next(err);
    }
  }
);

// GET all properties; optional: by location and/or pricePerNight
propertiesRouter.get("/", async (req, res, next) => {
  try {
    const { location, pricePerNight } = req.query;
    const filters = {};

    if (location) {
      //partial matches allowed
      filters.location = { contains: location, mode: "insensitive" };
    }

    if (pricePerNight) {
      // price >= user input
      filters.pricePerNight = { gte: Number(pricePerNight) };
    }

    const properties = await prisma.property.findMany({
      where: filters,
      include: { host: true, amenities: true, bookings: true },
    });

    res.status(200).json(properties);
  } catch (err) {
    next(err);
  }
});

// GET property by ID
propertiesRouter.get("/:id", async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { amenities: true, host: true, reviews: true, bookings: true },
    });
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

// UPDATE property (host only, must own it)
propertiesRouter.put(
  "/:id",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      const property = await prisma.property.findUnique({
        where: { id: req.params.id },
      });
      if (!property) {
        return res
          .status(404)
          .json({ message: `Property with id ${req.params.id} is not found!` });
      } else if (property.hostId !== req.account.id) {
        return res.status(403).json({
          message: "Forbidden: you can only update your own properties!",
        });
      }
      const updated = await prisma.property.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE property
propertiesRouter.delete(
  "/:id",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      const property = await prisma.property.findUnique({
        where: { id: req.params.id },
      });
      if (!property) {
        return res
          .status(404)
          .json({ message: `Property with id ${req.params.id} is not found!` });
      } else if (property.hostId !== req.account.id) {
        return res.status(403).json({
          message: "Forbidden: you can only delete your own properties!",
        });
      }
      await prisma.property.delete({ where: { id: req.params.id } });
      res.json({ message: "Property deleted" });
    } catch (err) {
      next(err);
    }
  }
);

//Extra (not specified in assignment)
// Assign amenities to property (host only)
propertiesRouter.post(
  "/:id/amenities",
  authenticate,
  authorize(["host"]),
  async (req, res) => {
    try {
      const { amenities } = req.body;
      const property = await prisma.property.findUnique({
        where: { id: req.params.id },
      });

      if (!property) {
        return res.status(404).json({ message: "Property not found!" });
      } else if (property.hostId !== req.account.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      //Find all amenties by Name
      const allAmenities = await prisma.amenity.findMany({
        where: { name: { in: amenities } },
      });
      if (allAmenities.length < 1)
        return res.status(404).json({ message: "No matching amenties found!" });
      // Create propertyAmenity links
      const links = await Promise.all(
        allAmenities.map((amenity) =>
          prisma.propertyAmenity.create({
            data: {
              propertyId: property.id,
              amenityId: amenity.id,
            },
          })
        )
      );

      res.json({ message: "Amenities assigned", links });
    } catch (err) {
      next(err);
    }
  }
);

export default propertiesRouter;
