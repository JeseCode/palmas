"use strict";

/**
 * Script para crear usuarios de condominio con información específica en Strapi v5
 * Para ejecutar: NODE_ENV=development node scripts/seed-users.js
 */

// Importar Strapi y configurar el contexto
const { Strapi } = require("@strapi/strapi");
const bcrypt = require("bcryptjs");

// Configuración de usuarios a crear para condominios
const usersToCreate = [
  {
    email: "A01CONTRUCTORA@mailinator.com",
    username: "A01CONTRUCTORA",
    password: "Pa$$w0rd!",
    firstName: "CONTRUCTORA",
    lastName: "INVEROBRAS",
    roleName: "Authenticated",
    address: "A01",
    coefficient: 0.68,
    confirmed: true,
    blocked: false,
  },
  {
    email: "admin@condominios.com",
    username: "admin",
    password: "Pa$$w0rd!",
    firstName: "Admin",
    lastName: "Principal",
    roleName: "Admin",
    confirmed: true,
    blocked: false,
  },
];

// Función para obtener roles existentes
async function getRoles(strapi) {
  try {
    console.log("👥 Obteniendo roles existentes...");
    const roles = await strapi.entityService.findMany(
      "plugin::users-permissions.role"
    );
    const rolesByName = roles.reduce((acc, role) => {
      acc[role.name] = role;
      acc[role.type] = role;
      return acc;
    }, {});
    console.log(`✅ Roles obtenidos: ${Object.keys(rolesByName).join(", ")}`);
    return rolesByName;
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    throw error;
  }
}

// Función para crear usuarios de condominio
async function createUsers(strapi, roles) {
  try {
    console.log("👤 Creando usuarios de condominio...");
    for (const userData of usersToCreate) {
      const existingUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        { filters: { email: userData.email } }
      );
      if (existingUsers.length > 0) {
        console.log(`- Usuario ${userData.username} ya existe, se omitirá`);
        continue;
      }
      const role = roles[userData.roleName] || roles["Authenticated"];
      if (!role) {
        console.log(
          `- No se encontró el rol ${userData.roleName}, se omitirá el usuario ${userData.username}`
        );
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userDataToSave = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        confirmed: userData.confirmed ?? true,
        blocked: userData.blocked ?? false,
        role: role.id,
      };
      if (userData.address) userDataToSave.address = userData.address;
      if (userData.coefficient)
        userDataToSave.coefficient = userData.coefficient;
      await strapi.entityService.create("plugin::users-permissions.user", {
        data: userDataToSave,
      });
      console.log(
        `- Usuario ${userData.username} creado con rol ${userData.roleName}`
      );
    }
    console.log("✅ Usuarios creados correctamente");
  } catch (error) {
    console.error("❌ Error al crear usuarios:", error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log(
      "🚀 Iniciando script de creación de usuarios para condominios..."
    );

    // Iniciar Strapi correctamente en v5
    const strapi = await Strapi({ dir: process.cwd() }).start();

    // Obtener los roles
    const roles = await getRoles(strapi);

    // Crear usuarios
    await createUsers(strapi, roles);

    console.log("✅ Script completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error general:", error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
