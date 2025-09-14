import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  // Read JSON files
  const users = JSON.parse(fs.readFileSync("prisma/data/users.json", "utf-8")).users;
  const hosts = JSON.parse(fs.readFileSync("prisma/data/hosts.json", "utf-8")).hosts;
  const properties = JSON.parse(fs.readFileSync("prisma/data/properties.json", "utf-8")).properties;
  const amenities = JSON.parse(fs.readFileSync("prisma/data/amenities.json", "utf-8")).amenities;
  const bookings = JSON.parse(fs.readFileSync("prisma/data/bookings.json", "utf-8")).bookings;
  const reviews = JSON.parse(fs.readFileSync("prisma/data/reviews.json", "utf-8")).reviews;
  
  console.log("Seeding database...");

  // --- Admin --- 
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123", 
      email: "admin@example.com",
    },
  });

  // --- Users ---
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        username: user.username,
        password: user.password,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        pictureUrl: user.pictureUrl
      },
    });
  }

  // --- Hosts ---
  for (const host of hosts) {
    await prisma.host.upsert({
      where: { email: host.email },
      update: {}, // do nothing if it exists
      create: {
        id: host.id,
        username: host.username,
        password: host.password,
        name: host.name,
        email: host.email,
        phoneNumber: host.phoneNumber,
        pictureUrl: host.pictureUrl,
        aboutMe: host.aboutMe || "", // include aboutMe
      },
    });
  }

  // --- Amenities ---
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { id: amenity.id },
      update: {},
      create: amenity,
    });
  }

  // Seed Properties
for (const property of properties) {
    const createdProperty = await prisma.property.create({
      data: {
        id: property.id,
        title: property.title,
        description: property.description,
        location: property.location,
        pricePerNight: property.pricePerNight,
        bedroomCount: property.bedroomCount,
        bathRoomCount: property.bathRoomCount,
        maxGuestCount: property.maxGuestCount,
        rating: property.rating,
        host: { connect: { id: property.hostId } },
      },
    });
  
    // Connect amenities by name
    if (property.amenities && property.amenities.length > 0) {
      for (const amenityName of property.amenities) {
        const amenity = await prisma.amenity.findUnique({
          where: { name: amenityName },
        });
  
        if (amenity) {
          await prisma.propertyAmenity.create({
            data: {
              propertyId: createdProperty.id,
              amenityId: amenity.id,
            },
          });
        }
      }
    }
  }

  // --- Bookings ---
  for (const booking of bookings) {
    await prisma.booking.upsert({
      where: { id: booking.id },
      update: {},
      create: {
        id: booking.id,
        checkinDate: new Date(booking.checkinDate),
        checkoutDate: new Date(booking.checkoutDate),
        numberOfGuests: booking.numberOfGuests,
        totalPrice: booking.totalPrice,
        bookingStatus: booking.bookingStatus,
        user: { connect: { id: booking.userId } },
        property: { connect: { id: booking.propertyId } },
      },
    });
  }

  // --- Reviews ---
  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: { connect: { id: review.userId } },
        property: { connect: { id: review.propertyId } },
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
