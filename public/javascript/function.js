const jwt=require('jsonwebtoken')
function getTimeStamp(timeStamp) {
    if (timeStamp != undefined) {
        return new Date(timeStamp);
    } else {
        return Date.now();
    }
}
function randomid() {
    var randomTxt = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 4; i++) {
        randomTxt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return getTimeStamp() + "_" + randomTxt;
}
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    console.log(token);
    console.log(req.cookies);
    
    
    if (!token) return res.redirect("/");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        
        return res.redirect("/");
    }
}

module.exports={
    randomid,
    verifyToken,
    getTimeStamp
}