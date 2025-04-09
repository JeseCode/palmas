/**
 * survey router
 */
module.exports = {
    routes: [
        {
            method: "POST",
            path: "/surveys",
            handler: "survey.create",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            path: "/surveys/:id",
            handler: "survey.update",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "DELETE",
            path: "/surveys/:id",
            handler: "survey.delete",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/surveys",
            handler: "survey.find",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/surveys/available",
            handler: "survey.available",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/surveys/:id",
            handler: "survey.findOne",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
