import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as bookingServices from "../services/bookingServices.js";
import { getPropertyById } from "../services/propertyServices.js";
import { getUserById } from "../services/userServices.js";

const bookingsRouter = Router();

//CREATE booking (user only)
bookingsRouter.post(
  "/",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { userId, propertyId, checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;

      // Check: property exists
      const property = await getPropertyById(propertyId)
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      let bookingUserId;

      if (req.account.type === "admin") {
        // Admin can assign booking to any user
        if (!userId) {
          return res
            .status(400)
            .json({ message: "Admin must provide a userId for booking" });
        }
        const user = await getUserById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        bookingUserId = userId;
      } else {
        // Users can only book for themselves
        const user = await getUserById(req.account.id)
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        bookingUserId = req.account.id;
      }

      const booking = await bookingServices.createBooking({
          userId: bookingUserId,
          propertyId,
          checkinDate,
          checkoutDate,
          numberOfGuests,
          totalPrice,
          bookingStatus
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
      const booking = await bookingServices.getBookingById(req.params.id);
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });
      if (req.account.type !== "admin" && booking.userId !== req.account.id) {
        return res
          .status(403)
          .json({
            message: "Unauthorized: only your own bookings can be updated",
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
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });
      if (req.account.type !== "admin" && booking.userId !== req.account.id) {
        return res
          .status(403)
          .json({
            message: "Unauthorized: only your own bookings can be deleted",
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
