module.exports = {
  async me(ctx) {
    console.log('[DEBUG] Custom /me endpoint called');
    
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    try {
      console.log('[DEBUG] Finding user with ID:', ctx.state.user.id);
      
      // Obtenemos el usuario básico primero
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        ctx.state.user.id,
        {
          populate: ['role', 'imgUrl']
        }
      );

      // Ahora obtenemos el rol específicamente
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { id: user.role }
      });

      console.log('[DEBUG] Found role:', role);

      // Asignamos el rol completo al usuario
      user.role = role;

      console.log('[DEBUG] Full user object:', JSON.stringify(user, null, 2));

      if (!user) {
        return ctx.notFound();
      }

      // Remove sensitive fields
      delete user.password;
      delete user.resetPasswordToken;
      delete user.confirmationToken;

      console.log('[DEBUG] Returning user with role:', JSON.stringify(user.role, null, 2));
      
      // Retornamos el usuario con el rol incluido
      return ctx.send(user);

    } catch (error) {
      console.error('[ERROR] Error in custom /me endpoint:', error);
      return ctx.badRequest(null, error);
    }
  },

  // Agregar método para actualizar usuario
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { body } = ctx.request;
      
      console.log('[DEBUG] Updating user with ID:', id);
      console.log('[DEBUG] Update data:', JSON.stringify(body, null, 2));
      
      // Validate input
      if (!id) {
        return ctx.badRequest('Missing user ID');
      }
      
      // Update user with entityService
      const updatedUser = await strapi.entityService.update(
        'plugin::users-permissions.user', 
        id, 
        {
          data: body,
          populate: ['role']
        }
      );
      
      // Remove sensitive fields
      delete updatedUser.password;
      delete updatedUser.resetPasswordToken;
      delete updatedUser.confirmationToken;
      
      console.log('[DEBUG] Updated user successfully');
      
      return ctx.send(updatedUser);
    } catch (error) {
      console.error('[ERROR] Error updating user:', error);
      return ctx.badRequest(null, error);
    }
  }
};
