"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandler = setupErrorHandler;
function setupErrorHandler(app) {
    app.setErrorHandler(async (error, request, reply) => {
        request.log.error(error);
        return reply
            .status(error.statusCode || 500)
            .send({
            error: true,
            message: error.message ||
                "Internal server error"
        });
    });
}
