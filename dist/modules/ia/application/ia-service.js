"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAService = void 0;
class IAService {
    async ask(request) {
        return { answer: `Respuesta simulada para: ${request.prompt}` };
    }
}
exports.IAService = IAService;
