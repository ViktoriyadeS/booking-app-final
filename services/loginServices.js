import jwt from "jsonwebtoken";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const secretKey = process.env.AUTH_SECRET_KEY || "my_secret_key";

export const login = async (username, password) => {
  //check users
  let account = await prisma.user.findUnique({ where: { username } });
  if (account) {
    if (account.password === password) {
      const token = jwt.sign({ id: account.id, type: "user" }, secretKey, {
        expiresIn: "1h",
      });
      return { role: "user", token };
    }
    throw new Error("Invalid credentials");
  }

  //check hosts
  account = await prisma.host.findUnique({ where: { username } });
  if (account) {
    if (account.password === password) {
      const token = jwt.sign({ id: account.id, type: "host" }, secretKey, {
        expiresIn: "1h",
      });
      return { role: "host", token };
    }
    throw new Error("Invalid credentials");
  }

  //check admins
  account = await prisma.admin.findUnique({
    where: { username },
  });
  if (account) {
    if (account.password === password) {
      const token = jwt.sign({ id: account.id, type: "admin" }, secretKey, {
        expiresIn: "1h",
      });
      return { role: "admin", token };
    }
    throw new Error("Invalid credentials");
  }

  //No user/host/admin found
  throw new Error("Invalid credentials");
};
