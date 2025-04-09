/**
 * reservation router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/reservations/me",
      handler: "reservation.me",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/reservations",
      handler: "reservation.find",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/reservations/:id",
      handler: "reservation.findOne",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/reservations",
      handler: "reservation.create",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/reservations/:id",
      handler: "reservation.update",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/reservations/:id",
      handler: "reservation.delete",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/reservations/user/:ownerId",
      handler: "reservation.findByOwner",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [],
      },
    },
  ],
};


