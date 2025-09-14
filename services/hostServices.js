import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const upsertHost = async (hostData) => {
  const { email, username, password, name, phoneNumber, pictureUrl, aboutMe } =
    hostData;

  return prisma.host.upsert({
    where: { email },
    update: { username, password, name, phoneNumber, pictureUrl, aboutMe },
    create: {
      username,
      password,
      name,
      email,
      phoneNumber,
      pictureUrl,
      aboutMe,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      properties: true,
    },
  });
};

export const getAllHosts = async () => {
  return prisma.host.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      properties: true,
    },
  });
};

export const getHostById = async (id) => {
  return prisma.host.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      properties: true,
    },
  });
};

export const getHostByName = async (hostName) => {
  return prisma.host.findFirst({
    where: { name: hostName },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      properties: true,
    },
  });
};

export const updateHost = async (id, hostData) => {
  return prisma.host.update({
    where: { id: id },
    data: hostData,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      properties: true,
    },
  });
};

export const deleteHostById = async (id) =>
  prisma.host.delete({ where: { id } });
