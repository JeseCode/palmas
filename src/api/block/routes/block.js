module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/blocks',
      handler: 'block.find',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
