module.exports = {
    routes: [
        {
            method: "POST",
            path: "/pets",
            handler: "pet.create",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/pets/:id",
            handler: "pet.update",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/pets/:id",
            handler: "pet.delete",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/pets/owner/:ownerId", // Ruta personalizada
            handler: "pet.findByOwner",
            config: {
                auth: false,
            },
        },
        {
            method: "GET",
            path: "/pets",
            handler: "pet.findAll",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
