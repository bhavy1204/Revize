import {rateLimit} from "express-rate-limit"

// General API limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth-specific (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many auth attempts. Chill for 15 minutes.",
});


export {
    apiLimiter,
    authLimiter
}