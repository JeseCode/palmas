module.exports = {
  routes: [
    {
      method: "POST",
      path: "/dependents",
      handler: "dependent.create",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/dependents/:id",
      handler: "dependent.update",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/dependents/user/:id",
      handler: "dependent.findByUser",
      config: {
        policies: ["global::isAuthenticated"],
      },
    },
    {
      method: "DELETE",
      path: "/dependents/:id",
      handler: "dependent.delete",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
  ],
};
