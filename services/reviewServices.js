import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE
export const createReview = async (reviewData, userId) =>
  prisma.review.create({ data: {...reviewData, userId} });

//GET all
export const getReviews = async ({ userId, propertyId } = {}) => {
  const filter = {};
  if (userId) filter.userId = userId;
  if (propertyId) filter.propertyId = propertyId;

  return prisma.review.findMany({
    where: filter,
    include: { user: true, property: true },
  });
};
//GET by ID
export const getReviewById = async (id) =>
  prisma.review.findUnique({ where: { id }, include: { user: true, property: true } });

//UPDATE
export const updateReview = async (id, data) =>
  prisma.review.update({ where: { id }, data });

//DELETE
export const deleteReview = async (id) =>
  prisma.review.delete({ where: { id } });