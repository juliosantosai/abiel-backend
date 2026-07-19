"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
exports.getUserFromToken = getUserFromToken;
const jwt_1 = require("./jwt");
function loginUser(email, password) {
    if (email === "admin@abiel.com" && password === "123456") {
        const token = (0, jwt_1.signToken)({ email, role: "admin" });
        return { token, user: { email, role: "admin" } };
    }
    throw new Error("Invalid credentials");
}
function getUserFromToken(token) {
    return (0, jwt_1.verifyToken)(token);
}
