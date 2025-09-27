const jwt=require('jsonwebtoken');
require("dotenv").config();
exports.auth=async(req,res,next)=>{
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(400).json({
                success:false,
                messsage:"Unauthorized"
            })
        }
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decode;
        next();

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unauthorized"
        })

    }
}