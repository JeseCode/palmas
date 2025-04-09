"use strict";
/**
 * Custom routes for frequent-visitor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/frequent-visitors/user/:userId',
            handler: 'frequent-visitor.findByUser',
            config: {
                auth: {
                    scope: ['api::frequent-visitor.frequent-visitor.findByUser'],
                },
            },
        },
    ],
};
