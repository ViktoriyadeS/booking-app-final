import pkg from "@prisma/client";
import toBooleanConverter from "../utils/converter.js";
import { validate as isUuid } from "uuid";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const upsertUser = async (userData) => {
  const { email, username, password, name, phoneNumber, pictureUrl, active } =
    userData;
    if (!email ) return null;
    const updateData = {
      ...(email && { email }),
      ...(username && { username }),
      ...(password && { password }),
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(pictureUrl && { pictureUrl }),
      ...(active !== undefined && { active: toBooleanConverter(active) }),
    };
    if(!username || !password || !name || !phoneNumber || !pictureUrl) return null;
    const createData = {
      username: username,
      password: password,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      pictureUrl: pictureUrl,
    }
  const user = await prisma.user.upsert({
    where: { email: email },
    update: updateData,
    create: createData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true,
      reviews: true,
    },
  });
  return user;
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true,
      reviews: true,
    },
  });
};

export const getUserByUsername = async (username) => {
  return prisma.user.findUniqueOrThrow({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true,
      reviews: true,
    },
  });
};

export const getUserByEmail = async (email) => {
  return prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true,
      reviews: true,
    },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true,
      reviews: true,
    },
  });
};

export const updateUser = async (id, userData) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {id: id}
    })
    const updateData = {
    ...userData,
    ...(userData.active !== undefined && {
      active: toBooleanConverter(userData.active),
    }),
  };

  return prisma.user.update({
    where: { id: id },
    data: updateData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      bookings: true, // optional
      reviews: true, // optional
    },
  });
};

export const deleteUser = async (id) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {id: id}
    })
    const deletedUser = await prisma.user.update({
    where: { id: id },
    data: { active: false },
  });
  return deletedUser;
};
