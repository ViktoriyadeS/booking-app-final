import { Router } from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const hostRouter = Router();

//CREATE host
hostRouter.post("/", async (req, res, next) => {
  try {
    const host = await prisma.host.create({ data: req.body });
    res.status(201).json(host);
  } catch (error) {
    next(error);
  }
});

//GET all hosts; option: get by name
hostRouter.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;
    if (name) {
      const host = await prisma.host.findUnique({
        where: { name: name },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          properties: true,
        },
      });
      if (!host)
        return res.status(404).json({ message: `Host ${name} not found!` });
      res.status(200).json(host);
    }

    const hosts = await prisma.host.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        pictureUrl: true,
        properties: true,
      },
    });
    res.status(200).json(hosts);
  } catch (error) {
    next(error);
  }
});

//GET by ID
hostRouter.get("/:id", async (req, res, next) => {
  try {
    const host = await prisma.host.findUnique({ where: { id: req.params.id } });
    if (!host) return res.status(404).json({ message: "Host not found!" });
    res.json(host);
  } catch (error) {
    next(error);
  }
});

//UPDATE host
hostRouter.put(
  "/:id",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      if (req.account.id !== req.params.id)
        return res.status(403).json({ message: "Forbidden" });
      const updatedHost = await prisma.host.update({
        where: { id: req.params.id },
        data: req.body,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          properties: true, // optional
        },
      });
      res.status(200).json(updatedHost);
    } catch (error) {
      next(error);
    }
  }
);

//DELETE host
hostRouter.delete(
  "/:id",
  authenticate,
  authorize(["host"]),
  async (req, res, next) => {
    try {
      if (req.account.id !== req.params.id)
        return res.status(403).json({ message: " Forbidden" });
      await prisma.host.delete({ where: { id: req.params.id } });
      res.json({ message: "Host deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default hostRouter;
