/**
 * block controller
 */

interface Block {
  block: string;
  coefficient: number;
}

export default {
  async find(ctx) {
    try {
      // 1. Obtener todos los bloques
      const blocks = await strapi.db.query('api::block.block').findMany({
        select: ['block', 'coefficient'],
      });

      // 2. Obtener todos los usuarios con sus bloques asignados
      const usersWithBlocks = await strapi.db.query('plugin::users-permissions.user').findMany({
        select: ['address'],
      });

      // 3. Crear un Set con los bloques ocupados
      const occupiedBlocks = new Set(usersWithBlocks.map(user => user.address));

      // 4. Filtrar los bloques disponibles
      const availableBlocks = blocks.filter(block => !occupiedBlocks.has(block.block));

      return {
        data: availableBlocks.map((block: Block) => ({
          block: block.block,
          coefficient: block.coefficient,
        })),
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
