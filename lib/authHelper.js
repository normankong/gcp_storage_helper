require('dotenv').config();

const fs = require("fs");
const jwt = require('jsonwebtoken');

var privateKey = fs.readFileSync('key/private_key.pem');
var publicKey = fs.readFileSync('key/public_key.pem');

function createApplication() {

    let app = {};

    app.init = function () {}

    app.verifyToken = function (opts) {

        console.log("Verify Token");

        if (opts.req.headers.authorization == null || opts.req.body.identify == null) {
            console.log("Missing parameter");
            opts.res.status(401).json({
                code: "000",
                message: "Bad Request",
                auth: (opts.req.headers.authorization == null),
                identify: (opts.req.body.identify == null)
            });
            return false;
        }

        // Use the Authorization Header to proceed the verification
        let token = opts.req.headers.authorization;
        let identify = opts.req.body.identify;
        let isMatch = false;
        try {
            let result = jwt.verify(token, publicKey);
            console.log(result.identify + " vs " + identify);
            isMatch = (result.identify == identify);
        } catch (err) {
            console.log(err);
        }

        if (isMatch) return true;
        else {
            opts.res.status(401).json({
                code: "401",
                message: "Unauthorized"
            });
            return false;
        };

    }

    app.createToken = function (identify) {
        let signOptions = {
            //  expiresIn: "24h",
            algorithm: "RS256" // RSASSA [ "RS256", "RS384", "RS512" ]
        };

        // sign with RSA SHA256

        let token = jwt.sign({
            identify: identify
        }, privateKey, signOptions, {
            algorithm: 'RS256'
        });
        return token;
    }

    return app;
}

exports = module.exports = createApplication;