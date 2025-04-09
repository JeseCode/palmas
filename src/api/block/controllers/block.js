'use strict';

/**
 * block controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::block.block', ({ strapi }) => ({
  async find(ctx) {
    // Obtener todos los bloques sin paginación
    const entries = await strapi.entityService.findMany('api::block.block', {
      fields: ['block', 'coefficient'],
      pagination: false,
    });

    // Transformar los datos para la respuesta
    return {
      data: entries.map(entry => ({
        block: entry.block,
        coefficient: entry.coefficient
      }))
    };
  },
}));
