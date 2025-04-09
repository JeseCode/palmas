"use strict";

/**
 * setting controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::setting.setting", ({ strapi }) => ({
  async find(ctx) {
    const { user } = ctx.state;
    const isAdmin = user.role?.type === "admin";

    if (!isAdmin) {
      return ctx.forbidden("Only administrators can access settings");
    }

    const response = await super.find(ctx);
    return response;
  },

  async update(ctx) {
    const { user } = ctx.state;
    const isAdmin = user.role?.type === "admin";

    if (!isAdmin) {
      return ctx.forbidden("Only administrators can modify settings");
    }

    const response = await super.update(ctx);
    return response;
  },
}));
