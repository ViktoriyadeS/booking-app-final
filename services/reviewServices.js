import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const createReview = async (reviewData) => {
  const { userId, propertyId, rating, comment } = reviewData;
  if(!userId || !propertyId || !rating || !comment) return null;

  return prisma.review.create({
    data: { userId: userId, propertyId: propertyId, rating: rating, comment: comment },
  });
};

//GET all
export const getReviews = async ({ userId, propertyId } = {}) => {
  const filter = { isDeleted: false };
  if (userId) filter.userId = userId;
  if (propertyId) filter.propertyId = propertyId;
  
  return prisma.review.findMany({
    where: filter,
    include: { user: true, property: true },
  });
};

//GET by ID
export const getReviewById = async (id) => {
  const review = await prisma.review.findUniqueOrThrow({where: {id: id, isDeleted: false}, include: { user: true, property: true },})
  return review
};

//UPDATE
export const updateReview = async (id, data) => {
  await prisma.review.findUniqueOrThrow({where: {id: id, isDeleted: false}})
  return prisma.review.update({ where: { id }, data });
}
  

//DELETE
export const deleteReview = async (id) => {
  await prisma.review.findUniqueOrThrow({ where: {id: id, isDeleted: false}})
  return prisma.review.update({ where: { id }, data: { isDeleted: true } });
};
