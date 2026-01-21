const express = require('express');
const mongoose = require('mongoose');
const cron = require("node-cron");
const cors = require('cors');

require("dotenv").config()

const fileupload=require("express-fileupload")
const app = express();
const port=process.env.PORT;

const url =process.env.URL
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(fileupload());
mongoose.connect(url)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

const userrouter = require("./router/userrouter");
app.use("/users",userrouter)
const taskrouter =require("./router/taskrouter");
app.use("/task",taskrouter)

cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
