const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
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
      userId: user._id,
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
    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "User registerd successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in user registration",
      console:err.message
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
      userId: userReg._id,
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

