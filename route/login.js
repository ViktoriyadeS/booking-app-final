import { Router } from "express";
import { login } from "../services/loginServices";  



const loginRouter = Router();

loginRouter.post("/", async (req, res, next) => {
  
  const { username, password } = req.body;

  try {
    const { role, token} = await login(username, password)
        return res.json({ message: `Succesfully logged in as a ${role}`, token });
      
    } catch (err) {
      if (err.message === "Invalid credentials"){
        return res.status(401).json({message: err.message})
      }
      next(err);
  }
});

export default loginRouter;
