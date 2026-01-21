const Task=require("../model/taskmodel");
const nodemailer = require("nodemailer");
const mongoose=require("mongoose")
const cron = require('node-cron');
const uploadimg=require('../utility/cloudnary')
require("dotenv").config()

exports.addtask=async(req,res)=>{
      console.log(">>>>req.body",req.body)
      console.log(">>>>req.file",req.files)
      
        const {task,date,assign_to}=req.body;
        const userid=req.user._id;
        const data={task,date,assign_by:userid,assign_to};
     
        if(!task || !date || !assign_to){
            return res.status(400).json({error:"all fields are required"});
        }
         const Emailid=await req.user.email;
        // mail.sendmail("hello",Emailid)
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            }
        });
       
        // const info=await transporter.sendMail({
        //     from:'hariomsharmah822822@gmail.com',
        //     to:Emailid,
        //     subject:"New Task Assigned",
        //     text:`You have been assigned a new task: ${task} with due date: ${date}`
        // });
        const info = await transporter.sendMail({
  from: '"Task Manager" <hariomsharmah822822@gmail.com>',
  to: Emailid,
  subject: "📌 New Task Assigned",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Task Assigned</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, sans-serif;">
    
    <!-- Wrapper -->
    <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#2563eb; padding:20px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:22px;">
          New Task Assigned
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:24px; color:#374151;">
        <p style="font-size:16px; margin-bottom:16px;">
          Hello 👋,
        </p>

        <p style="font-size:15px; margin-bottom:20px;">
          You have been assigned a new task. Please find the details below:
        </p>

        <!-- Task Card -->
        <div style="border:1px solid #e5e7eb; border-radius:6px; padding:16px; background:#f9fafb;">
          <p style="margin:0 0 8px 0; font-size:14px;">
            <strong>📝 Task:</strong> ${task}
          </p>
          <p style="margin:0; font-size:14px;">
            <strong>📅 Due Date:</strong> ${date}
          </p>
        </div>

        <!-- Button -->
        <div style="text-align:center; margin-top:24px;">
          <a href="#"
            style="display:inline-block; padding:12px 24px; background:#2563eb; color:#ffffff; text-decoration:none; font-size:14px; border-radius:6px;">
            View Task
          </a>
        </div>

        <p style="font-size:13px; color:#6b7280; margin-top:24px;">
          Please make sure to complete the task before the due date.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:16px; text-align:center; font-size:12px; color:#6b7280;">
        © 2026 Task Manager. All rights reserved.
      </div>
    </div>

  </body>
  </html>
  `
});

       
         const imageFile = Array.isArray(req.files.image)
          ? req.files.image[0]
          : req.files.image;
            console.log("info.messageId",imageFile);
          const data1=[imageFile]
        const imagee = await uploadimg.uploadImage(data1);
        console.log("image>>>>>>", imagee);
      const imageurl=imagee[0].url
      console.log("imagrurl",imageurl)
       const data2={ ...data,Image:imageurl}
       console.log(data2);
        const taskdata=new Task(data2);
        await taskdata.save();
       return res.status(200).json(taskdata,{message:"task added successfully"});
   
}
exports.alluser=async(req,res)=>{
    try {
        const tasks=await Task.find().populate("assign_to");
        res.status(200).json({tasks});
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}
exports.alltask=async(req,res)=>{
    try {
        const tasks=await Task.find();
        res.status(200).json({tasks});
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}

exports.onetask=async(req,res)=>{
    try {
        const id=req.params.id;
        const task=await Task.findById(id);
        if(!task){
            return res.status(400).json({error:"task not found"});
        }
        res.status(200).json({task});
    }
        catch (error) {
        res.status(500).json({message:"server error"});
    }
}
exports.updatetask=async(req,res)=>{
    try {
        const id=req.params.id;
        const updatedData=req.body;
        console.log(id);
        console.log(updatedData);
        const task=await Task.findByIdAndUpdate(id,updatedData);
        console.log("task",task);
        if(!task){
            return res.status(400).json({error:"task not found"});
        }
        res.status(200).json({task});
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}
exports.deletetask=async(req,res)=>{
    try {
        const id=req.params.id;
        const task=await Task.findByIdAndDelete(id);
        if(!task){
            return res.status(400).json({error:"task not found"});
        }
        res.status(200).json({message:"task deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}
// exports.findoneuser=async(req,res)=>{
//     try {
//         const userId=req.user._id;
//         // console.log("userid", userId);
//         if(!userId){
//             return res.status(400).json({message:"user id not found"});
//         }
//         const assignto=await Task.find({assign_to : userId}).populate("assign_to").populate("assign_by");
//         if(!assignto){
//             return res.status(400).json({message:"no  user found"});
//         }
//         const assignby=await Task.find({assign_by : userId}).populate("assign_to").populate("assign_by");
//         if(!assignby){
//             return res.status(400).json({message:"no  user found"});
//         }
//         console.log("          >>>>>>>  >>>>>>> >>>>",assignby,assignto)
//         res.status(200).json({assignto,assignby});
//     } catch (error) {
//         res.status(500).json({message:"server error"});
//     }
// }
exports.findoneuser = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log(">>>>>>>>>>>>>id",req.user._id)

    const assignby = await Task.aggregate([
      {
        $match: {
         
        assign_by: userId 
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assign_to",
          foreignField: "_id",
          as: "assign_to"
        }
      },
       {
        $lookup: {
          from: "users",
          localField: "assign_by",
          foreignField: "_id",
          as: "assign_by"
        }
      },
      {
        $unwind: "$assign_to"
      },
       {
        $unwind: "$assign_by"
      },
    ]);
     const assignto = await Task.aggregate([
      {
        $match: {
          assign_to: userId 
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assign_to",
          foreignField: "_id",
          as: "assign_to"
        }
      },
       {
        $lookup: {
          from: "users",
          localField: "assign_by",
          foreignField: "_id",
          as: "assign_by"
        }
      },
      {
        $unwind: "$assign_to"
      },
       {
        $unwind: "$assign_by"
      },
    ]);
  //  console.log(">>>>>>>>>>>>> >>>>>>> >>>>>",assignby,assignto)
    res.status(200).json({assignto,assignby});

  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

exports.getTasksByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userId", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    const tasks = await Task.find({ assign_by: userId })
      .populate("assign_to", "name")
      console.log("tasks", tasks);

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
