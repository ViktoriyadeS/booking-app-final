import pkg from "@prisma/client";


const { PrismaClient} = pkg;
const prisma = new PrismaClient;

//CREATE poperty
export const createProperty = async (data, hostId) => {
  const { hostId: _, ...rest } = data; 
  return prisma.property.create({
    data: {
      ...rest,
      host: {
        connect: { id: hostId }
      }
    }
  });
};

//GET properties
export const getProperties = async (filters = {}) => {
    return prisma.property.findMany({
        where: {
            isDeleted: false,
            ...filters
        },
        include: { host: true, amenities: true, bookings: true}
    })
}

//GET property by ID
export const getPropertyById = async (id) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {id, isDeleted: false},
        include: {amenities: true, host: true, reviews: true, bookings: true }
    })
    return property
}

//UPDATE property
export const updateProperty = async (id, updateData) => {
    await prisma.property.findUniqueOrThrow({where: {id: id}})
    return prisma.property.update({
        where: {id, isDeleted: false},
        data: updateData
    })
}

//DELETE property
export const deleteProperty = async (id) => {
    await prisma.property.findUniqueOrThrow({where: {id: id, isDeleted:false}})
    return prisma.property.update({where: {id}, data: { isDeleted: true } })
}

//ADD amenities
export const assignAmentitiesToProperty = async (propertyId, amenityNames) =>{
    const allAmenities = await prisma.amenity.findMany({
        where: {name: {in: amenityNames}, isDeleted: false}
    })

    if (allAmenities.length < 1) return null;
    const links = await Promise.all(allAmenities.map((amenity)=> prisma.property.create({
        data: {
            propertyId,
            amenityId: amenity.id
        }
    })))
    return links

}