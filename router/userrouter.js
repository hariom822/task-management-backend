const express =require('express');
const router=express.Router();

const usercontroller=require('../controller/usercontroller');
const auth =require("../midderware/auth");

router.post('/',usercontroller.adduser);
router.post('/send',usercontroller.sendmail);
router.post('/login',usercontroller.loginuser);
router.post("/theme",auth, usercontroller.usertheme);
router.post("/reset",usercontroller.restpassword);
router.post("/forget",usercontroller.forgetpassword);
router.post("/otp",usercontroller.otp);
router.get("/all",auth,usercontroller.alluser);
router.get("/oneuser",auth,usercontroller.oneuser);
router.post("/update/:id",usercontroller.updateuser);
router.delete("/delete/:id",usercontroller.deleteuser);                                             



module.exports=router;