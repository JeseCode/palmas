module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        prefix: 'api',
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/users/:id',
      handler: 'user.update',
      config: {
        prefix: 'api',
        policies: [],
        middlewares: [],
      },
    },
  ],
};
