'use strict';

const utils = require('@strapi/utils');
const { sanitize } = utils;

/**
 * user controller
 */

module.exports = {
  /**
   * Retrieve authenticated user information
   * @param {Object} ctx - koa context
   */
  async me(ctx) {
    console.log('----> Ejecutando controlador personalizado /api/users/me <----');
    
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    
    try {
      // Obtener usuario usando el entityService
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user', 
        ctx.state.user.id,
        { populate: ['role'] }
      );
      
      if (!user) {
        return ctx.notFound();
      }
      
      // Preparar sanitización (opcional, por si acaso)
      const sanitizedUserData = await sanitize.contentAPI.output(
        user,
        strapi.getModel('plugin::users-permissions.user')
      );
      
      // Mostrar para debug
      console.log('----> Usuario encontrado:', user.id);
      console.log('----> Rol asignado:', user.role);
      console.log('----> Datos sanitizados:', JSON.stringify(sanitizedUserData, null, 2));
      
      // Enviamos la respuesta completa
      ctx.send(sanitizedUserData);
    } catch (error) {
      console.error('----> Error en endpoint personalizado:', error);
      ctx.throw(500, error);
    }
  }
};
