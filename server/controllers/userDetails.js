const User=require("../models/user");
exports.getUserDetails=async(req,res)=>{
    try{
        const userId=req.user.id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        return res.status(200).json({
            success:true,
            user:{
                name:user.name,
                email:user.email,
                isAccountVerified:user.isAccountVerified
            }
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Error in fetching user details"
        })
            }
}