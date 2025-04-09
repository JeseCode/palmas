'use strict';

/**
 * Script para limpiar la base de datos y crear usuarios básicos
 * Este script elimina todos los datos existentes y crea usuarios con roles específicos
 * 
 * Para ejecutar: NODE_ENV=development node scripts/reset-and-seed-users.js
 */

// Importar Strapi y configurar el contexto
const Strapi = require('@strapi/strapi');
const bcrypt = require('bcryptjs');

// Configuración de usuarios a crear
const usersToCreate = [
  {
    email: 'admin@mail.com',
    username: 'admin',
    password: 'Pa$$w0rd!',
    firstName: 'Admin',
    lastName: 'Usuario',
    roleName: 'Admin'
  },
  {
    email: 'consejero@mail.com',
    username: 'consejero',
    password: 'Pa$$w0rd!',
    firstName: 'Consejero',
    lastName: 'Usuario',
    roleName: 'Consejero'
  },
  {
    email: 'vigilante@mail.com',
    username: 'vigilante',
    password: 'Pa$$w0rd!',
    firstName: 'Vigilante',
    lastName: 'Usuario',
    roleName: 'Vigilante'
  },
  {
    email: 'piscinero@mail.com',
    username: 'piscinero',
    password: 'Pa$$w0rd!',
    firstName: 'Piscinero',
    lastName: 'Usuario',
    roleName: 'Piscinero'
  },
  {
    email: 'convivencia@mail.com',
    username: 'convivencia',
    password: 'Pa$$w0rd!',
    firstName: 'Convivencia',
    lastName: 'Usuario',
    roleName: 'Convivencia'
  }
];

// Función para eliminar todos los datos
async function cleanDatabase(strapi) {
  try {
    console.log('🧹 Limpiando la base de datos...');

    // 1. Eliminar todos los archivos subidos
    const uploadFiles = await strapi.db.query('plugin::upload.file').findMany();
    if (uploadFiles.length > 0) {
      console.log(`- Eliminando ${uploadFiles.length} archivos...`);
      for (const file of uploadFiles) {
        await strapi.plugins.upload.services.upload.remove(file);
      }
      console.log('✅ Archivos eliminados correctamente');
    }

    // 2. Eliminar todos los usuarios excepto el super admin
    console.log('- Eliminando usuarios...');
    const users = await strapi.db.query('plugin::users-permissions.user').findMany();
    for (const user of users) {
      await strapi.db.query('plugin::users-permissions.user').delete({
        where: { id: user.id }
      });
    }
    console.log('✅ Usuarios eliminados correctamente');

    // 3. Eliminar otros modelos de contenido (personalizar según tu aplicación)
    // Aquí puedes agregar código para eliminar otros tipos de contenido específicos
    
    console.log('✅ Base de datos limpiada exitosamente');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
}

// Función para crear roles personalizados
async function createRoles(strapi) {
  try {
    console.log('👥 Verificando y creando roles personalizados...');
    
    // Obtener todos los roles existentes
    const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
    
    // Lista de roles a crear
    const customRoles = [
      {
        name: 'Admin',
        description: 'Acceso total a todas las rutas y gestión del sistema.',
        type: 'admin',
      },
      {
        name: 'Vigilante',
        description: 'Acceso al módulo de vigilancia.',
        type: 'vigilante',
      },
      {
        name: 'Piscinero',
        description: 'Acceso al módulo de piscina.',
        type: 'piscinero',
      },
      {
        name: 'Consejero',
        description: 'Acceso al módulo de actividades del consejo.',
        type: 'consejero',
      },
      {
        name: 'Convivencia',
        description: 'Acceso al módulo de actividades del comité de convivencia.',
        type: 'convivencia',
      },
    ];
    
    const createdRoles = {};
    
    // Verificar y crear cada rol personalizado
    for (const roleData of customRoles) {
      // Comprobar si el rol ya existe
      let role = roles.find(r => r.type === roleData.type || r.name === roleData.name);
      
      if (!role) {
        console.log(`- Creando rol: ${roleData.name}`);
        
        // Obtener todas las acciones disponibles
        const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: {
            action: {
              $notNull: true,
            },
          },
        });
        
        // Crear el rol con permisos básicos
        role = await strapi.db.query('plugin::users-permissions.role').create({
          data: {
            name: roleData.name,
            description: roleData.description,
            type: roleData.type,
            // Los permisos se asignarán después
          },
        });
        
        // Asignar permisos adecuados al rol
        for (const permission of permissions) {
          // Para el admin, dar todos los permisos
          if (roleData.type === 'admin' || 
              // Para otros roles, dar permisos específicos
              permission.action.startsWith('api::') || 
              permission.action.startsWith('plugin::users-permissions.user.me') ||
              permission.action.startsWith('plugin::upload')) {
            
            await strapi.db.query('plugin::users-permissions.permission').update({
              where: { id: permission.id },
              data: {
                role: role.id,
                enabled: true
              }
            });
          }
        }
      } else {
        console.log(`- El rol ${roleData.name} ya existe`);
      }
      
      createdRoles[roleData.name] = role;
    }
    
    console.log('✅ Roles verificados y creados correctamente');
    return createdRoles;
  } catch (error) {
    console.error('❌ Error al crear roles:', error);
    throw error;
  }
}

// Función para crear usuarios
async function createUsers(strapi, roles) {
  try {
    console.log('👤 Creando usuarios básicos...');
    
    for (const userData of usersToCreate) {
      // Verificar si el usuario ya existe
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`- Usuario ${userData.username} ya existe, se omitirá`);
        continue;
      }
      
      // Verificar que el rol existe
      const role = roles[userData.roleName];
      if (!role) {
        console.log(`- No se encontró el rol ${userData.roleName}, se omitirá el usuario ${userData.username}`);
        continue;
      }
      
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Crear el usuario
      const newUser = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          confirmed: true,
          blocked: false,
          role: role.id
        }
      });
      
      console.log(`- Usuario ${userData.username} creado con rol ${userData.roleName}`);
    }
    
    console.log('✅ Usuarios creados correctamente');
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando script de limpieza y creación de usuarios...');
    
    // Inicializar Strapi - usamos el método correcto
    const appDir = process.cwd();
    const strapiInstance = await Strapi({ 
      dir: appDir,
      autoReload: false,
      serveAdminPanel: false,
    });
    await strapiInstance.load();
    await strapiInstance.postListen();
    
    // Limpiar base de datos
    await cleanDatabase(strapiInstance);
    
    // Crear roles
    const roles = await createRoles(strapiInstance);
    
    // Crear usuarios
    await createUsers(strapiInstance, roles);
    
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
