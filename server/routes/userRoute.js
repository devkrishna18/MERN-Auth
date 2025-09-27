const express=require("express");
const router=express.Router();
const {auth}=require("../middlewares/auth");
const {getUserDetails}=require("../controllers/userDetails");
router.get("/data",auth,getUserDetails);
module.exports=router;