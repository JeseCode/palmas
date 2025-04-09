/**
 * rental router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/rentals",
      handler: "rental.create",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/rentals/:id",
      handler: "rental.update",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/rentals/:id",
      handler: "rental.delete",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/rentals",
      handler: "rental.findAll",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/rentals/owner/:ownerId",
      handler: "rental.findById",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/rentals/:id",
      handler: "rental.findOne",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
  ],
};
