module.exports = async () => {
  // Fetch the public role
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  // Update permissions for the public role
  const publicPermissions = await strapi
    .query("plugin::users-permissions.permission")
    .findMany({ where: { role: publicRole.id } });

  // Enable necessary endpoints for authentication
  const authPermissions = publicPermissions.filter((permission) =>
    permission.action.startsWith("auth.")
  );

  for (const permission of authPermissions) {
    await strapi.query("plugin::users-permissions.permission").update({
      where: { id: permission.id },
      data: { enabled: true },
    });
  }

  // Log success
  strapi.log.info("Bootstrap script executed successfully");
};
