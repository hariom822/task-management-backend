const express=require("express");
const router=express.Router();

const taskcontroller=require("../controller/taskcontroller");
const auth =require("../midderware/auth");

router.post("/",auth,taskcontroller.addtask);
router.get("/all",auth,taskcontroller.alltask);
router.get("/alluser",auth,taskcontroller.alluser);
router.get("/findoneuser",auth,taskcontroller.findoneuser);
router.get("/onetask/:id",auth,taskcontroller.onetask);
router.get("/usertask",auth,taskcontroller.getTasksByUser);
router.post("/update/:id",auth,taskcontroller.updatetask);
router.delete("/delete/:id",auth,taskcontroller.deletetask);
module.exports=router;