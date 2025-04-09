/**
 * sanction router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/sanctions",
      handler: "sanction.create",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/sanctions/:id",
      handler: "sanction.update",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/sanctions/:id",
      handler: "sanction.delete",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/sanctions",
      handler: "sanction.findAll",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/sanctions/owner/:ownerId",
      handler: "sanction.findById",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/sanctions/:id",
      handler: "sanction.findOne",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
  ],
};
