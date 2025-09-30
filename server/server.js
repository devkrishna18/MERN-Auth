const express=require("express");
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
const cors=require("cors");
const cookieParser=require("cookie-parser");
require("dotenv").config();
require('./config/dbconnect').connectDB();
const port=process.env.PORT || 5000;
app.use(cookieParser());
const allowedOrigin=['http://localhost:5173']
app.use(cors({origin:allowedOrigin,credentials:true}));
app.get("/",(req,res)=>{
    res.send("API is running");
})
app.use("/api/auth",require("./routes/authRoute"));
app.use("/api/user",require("./routes/userRoute"));
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})