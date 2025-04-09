"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sseService = {
    initialize() {
        // Inicializar el almacén de conexiones SSE si no existe
        if (!global.sseConnections) {
            global.sseConnections = new Map();
        }
        return {
            // Registrar una nueva conexión SSE
            registerConnection(userId, res) {
                var _a;
                if (!global.sseConnections.has(userId)) {
                    global.sseConnections.set(userId, new Set());
                }
                (_a = global.sseConnections.get(userId)) === null || _a === void 0 ? void 0 : _a.add(res);
                // Configurar el cleanup cuando se cierre la conexión
                res.on("close", () => {
                    const userConnections = global.sseConnections.get(userId);
                    if (userConnections) {
                        userConnections.delete(res);
                        if (userConnections.size === 0) {
                            global.sseConnections.delete(userId);
                        }
                    }
                });
            },
            // Enviar una notificación a un usuario específico
            sendNotification(userId, data) {
                console.log(`Intentando enviar notificación SSE a usuario ${userId}:`, data);
                const userConnections = global.sseConnections.get(userId);
                if (!userConnections || userConnections.size === 0) {
                    console.log(`No hay conexiones activas para el usuario ${userId}`);
                    return false;
                }
                const message = `data: ${JSON.stringify(data)}\n\n`;
                let sent = false;
                userConnections.forEach((connection) => {
                    try {
                        if (typeof connection === "function") {
                            connection(message);
                        }
                        else {
                            connection.write(message);
                        }
                        sent = true;
                    }
                    catch (error) {
                        console.error(`Error al enviar notificación a una conexión del usuario ${userId}:`, error);
                        userConnections.delete(connection);
                    }
                });
                return sent;
            },
        };
    },
};
exports.default = sseService;
