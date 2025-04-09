/**
 * Custom routes for frequent-visitor
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/frequent-visitors/user/:userId',
      handler: 'frequent-visitor.findByUser',
      config: {
        auth: {
          scope: ['api::frequent-visitor.frequent-visitor.findByUser'],
        },
      },
    },
  ],
};
