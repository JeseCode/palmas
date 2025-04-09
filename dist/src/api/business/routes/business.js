/**
 * business router
 */
module.exports = {
    routes: [
        {
            method: "POST",
            path: "/businesses",
            handler: "business.create",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/businesses/:id",
            handler: "business.update",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/businesses/:id",
            handler: "business.delete",
            config: {
                policies: ["global::isAuthenticated"],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/businesses",
            handler: "business.find",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/businesses/owner/:ownerId",
            handler: "business.findById",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/businesses/:id",
            handler: "business.findOne",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
