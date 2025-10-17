import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const createHost = async (hostData) => {
  const { email, username, password, name, phoneNumber, pictureUrl, aboutMe } = hostData;

  const activeHost = await prisma.host.findFirst({
    where: { username, active: true },
  });

  if (activeHost) {
    throw { statusCode: 409, message: "Host with this email already exists" };
  }

  const host = await prisma.host.upsert({
    where: { username },
    update: { username, password, name, phoneNumber, pictureUrl, aboutMe, active: true },
    create: { username, password, name, email, phoneNumber, pictureUrl, aboutMe },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      active: true,
      properties: true,
    },
  });

  return host;
};

//GET all (active)
export const getAllHosts = async () => {
  return prisma.host.findMany({
    where: { active: true },

    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      properties: {
        where: { isDeleted: false }, //only include active properties
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          rating: true,
        },
      },
    },
  });
};

//GET by ID
export const getHostById = async (id) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: { id, active: true },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      active: true,
      properties: {
        where: { isDeleted: false }, //only include active properties
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          rating: true,
        },
      },
    },
  });
  return host;
};

//GET by Name
export const getHostByName = async (hostName) => {
  const host = await prisma.host.findFirstOrThrow({
    where: { name: hostName },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      active: true,
      properties: {
        where: { isDeleted: false }, //only include active properties
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          rating: true,
        },
      },
    },
  });
  return host;
};

//UPDATE by ID
export const updateHost = async (id, hostData) => {
  await prisma.host.findUniqueOrThrow({ where: { id } });
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
      active: true,
      properties: {
        where: { isDeleted: false }, //only include active properties
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          rating: true,
        },
      },
    },
  });
};

//DELETE
export const deleteHostById = async (id) => {
  //Check if host exists
  const host = await prisma.host.findUniqueOrThrow({ where: { id } });

  //Soft delete the host
  const updatedHost = await prisma.host.update({
    where: { id },
    data: { active: false },
  });

  //Soft delete all properties belonging to this host
  await prisma.property.updateMany({
    where: { hostId: id },
    data: { isDeleted: true },
  });

  //Return the updated host info
  return updatedHost;
};
