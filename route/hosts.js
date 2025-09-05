import express from "express";
import pkg from "@prisma/client";
import { authenticate, authorize } from "../middleware/auth.js";


const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const hostRouter = express.Router();

//CREATE host
hostRouter.post("/", async (req, res) => {
    try {
        const host = await prisma.host.create({ data: req.body });
        res.status(201).json(host);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message})
    }
});

//GET all hosts
hostRouter.get("/", async (req, res) => {
    try {
        const hosts = await prisma.host.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phoneNumber: true,
                pictureUrl: true,
                properties: true,
              }
        });
        res.json(hosts)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message})
    }
});

//GET by ID
hostRouter.get("/:id", async (req, res) => {
    try {
        const host = await prisma.host.findUnique({ where: { id: req.params.id}});
        if (!host) return res.status(404).json({ message: "Host not found!"});
        res.json(host)
    } catch (error) {
        console.error(error)
        res.status(500).json({error: error.message})
    }
});

//UPDATE host
hostRouter.put("/:id", authenticate, authorize(["host"]), async (req,res)=>{
    try {
        if (req.account.id !== req.params.id) return res.status(403).json({message: "Forbidden"});
        const updatedHost = await prisma.host.update({
            where: { id: req.params.id},
            data: req.body,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phoneNumber: true,
                pictureUrl: true,
                properties: true, // optional
              },
        })
        res.json(updatedHost)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }
});

//DELETE host
hostRouter.delete("/:id", authenticate, authorize(["host"]), async (req,res)=>{
    try {
        if (req.account.id !== req.params.id) return res.status(403).json({ message: " Forbidden"});
        await prisma.host.delete({ where: {id: req.params.id }})
        res.json({ message: "Host deleted"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message})
    }
})

export default hostRouter