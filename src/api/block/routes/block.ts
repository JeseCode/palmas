/**
 * block router
 */

import { factories } from '@strapi/strapi';

export default {
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
