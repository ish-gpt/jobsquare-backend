const jwt = require('jsonwebtoken');
require('dotenv').config();


async function authenticate(req, res, next) {
    // console.log("----", req.headers);
    const bearerToken = req.headers.authorization;
    const authToken = bearerToken.split(' ')[1];

    if (!authToken) res.status(403).json({
        message: "Forbidden: Invalid token"
    });

    jwt.verify(authToken, process.env.SecretKeyApplicant, function (err, result) {
        if (err) {
            if (err) res.status(401).json({
                message: 'Invalid/Expired Token'
            });
            return;
        }
        // console.log("decoded Info:", result);
        next();
    })
}

module.exports = {
    authenticate: authenticate
}