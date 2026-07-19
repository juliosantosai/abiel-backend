"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUuid = generateUuid;
const crypto_1 = require("crypto");
function generateUuid() {
    return (0, crypto_1.randomUUID)();
}
