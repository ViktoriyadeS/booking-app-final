import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const upsertUser = async (userData) => {
    const {email, username, password, name, phoneNumber, pictureUrl} = userData;

    const user = await prisma.user.upsert({
        where: {email},
        update: {
            username,
            password,
            name,
            phoneNumber,
            pictureUrl
        },
        create: {
            username,
            password,
            name,
            phoneNumber,
            pictureUrl
        },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            phoneNumber: true,
            pictureUrl: true,
            bookings: true,
            reviews: true,
        }
    });
    return user;
};

export const getAllUsers = async () => {
    return prisma.user.findMany({
        select:{
            id: true,
            username: true,
            name: true,
            email: true,
            phoneNumber: true,
            pictureUrl: true,
            bookings: true,
            reviews: true
        }
    })
}

export const getUserByUsername = async (username) =>{
    return prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true,
          reviews: true,
        },
      });
}

export const getUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true,
          reviews: true,
        },
      });
}

export const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: {id},
        select:{
            id: true,
            username: true,
            name: true,
            email: true,
            phoneNumber: true,
            pictureUrl: true,
            bookings: true,
            reviews: true
        }
    })
}

export const updateUser = async (id, userData) => {
    return prisma.user.update({
        where: { id: id },
        data: userData,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          pictureUrl: true,
          bookings: true, // optional
          reviews: true, // optional
        },
      });
}

export const deleteUser = async (id) =>{
    return prisma.user.delete({
        where: {id}
    })
}