const {Client}=require('pg');
const dotenv=require('dotenv').config();
const User=new Client({
    connectionString:process.env.DB_URL,
})
User.connect()
.then(()=>console.log("database connected")
)
.catch((err)=>console.log("database earror",err)
)
module.exports=User;