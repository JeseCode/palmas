const blocks = require('../src/api/block/content-types/block/data/blocks-seed');
const Strapi = require('@strapi/strapi');

async function seedBlocks() {
  try {
    console.log('Starting Strapi...');
    const strapi = await Strapi({ appDir: process.cwd() }).load();
    
    console.log('Starting to seed blocks...');
    
    // Eliminar todos los bloques existentes
    const existingBlocks = await strapi.entityService.findMany('api::block.block', {
      fields: ['id']
    });
    
    for (const block of existingBlocks) {
      await strapi.entityService.delete('api::block.block', block.id);
    }
    
    console.log(`Deleted ${existingBlocks.length} existing blocks`);

    // Insertar los nuevos bloques
    let successCount = 0;
    for (const block of blocks) {
      try {
        await strapi.entityService.create('api::block.block', {
          data: {
            block: block.block,
            coefficient: block.coefficient,
            publishedAt: new Date()
          }
        });
        successCount++;
        console.log(`Inserted block ${block.block} (${successCount}/${blocks.length})`);
      } catch (error) {
        console.error(`Error inserting block ${block.block}:`, error.message);
      }
    }

    console.log(`Successfully seeded ${successCount} out of ${blocks.length} blocks`);
    
    // Cerrar Strapi
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blocks:', error);
    process.exit(1);
  }
}

seedBlocks();
