import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const routeProtection = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({error: "Not authenticated"});

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode) return res.status(401).json({error: "Not authenticated"});

        const user = await User.findById(decode.userID).select("-password")

        if (!user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("There was an error",error);
        res.status(500).json({error: "Internal Server Error"});        
    }
}