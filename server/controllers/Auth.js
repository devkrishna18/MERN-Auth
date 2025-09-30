const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { transporter } = require("../config/transport");
const { EMAIL_VERIFY_TEMPLATE , PASSWORD_RESET_TEMPLATE}=require("../config/emailTemplates");
require("dotenv").config();
exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    let haspwd;
    try {
      haspwd = await bcrypt.hash(password, 10);
    } catch (err) {
      return res.status(500).json({ message: "Error in password hashing" });
    }
    const user = await User.create({
      name,
      email,
      password: haspwd,
    });
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "welcome to our app",
      text: `Hello ${user.name},\n\nWelcome to our application! We're excited to have you on board.\n\nBest regards,\nThe Team`,
    };
    await transporter.sendMail(mailOptions);
    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "User registerd successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in user registration",
      console: err.message,
    });
  }
};
//login handeler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    const userReg = await User.findOne({ email });
    if (!userReg) {
      return res.status(400).json({
        success: false,
        message: "User not registered",
      });
    }
    const isMatch = await bcrypt.compare(password, userReg.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const payload = {
      id: userReg._id,
      email: userReg.email,
      name: userReg.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };
    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "User logined successfully",
      data: userReg,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in user login",
    });
  }
};
//logout handler
exports.logoutUser = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in user logout",
    });
  }
};
//send verify otp
exports.sendVerifyOtp = async (req, res) => {
   console.log("req.user:", req.user);
  console.log("req.body:", req.body);
  try{
  console.log("req.body raw:", req.body);
 const email = req.user.email; // comes from JWT payload
   const userId=req.user.id;
  if (!userId || !email) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  if (user.isAccountVerified === true) {
    return res.json({
      success: false,
      message: "User already verified",
    });
  }
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.verifyotp = otp;
  user.verifyotpexpiry = Date.now() + 10 * 60 * 1000;
  user.save();
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Account Verification OTP",
    // text: `Hello ${user.name},\n\nYour OTP for account verification is: ${otp}. This OTP is valid for 10 minutes.\n\nBest regards,\nThe Team`,
    html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
  };
  const mailSent = await transporter.sendMail(mailOptions);
  return res.status(200).json({
    success:true,
    message:"Otp sent to your email",
    info:mailSent.response
  })
}
catch(err){
  console.error("sendVerifyOtp error:", err);
  return res.status(500).json({
    success:false,
    message:"Error in sending otp",
    error: err.message
  })

}
};
//verify otp
exports.verifyEmail = async (req, res) => {
  try{
  const {otp } = req.body;
  const userId=req.user.id;
  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  if (user.verifyotp !== otp || user.verifyotpexpiry < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }
  user.isAccountVerified=true;
  user.verifyotp="";
  user.verifyotpexpiry=0;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Account verified successfully",
  });
}
catch(err){
  return res.status(500).json({
    success:false,
    message:"Error in verifying Otp"
  })
}
};
// Check if user is authenticated
exports.isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.json({ success: false });
  }
};
//reset otp mail
exports.resetotp=async(req,res)=>{
  try{
    const{email}=req.body;
    if(!email){
      return res.status(400).json({
        success:false,
        message:"Email is required"
      })
    }
    const user=await User.findOne({email});
if(!user){
  return res.status(400).json({
    success:false,
    message:"User not registered"
  })
}
 const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.verifyotp = otp;
  user.verifyotpexpiry = Date.now() + 10 * 60 * 1000;
  user.save();
const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    // text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.\n\nBest regards,\nThe Team`,
    html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
  };
  const mailSent = await transporter.sendMail(mailOptions);
  return res.status(200).json({
    success:true,
    message:"Reset Otp sent to your email",
    info:mailSent.response
  })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:"Error in sending reset otp"
    })
  }
};
//reset password
exports.resetPswd=async(req,res)=>{
  try{
    const{email,otp,newpassword}=req.body;
    if(!email || !otp || !newpassword){
      return res.status(400).json({
        success:false,
        message:"All fields are required"
      })
    }
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not registered"
      })
    }
    if(user.verifyotp!==otp||user.verifyotpexpiry<Date.now()){
      return res.status(400).json({
        success:false,
        message:"Invalid or expires OTP"
      })
    }
    const newpswd=await bcrypt.hash(newpassword,10);
    user.password=newpswd;
    user.verifyotp="";
    user.verifyotpexpiry=0;
    await user.save();
    return res.status(200).json({
      success:true,
      message:"Password reset successfully"
    })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:"Error in reseting password"
    })
  }
}
