"use strict";
/**
 * notification service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService('api::notification.notification', ({ strapi }) => ({
    // Método para notificar a un usuario específico
    async notifyUser(userId, data) {
        try {
            if (!userId) {
                console.error('Intento de notificar sin ID de usuario');
                return false;
            }
            // Intentar enviar la notificación a través de SSE si está disponible
            // @ts-ignore - Ignoramos los errores de tipado ya que strapi.sse se define dinámicamente
            if (strapi.sse && typeof strapi.sse.sendNotification === 'function') {
                console.log(`Enviando notificación SSE a usuario ${userId}`);
                // @ts-ignore
                return strapi.sse.sendNotification(userId, data);
            }
            else {
                console.warn('No se encontró un método para enviar notificaciones SSE');
                return false;
            }
        }
        catch (error) {
            console.error('Error al notificar al usuario:', error);
            return false;
        }
    }
}));
