// Script para sembrar bloques directamente usando el modelo de Strapi
const blocks = require('../src/api/block/content-types/block/data/blocks-seed');
const axios = require('axios');
require('dotenv').config();

// Configuración
const API_URL = 'http://localhost:1337';
const TOKEN = process.env.STRAPI_ADMIN_TOKEN;

// Función para crear un bloque usando la API de administración
async function createBlock(block) {
  try {
    const response = await axios.post(`${API_URL}/api/blocks`, {
      data: {
        block: block.block,
        coefficient: block.coefficient,
        publishedAt: new Date()
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al crear el bloque ${block.block}:`, error.response?.data?.error?.message || error.message);
    throw error;
  }
}

// Función principal
async function seedBlocks() {
  try {
    console.log('Iniciando la siembra de bloques...');
    
    // Verificar la conexión
    try {
      await axios.get(`${API_URL}/api/blocks`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });
      console.log('Conexión exitosa a la API');
    } catch (error) {
      console.error('Error de conexión a la API:', error.response?.data?.error?.message || error.message);
      process.exit(1);
    }
    
    // Sembrar bloques
    let successCount = 0;
    for (const block of blocks) {
      try {
        await createBlock(block);
        successCount++;
        console.log(`Bloque ${block.block} creado exitosamente (${successCount}/${blocks.length})`);
      } catch (error) {
        // Error ya registrado en la función createBlock
      }
    }
    
    console.log(`Siembra completada: ${successCount} de ${blocks.length} bloques creados exitosamente`);
  } catch (error) {
    console.error('Error general durante la siembra:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
seedBlocks();
