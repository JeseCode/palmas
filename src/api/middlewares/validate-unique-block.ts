export default () => {
  return async (ctx, next) => {
    // Solo validar en el registro de usuarios
    if (ctx.request.url === '/api/auth/local/register' && ctx.request.method === 'POST') {
      const { address } = ctx.request.body;

      if (!address) {
        return ctx.throw(400, 'El campo address es requerido');
      }

      // Verificar si el bloque ya está asignado
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { address },
      });

      if (existingUser) {
        return ctx.throw(400, `El bloque ${address} ya está asignado a otro usuario`);
      }

      // Verificar si el bloque existe
      const block = await strapi.db.query('api::block.block').findOne({
        where: { block: address },
      });

      if (!block) {
        return ctx.throw(400, `El bloque ${address} no existe`);
      }
    }

    await next();
  };
};
