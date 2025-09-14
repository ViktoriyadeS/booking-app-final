import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as userServices from "../services/userServices.js";

const usersRouter = Router();


// UPSERT user (crete/update)
usersRouter.post("/", authenticate,
  authorize(["admin"]),async (req, res, next) => {
  try {
    const user = await userServices.upsertUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({message: "Email or username already exists"})
    next(error);
  }
});

// GET users, optional: by username, by email
usersRouter.get("/", async (req, res, next) => {
  try {
    //If present, get by username
    const { username, email } = req.query;

    if (username) {
      const user = await userServices.getUserByUsername(username);

      if (!user)
        return res
          .status(404)
          .json({ error: `User with username ${username} not found` });

      return res.status(200).json(user);
    }

    //If present, get by email
    if (email) {
      const user = await userServices.getUserByEmail(email)
      if (!user)
        return res
          .status(404)
          .json({ message: `User with email ${email} is not found!` });
      res.status(200).json(user);
    }

    //Return all users
    const users = await userServices.getAllUsers()
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET user by id
usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userServices.getUserById(id)

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
      if (req.account.type !== "admin" && req.account.id !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedUser = await userServices.updateUser(id, updateData)

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
      const userDeleted = await userServices.deleteUser(id)
      if (!userDeleted) {
        res.status(404).json({ error: `User with id ${id} not found!` });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
