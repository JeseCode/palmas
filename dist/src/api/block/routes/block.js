"use strict";
/**
 * block router
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/blocks',
            handler: 'block.find',
            config: {
                auth: false,
                policies: [],
            },
        },
    ],
};
