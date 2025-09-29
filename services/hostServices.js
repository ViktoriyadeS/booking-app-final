import pkg from "@prisma/client";
import toBooleanConverter from "../utils/converter.js";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const upsertHost = async (hostData) => {
  const { email, username, password, name, phoneNumber, pictureUrl, aboutMe, active} =
    hostData;
   
   const updateData = { 
      ...(email && { email }),
      ...(username && { username }),
      ...(password && { password }),
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(pictureUrl && { pictureUrl }),
      ...(active !== undefined && { active: toBooleanConverter(active) })
    }
    
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
  const host = await prisma.host.findUniqueOrThrow({ where: {id, active: true}, select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
      aboutMe: true,
      active: true,
      properties: true,
    },})
  return host
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
      properties: true,
    },
  });
  return host;
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
