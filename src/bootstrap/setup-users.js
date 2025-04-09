"use strict";

/**
 * Este script se ejecuta durante el bootstrap de Strapi y configura los roles y usuarios iniciales.
 */

const bcrypt = require("bcryptjs");

// Configuración de usuarios a crear
const usersToCreate = [
  {
    email: "admin@mail.com",
    username: "admin",
    password: "Pa$$w0rd!",
    firstName: "Admin",
    lastName: "Usuario",
    roleName: "Admin",
  },
];

// Lista de roles a crear
const customRoles = [
  {
    name: "Admin",
    description: "Acceso total a todas las rutas y gestión del sistema.",
    type: "admin",
  },
  {
    name: "Vigilante",
    description: "Acceso al módulo de vigilancia.",
    type: "vigilante",
  },
  {
    name: "Piscinero",
    description: "Acceso al módulo de piscina.",
    type: "piscinero",
  },
  {
    name: "Consejero",
    description: "Acceso al módulo de actividades del consejo.",
    type: "consejero",
  },
  {
    name: "Convivencia",
    description: "Acceso al módulo de actividades del comité de convivencia.",
    type: "convivencia",
  },
];

/**
 * Limpia la base de datos
 */
async function cleanDatabase(strapi) {
  try {
    strapi.log.info("🧹 Limpiando la base de datos...");

    // 1. Eliminar todos los archivos subidos
    const uploadFiles = await strapi.db.query("plugin::upload.file").findMany();
    if (uploadFiles.length > 0) {
      strapi.log.info(`- Eliminando ${uploadFiles.length} archivos...`);
      for (const file of uploadFiles) {
        await strapi.plugins.upload.services.upload.remove(file);
      }
      strapi.log.info("✅ Archivos eliminados correctamente");
    }

    // 2. Eliminar todos los usuarios
    strapi.log.info("- Eliminando usuarios...");
    const users = await strapi.db.query("plugin::users-permissions.user").findMany();
    for (const user of users) {
      await strapi.db.query("plugin::users-permissions.user").delete({
        where: { id: user.id },
      });
    }
    strapi.log.info("✅ Usuarios eliminados correctamente");

    // Aquí puedes agregar más limpiezas específicas para tu aplicación

    strapi.log.info("✅ Base de datos limpiada exitosamente");
  } catch (error) {
    strapi.log.error("❌ Error al limpiar la base de datos:", error);
    throw error;
  }
}

/**
 * Crea los roles personalizados
 */
async function createRoles(strapi) {
  try {
    strapi.log.info("👥 Verificando y creando roles personalizados...");

    // Obtener todos los roles existentes
    const roles = await strapi.db.query("plugin::users-permissions.role").findMany();

    const createdRoles = {};

    // Verificar y crear cada rol personalizado
    for (const roleData of customRoles) {
      // Comprobar si el rol ya existe
      let role = roles.find(
        (r) => r.type === roleData.type || r.name === roleData.name
      );

      if (!role) {
        strapi.log.info(`- Creando rol: ${roleData.name}`);

        // Obtener todas las acciones disponibles
        const permissions = await strapi.db
          .query("plugin::users-permissions.permission")
          .findMany({
            where: {
              action: {
                $notNull: true,
              },
            },
          });

        // Crear el rol con permisos básicos
        role = await strapi.db.query("plugin::users-permissions.role").create({
          data: {
            name: roleData.name,
            description: roleData.description,
            type: roleData.type,
          },
        });

        // Asignar permisos adecuados al rol
        for (const permission of permissions) {
          // Para el admin, dar todos los permisos
          if (
            roleData.type === "admin" ||
            // Para otros roles, dar permisos específicos
            permission.action.startsWith("api::") ||
            permission.action.startsWith("plugin::users-permissions.user.me") ||
            permission.action.startsWith("plugin::upload")
          ) {
            await strapi.db.query("plugin::users-permissions.permission").update({
              where: { id: permission.id },
              data: {
                role: role.id,
                enabled: true,
              },
            });
          }
        }
      } else {
        strapi.log.info(`- El rol ${roleData.name} ya existe`);
      }

      createdRoles[roleData.name] = role;
    }

    strapi.log.info("✅ Roles verificados y creados correctamente");
    return createdRoles;
  } catch (error) {
    strapi.log.error("❌ Error al crear roles:", error);
    throw error;
  }
}

/**
 * Crea los usuarios básicos
 */
async function createUsers(strapi, roles) {
  try {
    strapi.log.info("👤 Creando usuarios básicos...");

    for (const userData of usersToCreate) {
      // Verificar si el usuario ya existe
      const existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { email: userData.email },
        });

      if (existingUser) {
        strapi.log.info(`- Usuario ${userData.username} ya existe, se omitirá`);
        continue;
      }

      // Verificar que el rol existe
      const role = roles[userData.roleName];
      if (!role) {
        strapi.log.info(
          `- No se encontró el rol ${userData.roleName}, se omitirá el usuario ${userData.username}`
        );
        continue;
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear el usuario
      await strapi.db.query("plugin::users-permissions.user").create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          confirmed: true,
          blocked: false,
          role: role.id,
        },
      });

      strapi.log.info(
        `- Usuario ${userData.username} creado con rol ${userData.roleName}`
      );
    }

    strapi.log.info("✅ Usuarios creados correctamente");
  } catch (error) {
    strapi.log.error("❌ Error al crear usuarios:", error);
    throw error;
  }
}

module.exports = {
  cleanDatabase,
  createRoles,
  createUsers,
  usersToCreate,
  customRoles,
};
