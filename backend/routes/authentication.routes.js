import express from "express";
import { login, logout, profile, register, updateProfile } from "../controllers/user.controller.js";
import { routeProtection } from "../middleware/routeProtection.js";

const userRouter = express();

userRouter.post("/register",register)
userRouter.post("/login",login)
userRouter.post("/logout", logout)
userRouter.post("/updateProfile",routeProtection, updateProfile)
userRouter.get("/profile",routeProtection, profile)

export default userRouter