export default {
  routes: [
    {
      method: "PUT",
      path: "/users/:id/avatar",
      handler: "custom-user.updateImgUrl",
      config: {
        policies: ["global::isAuthenticated"],
        middlewares: [], // Opcional: define middlewares
      },
    },
  ],
};
