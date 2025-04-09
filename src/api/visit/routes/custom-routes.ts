/**
 * Custom routes for visit
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/visits/user/:userId',
      handler: 'visit.findByUser',
      config: {
        auth: {
          scope: ['api::visit.visit.findByUser'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/visits/:id/finish',
      handler: 'visit.finish',
      config: {
        auth: {
          scope: ['api::visit.visit.finish'],
        },
      },
    },
  ],
};
