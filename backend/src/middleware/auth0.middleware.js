import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { APIError } from "../utils/APIError.js";

const client = jwksRsa({
    jwksUri: "https://dev-1uwmj24ytu0zg2oe.us.auth0.com/.well-known/jwks.json",
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

export const verifyAuth0 = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new APIError(401, "Authorization header missing");
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        getKey,
        {
            issuer: "https://dev-1uwmj24ytu0zg2oe.us.auth0.com/",
            audience: "68t7SBpbQsd2AToWkmRYO4pxf0ufGBW3",
            algorithms: ["RS256"],
        },
        (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid Auth0 token" });
            }

            req.auth0User = decoded; // ✅ THIS is what your controller needs
            next();
        }
    );
};
