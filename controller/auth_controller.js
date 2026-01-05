const User = require('../models/auth')
const jwt = require('jsonwebtoken')
const bcrpt = require('bcrypt')
const dotenv = require('dotenv')
const { sendPermission } = require('../config/connect')
const { getAllTasksForteamlead, getAllTasksForManager, getUserTasks } = require('./auth_function')
const bcrypt = require('bcrypt');
const { randomid } = require('../public/javascript/function')

// async function login_page(req, res) {
//     return res.render("login")
// }

async function login_page(req, res) {
    return res.render("oraganization_owner")
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log("fill all information");
        return res.render("login", {
            message: "fill all information"
        })
    }
    if (email) {
        var query = "select password ,role from users where email=$1";
        const result = await User.query(query, [email]);
        if (result.rows.length == 0) {
            console.log("invalid info");
            return res.render("login", {
                message: "invalid creadutionals"
            })
        }
        const hash_password = result.rows[0].password;

        bcrpt.compare(password, hash_password, (err, res) => {
            if (err) {
                console.log("invalid info");
                return res.render("login", {
                    message: "invalid creadutionals"
                })
            }
            if (!res) {
                console.log("invalid info");
                return res.render("login", {
                    message: "invalid creadutionals"
                })
            }
            const role = result.rows[0].role;
            const permission = sendPermission(role);
            const token = jwt.sign({ email: email, role: role, permission: permission }, process.env.JWT_SECRET, { expiresIn: "1h" })
            res.cookie("token", token);
            res.redirect("/homepage")
        })
    }
}
async function homepage(req, res) {
    const permissions = req.user.permission;
    const email = req.user.email;
    const role = req.user.role;

    let tasks = [];
    let canCreate = false;
    let canDelete = false;


    if (permissions.includes("viewtask")) {
        tasks = await getUserTasks(email);
        canCreate = true;
    }


    if (permissions.includes("viewalltask")) {
        tasks = await getAllTasksForManager();
        canCreate = permissions.includes("create_task");
    }


    if (permissions.includes("viewalltasks")) {
        tasks = await getAllTasksForAdmin();
        canDelete = permissions.includes("deletetask");
        canCreate = permissions.includes("create_task");
    }

    res.render("home", {
        tasks,
        canCreate,
        canDelete,
        role
    });
}
async function viewtask(email, role) {
    if (email) {
        try {
            var query = "select * from task where email=$1";
            const result = await User.query(query, [email]);
            return result.rows;
        }
        catch (err) {
            console.log("earror detect ");
        }
    }
    if (role) {
        try {
            var query = "select * from task where role_id=$1";
            const result = await User.query(query, [role]);
            return result.rows;
        }
        catch (err) {
            console.log("earror detect ", err);
        }
    }
}
async function create_task(req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        console.log("enter all details");
        return
    }
    try {
        var query = "insert into tasks(name,email) values($1,$2)";
        const result = await User.query(query, [name, email]);
        return res.send("data updated");
    }
    catch (e) {
        console.log("earror detect ", e);
    }

}
// async function signup(req, res) {
//     return res.render("register")
// }
async function signup(req, res) {
    return res.render("oraganization_creating")
}
async function register(req, res) {
    try {
        const { name, email, role, password, age } = req.body;

        if (!name || !email || !role || !password) {
            console.log("fill all information");
            return res.render("login", { message: "fill all information" });
        }

        const existingUser = await User.query("SELECT * FROM users WHERE email=$1", [email]);
        if (existingUser.rows.length > 0) {
            console.log("user already registered");
            return res.render("register", { message: "user already registered" });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        await User.query(
            "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)",
            [name, email, hashedPassword, role]
        );


        const permission = sendPermission(role);
        const token = jwt.sign(
            { email, role, permission },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token);

        res.redirect('/homepage');

    } catch (err) {
        console.error("Error in registration:", err);
        res.render("register", { error: "something went wrong" });
    }
}
async function oraganization_create(req, res) {
    const { organization_name, organization_owner, email, password, phone_number } = req.body;
    let samevalue = null;
    try {
        if (email) {
            var query = "select * from organizations where email=$1";
            const result = await User.query(query, [email]);
            if (result.rows.length > 0) {
                console.log("email alredy exists");
                return res.render("oraganization_creating", { message: "user already registered" });
            }
            const row_id = randomid();
            samevalue = row_id;
            const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
            var query = "insert into organization_owner(row_id,email,password,phone_number)values($1,$2,$3,$4)";
            const res = await User.query(query, [row_id, email, hashedPassword, phone_number]);
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        var query = "insert into organizations(row_id,organization_name,organization_owner,email,password,phone_number)values($1,$2,$3,$4,$5,$6)";
        const row_id = randomid();
        const result = await User.query(query, [row_id, organization_name, samevalue, email, hashedPassword, phone_number]);
        const token = jwt.sign({ email: email, roww_id: row_id, }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token);
        res.redirect("/organization-owner/homepage")
    }
    catch (er) {
        console.log("earror found", er);
        res.render("oraganization_creating");

    }
}
async function oraganization_owner_login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render("oraganization_owner");
    }
    try {
        var query = "select * from organization_owner where email=$1";
        const result = await User.query(query, [email]);
        if (result.rows.length == 0) {
            return res.render("oraganization_owner", {
                message: "no user avalaible",
            });
        }
        const oraganizatio_id=result.rows[0].row_id;
        const hashed_password = result.rows[0].password;
        bcrpt.compare(password, hashed_password, (err, result) => {
            if (err) {
                return res.render("oraganization_owner", {
                    message: "no user avalaible",
                });
            }
            if (!result) {
                return res.render("oraganization_owner", {
                    message: "no user avalaible",
                });
            }
            const token = jwt.sign({
                email: email,}, process.env.JWT_SECRET, { expiresIn: "24h" })
            res.cookie("token", token);
            res.redirect("/organization-owner/homepage")
        })
    }
    catch (err) {
        console.log("earror found in login", err);
    }
}
async function oraganization_homepage(req, res) {
    const token = req.cookies.token;
    console.log("token is ", token);

    if (!token) {
        console.log("no token ");
        return res.status(401).json({ message: "No token provided" });
    }
    const msg = req.query.msg || null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode :", decoded);
    const email = decoded.email;
    let oraganizatio_id = decoded.roww_id;
    if(!oraganizatio_id){
        var query="select row_id from organizations where email=$1";
    const result=await User.query(query,[email]);
    oraganizatio_id=result.rows[0].row_id
    }
    console.log("oraganization id",oraganizatio_id);
    
    try {
        var query = "select * from leads where organization_id=$1";
        const result = await User.query(query, [oraganizatio_id]);
        var qy = "select * from employees where organization_id=$1";
        const employes=await User.query(qy, [oraganizatio_id]);
        res.render("oraganization_homepage", {
            ownerName: email,
            leads: result.rows,
            employees:employes.rows,
            organizationId: oraganizatio_id,
            msg: msg
        })
    }
    catch (err) {
        console.log("earror found in login", err);
    }
}
async function add_employe(req, res) {
    try {
        const { organization_id, username, phone_number, email, role } = req.body;
        const row_id = randomid();

        const query = `
            INSERT INTO employees(row_id,organization_id,username,phone_number,email,role)
            VALUES ($1,$2,$3,$4,$5,$6)
        `;
        await User.query(query, [row_id, organization_id, username, phone_number, email, role]);
        res.redirect("/organization-owner/homepage?msg=Employee%20added%20successfully");
    } catch (err) {
        console.log(err);
        res.redirect("/organization-owner/homepage?msg=Error%20adding%20employee");
    }
}
async function userlogin(req, res) {
    return res.render("employe_login")
}
async function employe_login(req, res) {
    const { email } = req.body;
    var query = "select * from employees where email=$1";
    const result = await User.query(query, [email]);
    if (result.rows.length == 0) {
        return res.render("employe_login")
    }
    try {
        const organization_id = result.rows[0].organization_id;
        const employe_id = result.rows[0].row_id;
        const role = result.rows[0].role;
        const permission = sendPermission(role);
        const token = jwt.sign({
        email: email,organization_id:organization_id,employe_id:employe_id,role:role,permission:permission
        }, process.env.JWT_SECRET, { expiresIn: "24h" })
        res.cookie("token", token);
        return res.redirect("/employe_homepage")
    }
    catch (err) {
        console.log("earrorrrr", err);
        return res.render("employe_login")
    }
}
// async function eemploye_homepage(req, res) {
//     const permissions = req.user.permission;
//     const email = req.user.email;
//     const role = req.user.role;
//     const organization_id=req.user.organization_id;
//     console.log("oraganization user id",organization_id);
    
//     const employe_id=req.user.employe_id;
//     let tasks = [];
//     let canCreate = false;
//     let canDelete = false;
//     if (permissions.includes("viewtask") &&permissions.includes("create_task") ) {
//         tasks = await getUserTasks(employe_id);
//         canCreate = true;
//     }

//     if (permissions.includes("viewalltask") && permissions.includes("deletetask") && permissions.includes("create_task")  ) {
//         tasks = await getAllTasksForManager(organization_id);
//         canCreate = permissions.includes("create_task");
//         canDelete = permissions.includes("deletetask");
//     }
//     if (permissions.includes("viewalltasks") && permissions.includes("create_task")) {
//         tasks = await getAllTasksForteamlead(organization_id);
//         canCreate = permissions.includes("create_task");
//     }
//     res.render("oraganization_employes", {
//         role,
//             leads: tasks,
//         canCreate,
//         canDelete,
//         organizationId:organization_id,
//         employe_id,
     
//     });
// }
async function eemploye_homepage(req, res) {
    const permissions = req.user.permission;
    const role = req.user.role;
    const organization_id = req.user.organization_id;
    const employe_id = req.user.employe_id;

    console.log("ORGANIZATION ID:", organization_id);

    let leads = [];
    let canCreate = false;
    let canDelete = false;


    if (permissions.includes("viewtask")) {
        leads = await getUserTasks(employe_id);
        canCreate = permissions.includes("create_task");
    }


    if (permissions.includes("viewalltask") && role === "team_lead") {
        leads = await getAllTasksForteamlead(organization_id);
        canCreate = permissions.includes("create_task");
    }

  
    if (permissions.includes("viewalltasks") && role === "manager") {
        leads = await getAllTasksForManager(organization_id);
        canCreate = permissions.includes("create_task");
        canDelete = permissions.includes("deletetask");
    }

    res.render("oraganization_employes", {
        role,
        leads,
        canCreate,
        canDelete,
        organizationId: organization_id,
        employe_id,
    });
}

async function leads_create(req,res) {
    const {organization_id,employe_id,phone_number,duration,call_status,tags,remarks,call_type,opportunities}=req.body;
    try{
        const row_id = randomid();
        var query="insert into leads (row_id,organization_id,employee_id,phone_number,duration,call_status,tags,remarks,call_type,opportunities) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";
        const result=await User.query(query,[row_id,organization_id,employe_id,phone_number,duration,call_status,tags,remarks,call_type,opportunities]);
        return res.redirect("/employe_homepage")
    }
    catch(err){
        console.log(err);
        return res.redirect("/employe_homepage")
        
    }
}
module.exports = {
    login_page,
    login,
    signup,
    register,
    homepage,
    oraganization_owner_login,
    oraganization_create,
    oraganization_homepage,
    add_employe,
    userlogin,
    employe_login,
    eemploye_homepage,
    leads_create
}