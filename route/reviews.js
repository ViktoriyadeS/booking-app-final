import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as reviewServices from "../services/reviewServices.js";

const reviewsRouter = Router();

//CREATE review (only for user)
reviewsRouter.post(
  "/",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const review = await reviewServices.createReview()
      res.status(201).json({ message: "Review is posted!" });
    } catch (error) {
      next(error);
    }
  }
);

//GET all
// GET all reviews (optional: filter by userId or propertyId)
reviewsRouter.get("/", async (req, res, next) => {
  try {
    const { userId, propertyId } = req.query;
    const reviews = await reviewServices.getReviews({ userId, propertyId });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

//GET by ID
reviewsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewServices.getReviewById(id)
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
      const review = await reviewServices.getReviewById(id)
      if (!review) {
        res.status(404).json({
          message: `Review with id ${id} is not found`,
        });
      }
      if (req.account.type !== "admin" && review.userId !== req.account.id) {
      return res.status(403).json({ message: "Unauthorized: only your own reviews can be updated" });
    }
      const updated = await reviewServices.updateReview(id, req.body)
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
      const review = await reviewServices.getReviewById(id)
      if (!review) {
        res.status(404).json({
          message: `Review with id ${id} is not found`,
        });
      }
      if (req.account.type !== "admin" && review.userId !== req.account.id) {
      return res.status(403).json({ message: "Unauthorized: only your own reviews can be deleted" });
    }
      await reviewServices.deleteReview(id)
      res.status(200).json("Review is deleted!");
    } catch (error) {
      next(error);
    }
  }
);
export default reviewsRouter;
