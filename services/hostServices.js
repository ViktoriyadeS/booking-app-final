import pkg from "@prisma/client";
import toBooleanConverter from "../utils/converter.js";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const upsertHost = async (hostData) => {
  const { email, username, password, name, phoneNumber, pictureUrl, aboutMe, active} =
    hostData;
   if (!email ) return null;
   const updateData = { 
      ...(email && { email }),
      ...(username && { username }),
      ...(password && { password }),
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(pictureUrl && { pictureUrl }),
      ...(active !== undefined && { active: toBooleanConverter(active) })
    }
    if(!username || !password || !name || !phoneNumber || !pictureUrl || !aboutMe) return null;
    const createData = {
      username,
      password,
      name,
      email,
      phoneNumber,
      pictureUrl,
      aboutMe,
    }
  return prisma.host.upsert({
    where: { email },
    update: updateData,
    create: createData,
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
};


//GET all (active)
export const getAllHosts = async () => {
  return prisma.host.findMany({
    where: { active: true},
    
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


//GET by ID
export const getHostById = async (id) => {
  await prisma.host.findUniqueOrThrow({ where: {id}})
  return prisma.host.findFirst({
    where: { id },
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
};


//GET by Name
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
      active: true,
      properties: true,
    },
  });
};

//UPDATE by ID
export const updateHost = async (id, hostData) => {
  await prisma.host.findUniqueOrThrow({ where: {id}})
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
      properties: true,
    },
  });
};

//DELETE
export const deleteHostById = async (id) => {
  await prisma.host.findUniqueOrThrow({where: {id}})
  return prisma.host.update({ where: { id }, data: { active: false } });
}
