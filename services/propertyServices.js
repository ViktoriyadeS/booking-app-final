import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//CREATE poperty
export const createProperty = async (data, hostId) => {
  const { hostId: _, ...rest } = data;
  return prisma.property.create({
    data: {
      ...rest,
      host: {
        connect: { id: hostId },
      },
    },
  });
};

//GET properties
export const getProperties = async (filters = {}) => {
  const properties = await prisma.property.findMany({
    where: {
      isDeleted: false,
      ...filters,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
        },
      },
      amenities: {
        where: { isDeleted: false }, // optional filter
        include: {
          amenity: {
            // this pulls the actual Amenity table
            select: { name: true },
          },
        },
      },
      _count: {
        select: { bookings: true }, // Only return bookings count
      },
    },
  });

  return properties.map((property) => ({
    ...property,
    amenities: property.amenities.map((a) => a.amenity.name),
  }));
};

//GET property by ID
export const getPropertyById = async (id) => {
  return prisma.property.findFirstOrThrow({
    where: { id: id, isDeleted: false },
    include: {
      host: {
        select: {
          id: true,
          name: true,
        },
      },
      amenities: {
        where: { isDeleted: false }, // optional filter
        include: {
          amenity: {
            // this pulls the actual Amenity table
            select: { name: true },
          },
        },
      },
      _count: {
        select: { bookings: true }, // Only return bookings count
      },
    },
  });
};

//UPDATE property
export const updateProperty = async (id, updateData) => {
  const updatedProp = await prisma.property.updateMany({
    where: { id, isDeleted: false },
    data: updateData,
  });
  if (updatedProp.count === 0) {
    throw { statusCode: 404, message: "Property not found" };
  }
  // Return the updated property
  return prisma.property.findFirstOrThrow({
    where: { id, isDeleted: false },
    include: {
      host: { select: { id: true, name: true } },
      amenities: {
        where: { isDeleted: false },
        include: { amenity: { select: { name: true } } },
      },
      _count: { select: { bookings: true } },
    },
  });
};

//DELETE property
export const deleteProperty = async (id) => {
  const delProperty = await prisma.property.updateMany({
    where: { id, isDeleted: false },
    data: { isDeleted: true },
  });
  if (delProperty.count === 0) {
    throw { statusCode: 404, message: "Property not found" };
  }

  return prisma.property.findFirstOrThrow({
    where: { id, isDeleted: true },
  });
};

//ADD amenities
export const assignAmentitiesToProperty = async (propertyId, amenityNames) => {
  const allAmenities = await prisma.amenity.findMany({
    where: { name: { in: amenityNames }, isDeleted: false },
  });

  if (allAmenities.length < 1) return null;
  const links = await Promise.all(
    allAmenities.map((amenity) =>
      prisma.property.create({
        data: {
          propertyId,
          amenityId: amenity.id,
        },
      })
    )
  );
  return links;
};
