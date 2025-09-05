import { Router } from "express";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const loginRouter = Router();

loginRouter.post("/", async (req, res, next) => {
  const secretKey = process.env.AUTH_SECRET_KEY || "my-secret-key";
  const { username, password } = req.body;

  try {
    //Check users
    let account = await prisma.user.findUnique({
      where: { username: username },
    });
    if (account) {
      if (account.password === password) {
        const token = jwt.sign({ id: account.id, type: "user" }, secretKey, {
          expiresIn: "1h",
        });
        return res.json({ message: "Succesfully logged in as a USER", token });
      } else {
        return res.status(401).json({ message: "Invalid credentials!" });
      }
    }

    //Check hosts
    account = await prisma.host.findUnique({ where: { username: username } });
    if (account) {
      if (account.password === password) {
        const token = jwt.sign({ id: account.id, type: "host" }, secretKey);
        return res.json({ message: "Succesfully logged in as a HOST!", token });
      } else {
        return res.status(401).json({ message: "Invalid credentials!" });
      }
    }

    //When no user/host accounts found
    res.status(404).json({ message: "Username not found!" });
  } catch (err) {
    next(err)
  }
});

export default loginRouter;
