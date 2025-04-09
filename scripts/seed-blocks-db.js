// Script para sembrar bloques directamente en la base de datos
const mysql = require('mysql2/promise');
const blocks = require('../src/api/block/content-types/block/data/blocks-seed');
require('dotenv').config();

// Configuración de la base de datos desde variables de entorno
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
};

async function seedBlocks() {
  let connection;
  try {
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa a la base de datos');

    // Eliminar bloques existentes
    console.log('Eliminando bloques existentes...');
    await connection.execute('DELETE FROM blocks');
    console.log('Bloques existentes eliminados');

    // Insertar nuevos bloques
    console.log('Insertando nuevos bloques...');
    let successCount = 0;

    for (const block of blocks) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO blocks (block, coefficient, published_at, created_at, updated_at) VALUES (?, ?, NOW(), NOW(), NOW())',
          [block.block, block.coefficient]
        );
        successCount++;
        console.log(`Bloque ${block.block} insertado (${successCount}/${blocks.length})`);
      } catch (error) {
        console.error(`Error al insertar bloque ${block.block}:`, error.message);
      }
    }

    console.log(`Siembra completada: ${successCount} de ${blocks.length} bloques insertados exitosamente`);
  } catch (error) {
    console.error('Error durante la siembra:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar el script
seedBlocks();
