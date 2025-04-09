'use strict';

/**
 * Middleware para depurar y modificar las peticiones a /api/users/me
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Solo interceptar peticiones a /api/users/me
    if (ctx.url === '/api/users/me' || ctx.url.startsWith('/api/users/me?')) {
      console.log('INTERCEPTANDO PETICIÓN A /api/users/me');
      
      // Continuar con la petición original
      await next();
      
      // Después de que se procese la petición, examinar la respuesta
      if (ctx.body && !ctx.body.role && ctx.state.user) {
        console.log('ROLE NO ENCONTRADO EN LA RESPUESTA, AGREGANDO MANUALMENTE');
        
        try {
          // Buscar el rol directamente
          const role = await strapi.db.query('plugin::users-permissions.role').findOne({
            where: { id: ctx.state.user.role }
          });
          
          console.log('ROL ENCONTRADO:', role);
          
          // Agregar el rol a la respuesta
          ctx.body.role = role;
          
          console.log('RESPUESTA FINAL MODIFICADA:', JSON.stringify(ctx.body, null, 2));
        } catch (error) {
          console.error('ERROR AL BUSCAR ROL:', error);
        }
      } else {
        console.log('RESPUESTA ORIGINAL:', JSON.stringify(ctx.body, null, 2));
      }
    } else {
      // Para otras rutas, simplemente continuar
      await next();
    }
  };
};
