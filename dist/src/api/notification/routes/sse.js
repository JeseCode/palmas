"use strict";
/**
 * Server-Sent Events routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/notifications/sse/:userId',
            handler: 'sse.connect',
            config: {
                auth: false, // Permitir conexiones sin autenticación para SSE
                policies: [],
                middlewares: [],
            },
        },
    ],
};
