"use strict";
/**
 * Middleware personalizado para manejar Server-Sent Events (SSE)
 * Este middleware evita el sistema de autenticación de Strapi
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Almacena las conexiones activas por usuario
const userConnections = new Map();
exports.default = (strapi) => {
    return async (ctx, next) => {
        // Solo procesar rutas SSE específicas
        if (ctx.path.startsWith('/api/notifications/sse/')) {
            try {
                // Extraer el ID de usuario de la URL
                const userId = ctx.path.split('/').pop();
                if (!userId) {
                    ctx.status = 400;
                    ctx.body = { error: 'Se requiere el ID del usuario' };
                    return;
                }
                // Verificar que el usuario existe
                let userExists;
                try {
                    userExists = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
                }
                catch (error) {
                    console.error(`Error al buscar usuario ${userId}:`, error);
                }
                if (!userExists) {
                    console.error(`SSE: Usuario con ID ${userId} no encontrado`);
                    ctx.status = 404;
                    ctx.body = { error: 'Usuario no encontrado' };
                    return;
                }
                // Configurar la respuesta para SSE
                ctx.set({
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no', // Para Nginx
                });
                // Mantener la conexión abierta
                ctx.req.socket.setTimeout(0);
                ctx.req.socket.setNoDelay(true);
                ctx.req.socket.setKeepAlive(true);
                // Función para enviar eventos al cliente
                const send = (data) => {
                    try {
                        ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
                    }
                    catch (error) {
                        console.error(`Error al enviar datos SSE a usuario ${userId}:`, error);
                    }
                };
                // Enviar un evento inicial para confirmar la conexión
                send({ type: 'connection', message: 'Conexión SSE establecida' });
                // Almacenar la conexión para este usuario
                if (!userConnections.has(userId)) {
                    userConnections.set(userId, []);
                }
                userConnections.get(userId).push(send);
                console.log(`Nueva conexión SSE establecida para usuario ${userId}. Total conexiones: ${userConnections.get(userId).length}`);
                // Manejar el cierre de la conexión
                ctx.req.on('close', () => {
                    const connections = userConnections.get(userId) || [];
                    const index = connections.indexOf(send);
                    if (index !== -1) {
                        connections.splice(index, 1);
                        console.log(`Conexión SSE cerrada para usuario ${userId}. Conexiones restantes: ${connections.length}`);
                    }
                    if (connections.length === 0) {
                        userConnections.delete(userId);
                        console.log(`Todas las conexiones SSE cerradas para usuario ${userId}`);
                    }
                });
                // Exponer el método para enviar notificaciones
                if (!strapi.sse) {
                    strapi.sse = {
                        sendNotification: (targetUserId, notification) => {
                            try {
                                if (!targetUserId) {
                                    console.error('SSE: Intento de enviar notificación sin ID de usuario');
                                    return false;
                                }
                                const userIdStr = targetUserId.toString();
                                const connections = userConnections.get(userIdStr) || [];
                                if (connections.length > 0) {
                                    console.log(`Enviando notificación SSE a usuario ${userIdStr} (${connections.length} conexiones)`);
                                    connections.forEach(send => {
                                        try {
                                            send({
                                                type: 'notification',
                                                data: notification
                                            });
                                        }
                                        catch (error) {
                                            console.error(`Error al enviar notificación SSE a usuario ${userIdStr}:`, error);
                                        }
                                    });
                                    return true;
                                }
                                else {
                                    console.log(`Usuario ${userIdStr} no está conectado por SSE`);
                                    return false;
                                }
                            }
                            catch (error) {
                                console.error('Error al enviar notificación SSE:', error);
                                return false;
                            }
                        }
                    };
                }
                // Mantener la conexión abierta
                await new Promise(() => { });
            }
            catch (error) {
                console.error('Error en el middleware SSE:', error);
                ctx.status = 500;
                ctx.body = { error: 'Error en el servidor de eventos' };
            }
        }
        else {
            // No es una ruta SSE, continuar con el siguiente middleware
            await next();
        }
    };
};
