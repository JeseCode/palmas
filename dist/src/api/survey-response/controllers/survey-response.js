'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * survey-response controller
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::survey-response.survey-response', ({ strapi }) => ({
    // Crear una nueva respuesta de encuesta
    async create(ctx) {
        var _a, _b;
        console.log('CREATE SURVEY RESPONSE - Request body:', JSON.stringify(ctx.request.body, null, 2));
        try {
            const { data } = ctx.request.body;
            // Validar campos requeridos
            if (!data || !data.response || !data.survey) {
                console.log('CREATE SURVEY RESPONSE - Error: Missing required fields');
                return ctx.badRequest('Missing required fields');
            }
            // Obtener ID de usuario del contexto si está disponible
            const userId = (_b = (_a = ctx.state) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
            console.log('CREATE SURVEY RESPONSE - User ID:', userId);
            // Obtener el coeficiente del usuario si está autenticado
            let userCoefficient = null;
            if (userId) {
                const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
                    fields: ['coefficient'],
                });
                userCoefficient = (user === null || user === void 0 ? void 0 : user.coefficient) || null;
                console.log('CREATE SURVEY RESPONSE - User coefficient:', userCoefficient);
            }
            console.log('CREATE SURVEY RESPONSE - Creating response with data:', JSON.stringify(data, null, 2));
            // Crear la respuesta de encuesta
            const entity = await strapi.entityService.create('api::survey-response.survey-response', {
                data: {
                    response: data.response,
                    survey: data.survey,
                    respondent: userId || null,
                    coefficient: userCoefficient,
                    publishedAt: new Date(),
                }
            });
            console.log('CREATE SURVEY RESPONSE - Success, created response with ID:', entity.id);
            return { data: entity };
        }
        catch (error) {
            console.error('CREATE SURVEY RESPONSE - Error:', error.message);
            return ctx.badRequest(`Error creating survey response: ${error.message}`);
        }
    },
    // Encontrar todas las respuestas de encuesta
    async find(ctx) {
        console.log('FIND SURVEY RESPONSES - Request params:', ctx.query);
        try {
            const entities = await strapi.entityService.findMany('api::survey-response.survey-response', {
                populate: {
                    survey: true,
                    respondent: {
                        fields: ['username', 'firstName', 'lastName', 'address', 'coefficient', 'phone'],
                    },
                },
            });
            console.log(`FIND SURVEY RESPONSES - Found ${entities.length} responses`);
            return { data: entities };
        }
        catch (error) {
            console.error('FIND SURVEY RESPONSES - Error:', error.message);
            return ctx.badRequest(`Error finding survey responses: ${error.message}`);
        }
    },
    // Encontrar una respuesta de encuesta por ID
    async findOne(ctx) {
        console.log('FIND ONE SURVEY RESPONSE - Request params:', ctx.params);
        try {
            const { id } = ctx.params;
            const entity = await strapi.entityService.findOne('api::survey-response.survey-response', id, {
                populate: {
                    survey: true,
                    respondent: {
                        fields: ['username', 'firstName', 'lastName', 'address', 'coefficient', 'phone'],
                    },
                },
            });
            if (!entity) {
                console.log('FIND ONE SURVEY RESPONSE - Response not found with ID:', id);
                return ctx.notFound('Survey response not found');
            }
            console.log('FIND ONE SURVEY RESPONSE - Found response with ID:', id);
            return { data: entity };
        }
        catch (error) {
            console.error('FIND ONE SURVEY RESPONSE - Error:', error.message);
            return ctx.badRequest(`Error finding survey response: ${error.message}`);
        }
    },
    // Encontrar todas las respuestas para una encuesta específica
    async findBySurvey(ctx) {
        console.log('FIND RESPONSES BY SURVEY - Request params:', ctx.params);
        try {
            const { id } = ctx.params;
            console.log('FIND RESPONSES BY SURVEY - Finding responses for survey ID:', id);
            const entities = await strapi.entityService.findMany('api::survey-response.survey-response', {
                filters: {
                    survey: id,
                },
                populate: {
                    respondent: {
                        fields: ['username', 'firstName', 'lastName', 'address', 'coefficient', 'phone'],
                    },
                },
            });
            console.log(`FIND RESPONSES BY SURVEY - Found ${entities.length} responses for survey ID:`, id);
            return { data: entities };
        }
        catch (error) {
            console.error('FIND RESPONSES BY SURVEY - Error:', error.message);
            return ctx.badRequest(`Error finding survey responses: ${error.message}`);
        }
    },
    // Actualizar una respuesta de encuesta
    async update(ctx) {
        console.log('UPDATE SURVEY RESPONSE - Request params:', ctx.params);
        console.log('UPDATE SURVEY RESPONSE - Request body:', JSON.stringify(ctx.request.body, null, 2));
        try {
            const { id } = ctx.params;
            const { data } = ctx.request.body;
            console.log('UPDATE SURVEY RESPONSE - Updating response with ID:', id);
            const entity = await strapi.entityService.update('api::survey-response.survey-response', id, {
                data: {
                    response: data.response,
                }
            });
            console.log('UPDATE SURVEY RESPONSE - Success, updated response with ID:', id);
            return { data: entity };
        }
        catch (error) {
            console.error('UPDATE SURVEY RESPONSE - Error:', error.message);
            return ctx.badRequest(`Error updating survey response: ${error.message}`);
        }
    },
    // Eliminar una respuesta de encuesta
    async delete(ctx) {
        console.log('DELETE SURVEY RESPONSE - Request params:', ctx.params);
        try {
            const { id } = ctx.params;
            console.log('DELETE SURVEY RESPONSE - Deleting response with ID:', id);
            const entity = await strapi.entityService.delete('api::survey-response.survey-response', id);
            console.log('DELETE SURVEY RESPONSE - Success, deleted response with ID:', id);
            return { data: entity };
        }
        catch (error) {
            console.error('DELETE SURVEY RESPONSE - Error:', error.message);
            return ctx.badRequest(`Error deleting survey response: ${error.message}`);
        }
    }
}));
