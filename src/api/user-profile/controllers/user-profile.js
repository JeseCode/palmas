'use strict';

/**
 * A set of functions called "actions" for `user-profile`
 */

module.exports = {
  async me(ctx) {
    const { id } = ctx.state.user;
    
    if (!id) {
      return ctx.unauthorized('No autorizado');
    }

    try {
      // Usamos createCoreController en lugar de query directamente
      const { sanitizeEntity } = require('@strapi/utils');
      const userEntity = strapi.getModel('plugin::users-permissions.user');
      
      // Primero obtenemos el usuario con su ID
      let user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        id,
        { populate: ['role', 'imgUrl'] }
      );
      
      if (!user) {
        return ctx.notFound('Usuario no encontrado');
      }
      
      // Sanitizamos la entidad para eliminar campos sensibles
      const sanitizedUser = sanitizeEntity(user, { model: userEntity });
      
      return sanitizedUser;
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return ctx.badRequest(null, 'Error al obtener el perfil');
    }
  }
};
