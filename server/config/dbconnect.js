const mongoose=require("mongoose");
require("dotenv").config();
exports.connectDB=async()=>{
        await mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));  
}