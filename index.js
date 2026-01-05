const express = require('express')
const app = express()
const User=require('./models/auth')
const dotenv=require('dotenv');
const path=require('path')
const bcrpt=require('bcrypt')
const cookies=require('cookie-parser');
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookies())
app.use(express.static(path.join(__dirname,'public')))
const port = process.env.PORT || 3001;
const router=require('./routes/auth_route')
app.use("/",router)

app.listen(port, () => console.log(` app listening on port ${port}!`))