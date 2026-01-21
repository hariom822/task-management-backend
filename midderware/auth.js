const User =require("../model/usermodel");
const jwt =require("jsonwebtoken");
const secretkey=process.env.SECERTKEY
module.exports= async(req,res,next)=>{
    try{ 
    const authheader = req.headers.authorization;
    if(!authheader){
        return res.status(400).json({error:"authorization not found"});
    }
    const token =authheader.split(" ")[1];
    if(!token){
        return res.status(400).json({error:"token is not found"});
    }
    const decode =jwt.verify(token,secretkey);
    if(!decode){
        return res.status(400).json({error:"invalid user"});
    }
    const email =decode.email;
    const user =await User.findOne({email});
    if(!user){
        return res.status(400).json({error:"user not found"});
    }
    console.log(user);
    req.user=user;
    next();
}
catch(error){
 if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(500).json({message:"server error ",error})
    }
}