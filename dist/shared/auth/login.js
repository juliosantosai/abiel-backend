"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
exports.getUserFromToken = getUserFromToken;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const validUser = {
    id: "user-1",
    email: "admin@abiel.com",
    name: "Admin",
};
function loginUser(email, password) {
    if (email !== "admin@abiel.com" || password !== "123456") {
        throw new Error("Invalid credentials");
    }
    const token = (0, jsonwebtoken_1.sign)({ userId: validUser.id, email: validUser.email }, env_1.env.JWT_SECRET);
    return { token, user: validUser };
}
function getUserFromToken(token) {
    return (0, jsonwebtoken_1.verify)(token, env_1.env.JWT_SECRET);
}
