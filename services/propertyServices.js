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
export const getProperties = async (filters) => {
    return prisma.property.findMany({
        where: filters,
        include: { host: true, amenities: true, bookings: true}
    })
}

//GET property by ID
export const getPropertyById = async (id) => {
    return prisma.property.findUnique({
        where: {id},
        include: {amenities: true, host: true, reviews: true, bookings: true}
    })
}

//UPDATE property
export const updateProperty = async (id, updateData) => {
    return prisma.property.update({
        where: {id},
        data: updateData
    })
}

//DELETE property
export const deleteProperty = async (id) => {
    return prisma.property.delete({where: {id}})
}

//ADD amenities
export const assignAmentitiesToProperty = async (propertyId, amenityNames) =>{
    const allAmenities = await prisma.amenity.findMany({
        where: {name: {in: amenityNames}}
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