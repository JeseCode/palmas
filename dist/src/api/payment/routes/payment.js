/**
 * payment router
 */
module.exports = {
    routes: [
        {
            method: "POST",
            path: "/payments",
            handler: "payment.create",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/payments/:id",
            handler: "payment.update",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/payments/:id",
            handler: "payment.delete",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/payments/owner/:ownerId", // Ruta personalizada
            handler: "payment.findByOwner",
            config: {
                auth: false,
            },
        },
        {
            method: "POST",
            path: "/payments/download-url",
            handler: "payment.getDownloadUrl",
            config: {
                policies: [],
            },
        },
    ],
};
