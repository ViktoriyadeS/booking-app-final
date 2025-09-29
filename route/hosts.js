import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import * as hostsServices from "../services/hostServices.js";
import { validateRequest } from "../middleware/validateRequest.js";

const hostRouter = Router();

//UPSERT host
hostRouter.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateRequest(["email", "username", "password", "name", "phoneNumber", "pictureUrl", "aboutMe"]),
  async (req, res, next) => {
    try {
      const host = await hostsServices.upsertHost(req.body);
      res.status(201).json(host);
    } catch (error) {
      next(error);
    }
  }
);

//GET all hosts; option: get by name
hostRouter.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;

    if(name) {
      const host = await hostsServices.getHostByName(name);
      res.status(200).json(host);
    }
    //Return all hosts
    const hosts = await hostsServices.getAllHosts();
    res.status(200).json(hosts);
  } catch (error) {
    next(error);
  }
});

//GET by ID
hostRouter.get("/:id", async (req, res, next) => {
  try {
    const host = await hostsServices.getHostById(req.params.id);
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
      const { id } = req.params;
      if (req.account.type !== "admin" && req.account.id !== id)
        return res.status(403).json({ message: "Forbidden" });

      const updatedHost = await hostsServices.updateHost(
        req.params.id,
        req.body
      );
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
      if (req.account.type !== "admin" && req.account.id !== id)
        return res.status(403).json({ message: "Forbidden" });
      const { id } = req.params;
      const hostDeleted = await hostsServices.deleteHostById(id);
      res.json({ message: "Host deleted succesfully!" });
    } catch (error) {
      next(error);
    }
  }
);

export default hostRouter;
