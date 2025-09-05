import { Router } from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const bookingsRouter = Router();

//CREATE booking (user only)
bookingsRouter.post(
  "/",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const booking = await prisma.booking.create({
        data: {
          ...req.body,
          userId: req.account.id,
        },
      });
      res
        .status(201)
        .json({ message: "Congratulations! Property is booked!" }, booking);
    } catch (error) {
      next(error);
    }
  }
);

//GET all bookings; optional: GET by userID
bookingsRouter.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const bookings = await prisma.booking.findMany({
        where: { userId: userId },
      });
      if (!bookings)
        return res
          .status(404)
          .json({ message: "Bookings not found for this user" });
      res.status(200).json(bookings);
    }
    const allBookings = await prisma.booking.findMany();
    res.status(200).json(allBookings);
  } catch (error) {
    next(error);
  }
});
//GET by ID;
bookingsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: id },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});

//UPDATE by bookings ID
bookingsRouter.put(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params.id;
      const booking = await prisma.booking.findUnique({
        where: { id: id },
      });
      if (!booking) {
        return res.status(404).json({ message: "Booking is not found" });
      } else if (booking.userId !== req.account.id) {
        return res.status(403).json({
          message: "Unauthorized: you can only update your own bookings",
        });
      }
      const updated = await prisma.booking.update({
        where: { id: id },
        data: req.body,
      });
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
);

//DELETE by bookings ID
bookingsRouter.delete(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id: id },
      });
      if (!booking) {
        return res.status(404).json({ message: "Booking is not found" });
      } else if (booking.userId !== req.account.id) {
        return res.status(403).json({
          message: "Unauthorized: you can only delete your own bookings",
        });
      }
      await prisma.booking.delete({
        where: { id: id },
      });
      res.status(200).json({ message: "Booking is deleted!" });
    } catch (error) {
      next(error);
    }
  }
);
export default bookingsRouter;
