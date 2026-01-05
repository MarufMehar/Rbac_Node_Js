const User = require('../models/auth');

async function getUserTasks(employe_id) {
    try {
        const query = "SELECT * FROM leads WHERE employee_id=$1";
        const result = await User.query(query, [employe_id]);
        return result.rows;  
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function getAllTasksForManager(organization_id) {
    try {
        const query = "SELECT * FROM leads where organization_id=$1";
        const result = await User.query(query,[organization_id]);
        return result.rows;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function getAllTasksForteamlead(organization_id) {
    try {
        const query = "SELECT * FROM leads where organization_id=$1";
        const result = await User.query(query,[organization_id]);
        return result.rows;
    } catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = {
    getUserTasks,
    getAllTasksForManager,
    getAllTasksForteamlead
};
