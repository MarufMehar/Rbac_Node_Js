const {hasPermission}=require('./connect')
const cookies=require('cookie-parser');
const express=require('express');
const app=express()
app.use(cookies())
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv').config();
function authorize() {
  return (req, res, next) => {
    // const token = req.headers["authorization"]?.split(" ")[1];
    const token =req.cookies.token;
    console.log("token is ",token);
    
    if (!token) {
        console.log("no token ");
      return res.status(401).json({ message: "No token provided" });
      
      
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decode :",decoded);
    
      
      const role = decoded.role;
      const permission=decoded.permission;
      console.log("role is ",role,"permisomn is",permission);
      try{
        if (hasPermission(role, permission)) {
        req.user = decoded;
        return next();
      }

      return res.status(403).json({ message: "Forbidden: No permission" });
      }
    catch(err){
        console.log(err);
        
    }
    } catch (error) {
        console.log(error);
        
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
module.exports={
    authorize,
};