import express from "express";
import loginRouter from "../route/login.js";
import usersRouter from "../route/users.js";
import hostRouter from "../route/hosts.js";




const app = express();

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use(express.json());
app.use("/login", loginRouter)
app.use("/users", usersRouter)
app.use("/hosts", hostRouter)



app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
