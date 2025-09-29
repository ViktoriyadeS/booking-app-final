import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as bookingServices from "../services/bookingServices.js";
import { validateRequest } from "../middleware/validateRequest.js";


const bookingsRouter = Router();

//CREATE booking (user only)
bookingsRouter.post(
  "/",
  authenticate,
  authorize(["user"]), 
  validateRequest([
    "userId",
    "propertyId",
    "checkinDate",
    "checkoutDate",
    "numberOfGuests",
    "totalPrice",
    "bookingStatus",
  ]),
  async (req, res, next) => {
    try {
      const data = req.body;

      const booking = await bookingServices.createBooking({
        userId: data.userId,
        propertyId: data.propertyId,
        checkinDate: data.checkinDate,
        checkoutDate: data.checkoutDate,
        numberOfGuests: data.numberOfGuests,
        totalPrice: data.totalPrice,
        bookingStatus: data.bookingStatus
      }
      );

      res.status(201).json({
        message: "Congratulations! Property is booked!",
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

//GET all bookings; optional: GET by userID
bookingsRouter.get("/", async (req, res, next) => {
  try {
    const bookings = await bookingServices.getBookings(req.query.userId);
    if (req.query.userId && bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "Bookings not found for this user" });
    }
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

//GET by ID;
bookingsRouter.get("/:id", async (req, res, next) => {
  try {
    const booking = await bookingServices.getBookingById(req.params.id);
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
      const booking = await bookingServices.getBookingById(req.params.id);
      if (req.account.type !== "admin" && booking.userId !== req.account.id) {
        return res
          .status(403)
          .json({
            message: "Forbidden" ,
          });
      }
      const updated = await bookingServices.updateBooking(
        req.params.id,
        req.body
      );
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
      const booking = await bookingServices.getBookingById(req.params.id);
      if (req.account.type !== "admin" && booking.userId !== req.account.id) {
        return res
          .status(403)
          .json({
            message: "Forbidden",
          });
      }
      await bookingServices.deleteBooking(req.params.id);
      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);
export default bookingsRouter;
