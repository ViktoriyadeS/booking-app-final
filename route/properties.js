import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  assignAmentitiesToProperty,
} from "../services/propertyServices.js";

const propertiesRouter = Router();

// CREATE property (host or admin)
propertiesRouter.post(
  "/",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      let hostId;

      if (req.account.type === "admin") {
        // Admin must provide hostId in body
        if (!req.body.hostId) {
          return res
            .status(400)
            .json({ message: "Admin must provide a hostId" });
        }
        hostId = req.body.hostId;
      } else {
        // Host uses their own ID from token
        hostId = req.account.id;
      }

      const property = await createProperty(req.body, hostId);
      res.status(201).json(property);
    } catch (err) {
      next(err);
    }
  }
);

// GET all properties; optional: filters
propertiesRouter.get("/", async (req, res, next) => {
  try {
    const { location, pricePerNight } = req.query;
    const filters = {};

    if (location) {
      //partial matches allowed
      filters.location = { contains: location };
    }

    if (pricePerNight) {
      // price = user input
      const price = Number(pricePerNight);
      if (!isNaN(price)) {
        filters.pricePerNight = { equals: price }; //strict match
      }
    }

    const properties = await getProperties(filters);
    return res.status(200).json(properties);
  } catch (err) {
    next(err);
  }
});

// GET property by ID
propertiesRouter.get("/:id", async (req, res, next) => {
  try {
    const property = await getPropertyById(req.params.id);
    res.status(200).json(property);
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
      const property = await getPropertyById(req.params.id);
      if (req.account.type !== "admin" && property.hostId !== req.account.id) {
        return res.status(403).json({
          message: "Forbidden: you can only update your own properties!",
        });
      }
      const updated = await updateProperty(req.params.id, req.body);
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
      const property = await getPropertyById(req.params.id);
      if (property.hostId !== req.account.id && req.account.type !== "admin") {
        return res.status(403).json({
          message: "Forbidden: you can only delete your own properties!",
        });
      }
      await deleteProperty(req.params.id);
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
      const property = await getPropertyById(req.params.id);
      if (property.hostId !== req.account.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      //Find all amenties by Name
      const links = await assignAmentitiesToProperty(
        property.id,
        req.body.amenities
      );
      if (!links)
        return res.status(404).json({ message: "No matching amenties found!" });
      return res.json({ message: "Amenities assigned", links });
    } catch (err) {
      next(err);
    }
  }
);

export default propertiesRouter;
