import { Router } from 'express';
import pkg from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';


const usersRouter = Router()
const { PrismaClient } = pkg;
const prisma = new PrismaClient();


// CREATE user
usersRouter.post("/", async(req, res) => {
    try {
        const { username, password, name, email, phoneNumber, pictureUrl } = req.body;
        const newUser = await prisma.user.create({
            data: { username, password, name, email, phoneNumber, pictureUrl },
        })

    res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong while creating user!"})
    }
})

// GET all users

usersRouter.get("/", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
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
      })
      res.json(users)
    } catch (error) {
      console.error("Error fetching users: ", error)
      res.status(500).json({ error: "Failed to fetch users" })
    }
  });


// GET user by id

usersRouter.get("/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: id },
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
        })

        if (!user){
            return res.status(404).json({ error: `User with id ${id} was not found!`})
        }
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "`something went wrong while fetching user"})
    }
})


// UPDATE user

usersRouter.put("/:id", authenticate, authorize(["user"]), async (req,res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (req.account.id !== id){
            return res.status(403).json({ message: "Forbidden"})
        };
        const updatedUser = await prisma.user.update({
            where: { id: id},
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phoneNumber: true,
                pictureUrl: true,
                bookings: true, // optional
                reviews: true   // optional
              },
        });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.code === "P2025") {
      // Prisma code for record not found
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE user

usersRouter.delete("/:id", authenticate, authorize(["user"]), async (req, res) => {
    try { 
        const { id } = req.params 
        if(req.account.id !== id){
            return res.status(403).json({message: "Forbidden"})
        };
        const user = await prisma.user.delete({ where: { id: id } });
        if (!user){
            res.status(404).json({ error: `User with id ${id} not found!` })
        }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

export default usersRouter