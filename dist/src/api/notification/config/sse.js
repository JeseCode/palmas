"use strict";
/**
 * Configuración específica para SSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // Deshabilitar completamente la autenticación para las rutas SSE
    settings: {
        auth: {
            enabled: false,
        },
        policies: {
            enabled: false,
        },
        middlewares: {
            enabled: false,
        },
    },
};
