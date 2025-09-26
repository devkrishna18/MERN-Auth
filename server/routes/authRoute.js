const express=require("express");
const router=express.Router();
const {signUp,login,logoutUser}=require("../controllers/Auth");
router.post("/signUp",signUp);
router.post("/login",login);
router.post("/logout",logoutUser);
module.exports=router;