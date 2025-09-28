import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as userServices from "../services/userServices.js";
import { validateRequest } from "../middleware/validateRequest.js";

const usersRouter = Router();

// UPSERT user (crete/update)
usersRouter.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateRequest(["email", "username", "password", "name", "phoneNumber", "pictureUrl"]),
  async (req, res, next) => {
    try {
      const user = await userServices.upsertUser(req.body);
      if (!user)
        return res.status(400).json({ error: "Missing required fields" });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// GET users, optional: by username, by email
usersRouter.get("/", async (req, res, next) => {
  try {
    //If present, get by username
    const { username, email } = req.query;

    if (username) {
      const user = await userServices.getUserByUsername(username);

      return res.status(200).json(user);
    }

    //If present, get by email
    if (email) {
      const user = await userServices.getUserByEmail(email);
      res.status(200).json(user);
    }

    //Return all users
    const users = await userServices.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET user by id
usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
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

      if (req.account.type !== "admin" && req.account.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedUser = await userServices.updateUser(id, updateData);
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
      if (req.account.type !== "admin" && req.account.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const userDeleted = await userServices.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
