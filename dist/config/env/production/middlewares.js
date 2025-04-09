"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    "strapi::logger",
    "strapi::errors",
    {
        name: "strapi::security",
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    "connect-src": [
                        "'self'",
                        "https:",
                        "wss:",
                        "https://palmas-canarias.vercel.app",
                        "https://palmas-production.up.railway.app",
                    ],
                    "img-src": ["'self'", "data:", "blob:", "res.cloudinary.com"],
                    "media-src": ["'self'", "data:", "blob:", "res.cloudinary.com"],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    {
        name: "strapi::cors",
        config: {
            enabled: true,
            headers: ["*"],
            origin: [
                "http://localhost:3000",
                "https://palmas-canarias.vercel.app",
                "https://palmas-production.up.railway.app",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
            keepHeaderOnError: true,
            credentials: true,
        },
    },
    "strapi::poweredBy",
    "strapi::query",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
    {
        name: "strapi::body",
        config: {
            jsonLimit: "10mb",
            formLimit: "10mb",
            textLimit: "10mb",
            formidable: {
                maxFileSize: 200 * 1024 * 1024,
            },
        },
    },
];
