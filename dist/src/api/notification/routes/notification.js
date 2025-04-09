"use strict";
/**
 * notification router
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Exportar rutas personalizadas además de las rutas CRUD estándar
exports.default = {
    routes: [
        // Rutas CRUD estándar
        {
            method: 'GET',
            path: '/notifications',
            handler: 'notification.find',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/notifications/:id',
            handler: 'notification.findOne',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/notifications',
            handler: 'notification.create',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/notifications/:id',
            handler: 'notification.update',
            config: {
                policies: [],
            },
        },
        {
            method: 'DELETE',
            path: '/notifications/:id',
            handler: 'notification.delete',
            config: {
                policies: [],
            },
        },
        // Rutas personalizadas
        {
            method: 'GET',
            path: '/notifications/user/:userId',
            handler: 'notification.findByUser',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/notifications/:id/read',
            handler: 'notification.markAsRead',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/notifications/user/:userId/read-all',
            handler: 'notification.markAllAsRead',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/notifications/send/:userId',
            handler: 'notification.sendToUser',
            config: {
                policies: [],
            },
        },
    ],
};
