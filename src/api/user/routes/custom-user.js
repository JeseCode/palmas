'use strict';

/**
 * Custom implementation for the /api/users/me endpoint
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        prefix: 'api',
        policies: [],
      },
    },
  ],
};
