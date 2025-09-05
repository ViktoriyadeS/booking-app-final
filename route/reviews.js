import { Router } from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const reviewsRouter = Router();

//CREATE review (only for user)
reviewsRouter.post(
  "/",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const review = await prisma.review.create({
        data: req.body,
        userId: req.account.id,
      });
      res.status(201).json({ message: "Review is posted!" });
    } catch (error) {
      next(error);
    }
  }
);

//GET all
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany();
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

//GET by ID
reviewsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id: id },
    });
    if (!review) {
      res.status(404).json({
        message: `Review with id ${id} is not found`,
      });
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
});

//UPDATE review (only for user)
reviewsRouter.put(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const review = await prisma.review.findUnique({
        where: { id: id },
      });
      if (!review) {
        res.status(404).json({
          message: `Review with id ${id} is not found`,
        });
      }
      const updated = await prisma.review.update({
        where: { id: id },
        data: req.body,
      });
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

//DELETE review (only for user)
reviewsRouter.delete(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const review = await prisma.review.findUnique({
        where: { id: id },
      });
      if (!review) {
        res.status(404).json({
          message: `Review with id ${id} is not found`,
        });
      }
      await prisma.review.delete({
        where: { id: id },
      });
      res.status(200).json("Review is deleted!");
    } catch (error) {
      next(error);
    }
  }
);
export default reviewsRouter;
