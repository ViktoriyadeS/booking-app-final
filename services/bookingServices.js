import pkg from "@prisma/client";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const createBooking = async (data) => {
  
  return prisma.booking.create({
    data: {
       user: {
        connect: { id: data.userId }
      },
      property: {
        connect: { id: data.propertyId }
      },
      checkinDate: data.checkinDate,
      checkoutDate: data.checkoutDate,
      numberOfGuests: data.numberOfGuests,
      totalPrice: data.totalPrice,
      bookingStatus: data.bookingStatus,
    },
  });
};

//GET all, optional: filter by userID
export const getBookings = async (userId) => {
  const filter = {
    isDeleted: false,
    ...(userId && { userId })
  };
  return prisma.booking.findMany({ where: filter });
};

//GET by ID
export const getBookingById = async (id) => {
  const booking = await prisma.booking.findUniqueOrThrow({where:{id: id, isDeleted: false}})
  return booking
  // return prisma.booking.findFirst({ where: { id } });
};

//UPDATE
export const updateBooking = async (id, data) => {
  await prisma.booking.findUniqueOrThrow({where:{id}})
  return prisma.booking.update({
    where: { id: id, isDeleted: false},
    data,
  });
};

//DELETE
export const deleteBooking = async (id) => {
  await prisma.booking.findUniqueOrThrow({where:{id}})
  return prisma.booking.update({ where: { id }, data: { isDeleted: true } });
};