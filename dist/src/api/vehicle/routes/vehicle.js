/**
 * vehicle router
 */
module.exports = {
    routes: [
        {
            method: "POST",
            path: "/vehicles",
            handler: "vehicle.create",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/vehicles/:id",
            handler: "vehicle.update",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/vehicles/:id",
            handler: "vehicle.delete",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/vehicles/owner/:ownerId",
            handler: "vehicle.findByOwner",
            config: {
                auth: false,
            },
        },
    ],
};
