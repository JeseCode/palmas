module.exports = (plugin) => {
  // Añadir el middleware de depuración
  const debugMiddleware = require('./middlewares/debug');
  
  // Registrar el middleware globalmente para todas las rutas de users-permissions
  plugin.middlewares.push({
    name: 'debug-users-me',
    config: {},
    handler: debugMiddleware
  });

  // Log the plugin configuration
  console.log('\n[DEBUG] Plugin Configuration:');
  console.log(JSON.stringify(plugin.config, null, 2));

  // Extend the registration controller
  const originalRegister = plugin.controllers.auth.register;
  plugin.controllers.auth.register = async (ctx) => {
    console.log('[DEBUG] Registration request:', {
      body: ctx.request.body,
      headers: ctx.request.headers
    });

    const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const settings = await pluginStore.get({ key: 'advanced' });

    if (!settings.allow_register) {
      console.log('[DEBUG] Registration is disabled in settings');
      throw new ValidationError('Register action is currently disabled');
    }

    const params = {
      ..._.omit(ctx.request.body, ['confirmed', 'blocked']),
      provider: 'local',
    };

    // Check if role is allowed
    let role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      console.log('[DEBUG] Default role not found, trying to find authenticated role');
      role = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });
    }

    params.role = role.id;
    console.log('[DEBUG] Using role:', role);

    try {
      const user = await strapi.query('plugin::users-permissions.user').create({ data: params });
      console.log('[DEBUG] User created successfully:', user);

      const sanitizedUser = await sanitizeUser(user, ctx);
      console.log('[DEBUG] Sanitized user:', sanitizedUser);

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (error) {
      console.error('[DEBUG] Error during registration:', error);
      throw error;
    }
  };

  // Extend the users-permissions plugin
  const sanitizeUser = (user) => {
    const {
      password, resetPasswordToken, confirmationToken, ...sanitizedUser
    } = user;
    return sanitizedUser;
  };

  // Sobrescribir el controlador me para incluir explícitamente el rol
  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    try {
      // Paso 1: Obtener el usuario sin sanitizar (para acceder al ID del rol)
      const userId = ctx.state.user.id;
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: { role: true, imgUrl: true }
      });

      if (!user) {
        return ctx.notFound();
      }

      // Paso 2: Eliminar campos sensibles
      const sanitizedUser = { ...user };
      delete sanitizedUser.password;
      delete sanitizedUser.resetPasswordToken;
      delete sanitizedUser.confirmationToken;

      // Paso 3: Devolver el usuario con su rol
      ctx.body = sanitizedUser;
    } catch (error) {
      ctx.throw(500, error);
    }
  };

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/users/me',
    handler: 'user.me',
    config: {
      prefix: '',
      policies: []
    }
  });

  return plugin;
};

const _ = require('lodash');
const utils = require('@strapi/utils');
const { ValidationError } = utils.errors;
