const User=require('../model/usermodel');
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken");
require("dotenv").config()
const secretkey=process.env.SECERTKEY
const nodemailer = require("nodemailer");
let oldotp= 0;


function generatePassword(length = 4) {
  const chars =
    "0123456789";
  let password = "";

  for (let i = 0; i <length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}
exports.adduser=async(req,res)=>{
    try {
        const {name,email,phone}=req.body;
        if(!name || !email || !phone ){
            return res.status(400).json({error:" all filed are required"});
        }
        const exisinguser=await User.findOne({email:email});
        if(exisinguser){
            return res.status(400).json({error:"user already exist"});
        }
        const password=generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user=new User({name,email,phone,password:hashedPassword});
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });
      //  const info= await transporter.sendMail({
      //       from: 'hariomsharmah822822@gmail.com',
      //       to: email,
      //       subject: 'Welcome to Our App',
      //       text: `Hello ${name} email ${email} phone ${phone} your account password ${password} created successfully !`
      //   });
    const info = await transporter.sendMail({
  from: '"Our App Team" <hariomsharmah822822@gmail.com>',
  to: email,
  subject: "🎉 Welcome to Our App",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome Email</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
    
    <!-- Wrapper -->
    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 6px 15px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#16a34a; padding:24px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:24px;">
          Welcome to Our App 🎉
        </h1>
        <p style="color:#dcfce7; margin-top:8px; font-size:14px;">
          Your account has been created successfully
        </p>
      </div>

      <!-- Content -->
      <div style="padding:28px; color:#374151;">
        <p style="font-size:16px;">
          Hi <strong>${name}</strong> 👋,
        </p>

        <p style="font-size:15px; margin-bottom:20px;">
          We’re excited to have you on board! Below are your login details:
        </p>

        <!-- Info Card -->
        <div style="border:1px solid #e5e7eb; border-radius:6px; padding:18px; background:#f9fafb;">
          <p style="margin:0 0 10px 0; font-size:14px;">
            <strong>📧 Email:</strong> ${email}
          </p>
          <p style="margin:0 0 10px 0; font-size:14px;">
            <strong>📞 Phone:</strong> ${phone}
          </p>
          <p style="margin:0; font-size:14px;">
            <strong>🔑 Temporary Password:</strong> ${password}
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center; margin-top:26px;">
          <a href="http://localhost:3000/login"
             style="display:inline-block; padding:12px 26px; background:#16a34a; color:#ffffff; text-decoration:none; font-size:14px; border-radius:6px;">
            Login to Your Account
          </a>
        </div>

        <p style="font-size:13px; color:#6b7280; margin-top:24px;">
          For security reasons, please change your password after logging in.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:16px; text-align:center; font-size:12px; color:#6b7280;">
        © 2026 Our App. All rights reserved.
      </div>

    </div>

  </body>
  </html>
  `
});

        
        await user.save();
       return res.status(201).json(user);
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.loginuser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({error:"all filed are required"});
        }
        const user=await User.findOne({email:email});
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        const dbpassword = user.password;
        const isMatch = await bcrypt.compare(password, dbpassword);
        if (isMatch) {
            const token = jwt.sign({ email}, secretkey,{expiresIn :'1h'});
            console.log(token);
           return res.status(200).json({ message: "Login successful",token: token,id:user._id , phone:user.phone,name:user.name });
        }else{
            return res.status(400).json({ message: "Invalid password" });
        }
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.restpassword=async(req,res)=>{
    try {
        const{email,oldpassword,newpassword,copassword}=req.body;

        if(!email || !oldpassword || !newpassword || !copassword){
            return res.status(400).json({error:"all filed are required"});
        }
        if(newpassword !== copassword){
            return res.status(400).json({error:"password dose not match"});
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        const dbpassword = user.password;
        const isMatch = await bcrypt.compare(oldpassword, dbpassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);
        user.password=hashedPassword;
        await user.save();
        res.status(200).json({message:"password updated successfully"});

    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.otp=async(req,res)=>{
    try {
        const {email}=req.body;
        if(!email){
            return res.status(400).json({error:"email is required"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        const otp=Math.floor(100000 + Math.random() * 900000);
        oldotp=otp;
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hariomsharmah822822@gmail.com',
                pass: 'pupi osza fivq vkyh'
            }
        });
       const info= await transporter.sendMail({
            from: 'hariomsharmah822822@gmail.com',
            to: email,
            subject: 'Welcome to Our App',
            text: `your otp is :=> ${otp}  !`
        });
        
        res.status(200).json({message:"otp sent successfully",otp});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.forgetpassword=async(req,res)=>{
    try {
        const{email,newpassword,copassword,otp}=req.body;
        if(!email || !newpassword || !copassword || !otp){
            return res.status(400).json({error:"all filed are required"});
        }
        if(newpassword !== copassword){
            return res.status(400).json({error:"password dose not match"});
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        console.log(oldotp , otp);
        if(oldotp != otp){
            return res.status(400).json({error:"invalid otp"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpassword, salt);
        user.password=hashedPassword;
        await user.save();
        res.status(200).json({message:"password updated successfully"});

    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.alluser=async(req,res)=>{
    try {
        const users=await User.find();
        res.status(200).json({users});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }   
}
exports.oneuser=async(req,res)=>{
    try {
        const id = req.user._id;
        const user=await User.findById(id);
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }

}
exports.updateuser=async(req,res)=>{
    try {
        const id=req.params.id;
        const updatedData=req.body;
        const user=await User.findByIdAndUpdate(id,updatedData);
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.deleteuser=async(req,res)=>{
    try {
        const id=req.params.id;
        const user=await User.findByIdAndDelete(id);
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        res.status(200).json({message:"user deleted successfully"});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}
exports.usertheme = async (req, res) => {
  try {
    const { color } = req.body; 
    
    const user= await User.findByIdAndUpdate(
      req.user.id,
    );
    console.log("color",user.theme);
    const oldtheme=user.theme
    if(!color) return   res.json({ message: " updated",  theme: oldtheme, });
    const newTheme = color === "dark" ? "light" : "dark";

    await User.findByIdAndUpdate(
      req.user.id,
      { theme: newTheme },
      { new: true }
    );
    res.json({
      message: "Theme updated",
      theme: newTheme, 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.sendmail=async(req,res)=>{
    try {
        const {email}=req.body;
        if(!email){
            return res.status(400).json({error:" email are required"});
        }
        const exisinguser=await User.findOne({email:email});
        if(exisinguser){
            return res.status(400).json({error:"user already exist"});
        }

        const password=generatePassword();
        console.log("password",password);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user=new User({email,password:hashedPassword});
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });
    //    const info= await transporter.sendMail({
    //         from: 'hariomsharmah822822@gmail.com',
    //         to: email,
    //         subject: 'Welcome to Our App',
    //         text: `Hello ${name} email ${email} phone ${phone} your account password ${password} created successfully !`
    //     });
 const info = await transporter.sendMail({
  from: '"Our App Team" <hariomsharmah822822@gmail.com>',
  to: email,
  subject: "📌 Hariom Sharma invited you to a board",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Board Invitation</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, sans-serif;">

  <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0c66e4; padding:24px; text-align:center;">
      <h1 style="color:#ffffff; margin:0; font-size:22px;">
        You’ve been invited to a board
      </h1>
    </div>

    <!-- Content -->
    <div style="padding:28px; color:#172b4d;">

      <p style="font-size:16px; margin-bottom:12px;">
        <strong>Hariom Sharma</strong> invited you to their board
      </p>

      <h2 style="margin:0 0 16px 0; font-size:18px; color:#0c66e4;">
        🗂 My Trello Board
      </h2>
         <h2 style="margin:0 0 16px 0; font-size:18px; color:#0c66e4;">
        your email ${email} and password ${password}
      </h2>
      <p style="font-size:14px; line-height:1.6; margin-bottom:20px;">
        Join them on <strong>Our App</strong> to capture, organize, and tackle your to-dos from anywhere.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center; margin:28px 0;">
        <a href="http://localhost:5173/signup"
           style="background:#0c66e4; color:#ffffff; text-decoration:none; padding:12px 28px;
                  border-radius:6px; font-size:14px; font-weight:bold; display:inline-block;">
          Go to Board
        </a>
      </div>

      <!-- Divider -->
      <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;" />

      <!-- App Description -->
      <h3 style="font-size:16px; margin-bottom:12px;">
        Our App is your productivity powerhouse 🚀
      </h3>

      <p style="font-size:14px; line-height:1.6; margin-bottom:12px;">
        <strong>Inbox:</strong> Capture ideas and to-dos the moment they come to mind.
      </p>

      <p style="font-size:14px; line-height:1.6; margin-bottom:12px;">
        <strong>Boards:</strong> Organize tasks from “To Do” to “Mission Accomplished”.
      </p>

      <p style="font-size:14px; line-height:1.6;">
        <strong>Planner:</strong> Drag, drop, and schedule what matters most.
      </p>

      <p style="font-size:13px; color:#6b7280; margin-top:28px;">
        If you weren’t expecting this invite, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f5f7; padding:16px; text-align:center; font-size:12px; color:#6b7280;">
      © 2026 Our App · All rights reserved
    </div>

  </div>

</body>
</html>
`
});

      await user.save();
      console.log("user",user);
       return res.status(201).json({message:"message send successfully","user":user});
    } catch (error) {
        res.status(500).json({error:"internal server error",});
    }
}