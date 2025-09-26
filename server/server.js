const express=require("express");
const app=express();
const cors=require("cors");
const cookieParser=require("cookie-parser");
require("dotenv").config();
require('./config/dbconnect').connectDB();
const port=process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));
app.get("/",(req,res)=>{
    res.send("API is running");
})
app.use("/api/auth",require("./routes/authRoute"));
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})