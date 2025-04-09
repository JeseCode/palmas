// Script para ejecutar el seeder de bloques directamente

const blockSeeder = require('../src/api/block/content-types/block/data/seed');
const Strapi = require('@strapi/strapi');

async function runBlockSeeder() {
  try {
    console.log('Iniciando Strapi...');
    // Inicializar Strapi
    const instance = await Strapi().load();
    
    console.log('Ejecutando seeder de bloques...');
    // Ejecutar el seeder de bloques
    await blockSeeder.seed({ strapi: instance });
    
    console.log('Seeding completado exitosamente');
    
    // Cerrar Strapi
    await instance.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
    process.exit(1);
  }
}

runBlockSeeder();
