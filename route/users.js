import { Router } from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";
import errorHandlerSentry from "../middleware/errorHandlerSentry.js";

const usersRouter = Router();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// CREATE user
usersRouter.post("/", async (req, res, next) => {
  try {
    const { username, password, name, email, phoneNumber, pictureUrl } =
      req.body;
    const newUser = await prisma.user.create({
      data: { username, password, name, email, phoneNumber, pictureUrl },
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// GET users, optional: by username, by email
usersRouter.get("/", async (req, res, next) => {
  try {
    //If present, get by username
    const { username, email } = req.query;

    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true,
          reviews: true,
        },
      });

      if (!user)
        return res
          .status(404)
          .json({ error: `User with username ${username} not found` });

      return res.status(200).json(user);
    }

    //If present, get by email
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true,
          reviews: true,
        },
      });
      if (!user)
        return res
          .status(404)
          .json({ message: `User with email ${email} is not found!` });
      res.status(200).json(user);
    }

    //Return all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        pictureUrl: true,
        bookings: true,
        reviews: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET user by id
usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        pictureUrl: true,
        bookings: true,
        reviews: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: `User with id ${id} was not found!` });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// UPDATE user
usersRouter.put(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      if (req.account.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true, // optional
          reviews: true, // optional
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE user
usersRouter.delete(
  "/:id",
  authenticate,
  authorize(["user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (req.account.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const user = await prisma.user.delete({ where: { id: id } });
      if (!user) {
        res.status(404).json({ error: `User with id ${id} not found!` });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
