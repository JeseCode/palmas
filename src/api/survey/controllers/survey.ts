'use strict';

/**
 * survey controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::survey.survey', ({ strapi }) => ({
  // Crear una nueva encuesta
  async create(ctx) {
    console.log('CREATE SURVEY - Request body:', JSON.stringify(ctx.request.body, null, 2));
    try {
      const { data } = ctx.request.body;
      
      // Validar campos requeridos
      if (!data || !data.content) {
        console.log('CREATE SURVEY - Error: Missing required fields');
        return ctx.badRequest('Missing required fields');
      }
      
      console.log('CREATE SURVEY - Creating survey with data:', JSON.stringify(data, null, 2));
      
      // Asegurarse de que title y description sean objetos si no lo son
      const title = typeof data.title === 'string' ? { es: data.title } : data.title;
      const description = typeof data.description === 'string' ? { es: data.description } : data.description;
      
      // Crear la encuesta
      const entity = await strapi.entityService.create('api::survey.survey', {
        data: {
          title: title || { es: 'Nueva encuesta' },
          description: description || { es: '' },
          content: data.content,
          isActive: data.isActive !== undefined ? data.isActive : true,
          publishedAt: new Date(),
        }
      });
      
      console.log('CREATE SURVEY - Success, created survey with ID:', entity.id);
      return { data: entity };
    } catch (error) {
      console.error('CREATE SURVEY - Error:', error.message, error.stack);
      return ctx.badRequest(`Error creating survey: ${error.message}`);
    }
  },
  
  // Encontrar todas las encuestas
  async find(ctx) {
    console.log('FIND SURVEYS - Request params:', ctx.query);
    try {
      const entities = await strapi.entityService.findMany('api::survey.survey', {
        populate: ['responses'],
      });
      
      console.log(`FIND SURVEYS - Found ${entities.length} surveys`);
      return { data: entities };
    } catch (error) {
      console.error('FIND SURVEYS - Error:', error.message);
      return ctx.badRequest(`Error finding surveys: ${error.message}`);
    }
  },
  
  // Encontrar una encuesta por ID
  async findOne(ctx) {
    console.log('FIND ONE SURVEY - Request params:', ctx.params);
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::survey.survey', id, {
        populate: ['responses'],
      });
      
      if (!entity) {
        console.log('FIND ONE SURVEY - Survey not found with ID:', id);
        return ctx.notFound('Survey not found');
      }
      
      console.log('FIND ONE SURVEY - Found survey with ID:', id);
      return { data: entity };
    } catch (error) {
      console.error('FIND ONE SURVEY - Error:', error.message);
      return ctx.badRequest(`Error finding survey: ${error.message}`);
    }
  },
  
  // Actualizar una encuesta
  async update(ctx) {
    console.log('UPDATE SURVEY - Request params:', ctx.params);
    console.log('UPDATE SURVEY - Request body:', JSON.stringify(ctx.request.body, null, 2));
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      if (!data) {
        console.log('UPDATE SURVEY - Error: Missing data');
        return ctx.badRequest('Missing data');
      }
      
      console.log('UPDATE SURVEY - Updating survey with ID:', id);
      
      const entity = await strapi.entityService.update('api::survey.survey', id, {
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          isActive: data.isActive,
        }
      });
      
      console.log('UPDATE SURVEY - Success, updated survey with ID:', id);
      return { data: entity };
    } catch (error) {
      console.error('UPDATE SURVEY - Error:', error.message);
      return ctx.badRequest(`Error updating survey: ${error.message}`);
    }
  },
  
  // Eliminar una encuesta
  async delete(ctx) {
    console.log('DELETE SURVEY - Request params:', ctx.params);
    try {
      const { id } = ctx.params;
      
      console.log('DELETE SURVEY - Deleting survey with ID:', id);
      
      const entity = await strapi.entityService.delete('api::survey.survey', id);
      
      console.log('DELETE SURVEY - Success, deleted survey with ID:', id);
      return { data: entity };
    } catch (error) {
      console.error('DELETE SURVEY - Error:', error.message);
      return ctx.badRequest(`Error deleting survey: ${error.message}`);
    }
  },

  // Obtener encuestas disponibles (isActive: true)
  async available(ctx) {
    console.log('AVAILABLE SURVEYS - Request params:', ctx.query);
    try {
      const entities = await strapi.entityService.findMany('api::survey.survey', {
        filters: {
          isActive: true
        },
        populate: ['responses'],
      });
      
      console.log(`AVAILABLE SURVEYS - Found ${entities.length} available surveys`);
      return { data: entities };
    } catch (error) {
      console.error('AVAILABLE SURVEYS - Error:', error.message);
      return ctx.badRequest(`Error finding available surveys: ${error.message}`);
    }
  }
}));
