const express=require('express');
const router=express.Router();
const {verifyToken}=require('../public/javascript/function')
const {authorize}=require('../config/authorization')
const {login,login_page,signup,register,leads_create,homepage,oraganization_create,employe_login,eemploye_homepage,oraganization_owner_login,oraganization_homepage,add_employe,userlogin}=require('../controller/auth_controller')
router.get("/",login_page);
router.post("/login",login);
router.get("/signup",signup);
router.post("/register",register);
router.get("/homepage",authorize(),homepage);
router.post("/organizations/create",oraganization_create)
router.post("/organization-owner/login",oraganization_owner_login)
router.get("/organization-owner/homepage",verifyToken,oraganization_homepage)
router.post("/employees/add",verifyToken,add_employe)
router.get("/userlogin",userlogin)
router.post("/employee/login",employe_login)
router.get("/employe_homepage",authorize(),eemploye_homepage)
router.post("/leads/create",verifyToken,leads_create)

module.exports=router;