import pkg from "@prisma/client";
import toBooleanConverter from "../utils/converter.js";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const createUser = async (userData) => {
  const { email, username, password, name, phoneNumber, pictureUrl } = userData;

  // First check if an active user exists
  const activeUser = await prisma.user.findFirst({
    where: { username, active: true },
  });

  if (activeUser) {
    throw { statusCode: 409, message: "User with this username already exists" };
  }

  // Upsert: update inactive user or create new
  const user = await prisma.user.upsert({
    where: { username }, 
    update: {
      email,
      password,
      name,
      phoneNumber,
      pictureUrl,
      active: true, // reactivate if inactive
    },
    create: {
      username,
      password,
      name,
      email,
      phoneNumber,
      pictureUrl,
      active: true
    },
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
    where: {active: true},
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
    where: { username , active: true},
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
    where: { email , active: true},
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
    where: { id: id, active: true },
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
    where: { id: id },
  });
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
    where: { id: id },
  });
  const deletedUser = await prisma.user.update({
    where: { id: id },
    data: { active: false },
  });
  return deletedUser;
};
