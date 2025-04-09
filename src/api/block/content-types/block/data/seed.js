const blocks = require('./blocks-seed');

module.exports = {
  async seed({ strapi }) {
    try {
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
      for (const block of blocks) {
        await strapi.entityService.create('api::block.block', {
          data: {
            block: block.block,
            coefficient: block.coefficient,
            publishedAt: new Date()
          }
        });
      }

      console.log(`Successfully seeded ${blocks.length} blocks`);
    } catch (error) {
      console.error('Error seeding blocks:', error);
      throw error;
    }
  }
};
