/**
 * frequent-visitor controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::frequent-visitor.frequent-visitor",
  ({ strapi }) => ({
    // Método personalizado para obtener visitantes frecuentes por usuario
    async findByUser(ctx) {
      try {
        const { userId } = ctx.params;
        
        if (!userId) {
          return ctx.badRequest('Se requiere el ID del usuario');
        }

        const entities = await strapi.entityService.findMany('api::frequent-visitor.frequent-visitor', {
          filters: {
            userId: {
              $eq: parseInt(userId)
            }
          }
        });

        return this.transformResponse(entities);
      } catch (error) {
        console.error('Error al obtener visitantes frecuentes por usuario:', error);
        return ctx.badRequest('Error al obtener visitantes frecuentes');
      }
    },

    // Método para crear un visitante frecuente
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        if (!data || !data.first_name || !data.last_name || !data.document_number || !data.userId) {
          return ctx.badRequest('Datos incompletos para crear visitante frecuente');
        }

        // Verificar si ya existe un visitante con la misma identificación
        const existingVisitor = await strapi.entityService.findMany('api::frequent-visitor.frequent-visitor', {
          filters: {
            document_number: {
              $eq: data.document_number
            }
          }
        });

        if (existingVisitor && existingVisitor.length > 0) {
          return ctx.badRequest('Ya existe un visitante con esta identificación');
        }

        // Crear el visitante frecuente
        const entity = await strapi.entityService.create('api::frequent-visitor.frequent-visitor', {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            document_number: data.document_number,
            phone: data.phone || '',
            userId: parseInt(data.userId),
            publishedAt: new Date()
          }
        });

        return this.transformResponse(entity);
      } catch (error) {
        console.error('Error al crear visitante frecuente:', error);
        return ctx.badRequest('Error al crear visitante frecuente');
      }
    },

    // Método para eliminar un visitante frecuente
    async delete(ctx) {
      try {
        const { id } = ctx.params;
        
        if (!id) {
          return ctx.badRequest('Se requiere el ID del visitante frecuente');
        }

        const entity = await strapi.entityService.delete('api::frequent-visitor.frequent-visitor', id);
        
        return this.transformResponse(entity);
      } catch (error) {
        console.error('Error al eliminar visitante frecuente:', error);
        return ctx.badRequest('Error al eliminar visitante frecuente');
      }
    }
  })
);
