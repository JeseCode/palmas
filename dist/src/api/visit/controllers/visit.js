"use strict";
/**
 * visit controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::visit.visit", ({ strapi }) => ({
    // Método personalizado para obtener visitas por usuario
    async findByUser(ctx) {
        const { userId } = ctx.params;
        try {
            // Validar que el usuario existe
            const userExists = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({
                where: { id: userId },
            });
            if (!userExists) {
                return ctx.notFound("Usuario no encontrado");
            }
            // Obtener las visitas del usuario
            const visits = await strapi.db.query("api::visit.visit").findMany({
                where: { user: userId },
                populate: ["visitors", "vehicle"],
            });
            // Sanitizar los datos antes de enviarlos
            const sanitizedVisits = visits.map((visit) => {
                return {
                    ...visit,
                    user: { id: userExists.id, username: userExists.username },
                };
            });
            return sanitizedVisits;
        }
        catch (error) {
            console.error("Error al obtener visitas por usuario:", error);
            return ctx.badRequest("Error al obtener visitas");
        }
    },
    // Sobreescribir el método find para personalizar la respuesta
    async find(ctx) {
        try {
            // Llamar al método original
            const result = await super.find(ctx);
            // Verificar si hay datos
            if (!result || !result.data || !Array.isArray(result.data)) {
                console.log("No hay datos o no es un array:", result);
                return { data: [], meta: (result === null || result === void 0 ? void 0 : result.meta) || {} };
            }
            // Procesar los datos para asegurar que tienen la estructura correcta
            const processedData = await Promise.all(result.data.map(async (item) => {
                const visit = item.attributes;
                const id = item.id;
                // Obtener los datos completos con las relaciones populadas
                const populatedVisit = await strapi.entityService.findOne("api::visit.visit", id, {
                    populate: ["visitors", "vehicle", "user"],
                });
                // Sanitizar los datos del usuario si existen
                let safeUserData = null;
                if (populatedVisit) {
                    // Usar acceso seguro con operador opcional
                    const userData = populatedVisit.user;
                    if (userData) {
                        // Eliminar datos sensibles
                        const { password, resetPasswordToken, confirmationToken, ...safeData } = userData;
                        safeUserData = safeData;
                    }
                }
                // Devolver los datos procesados
                return {
                    id,
                    ...visit,
                    visitors: (populatedVisit === null || populatedVisit === void 0 ? void 0 : populatedVisit.visitors) || [],
                    vehicle: (populatedVisit === null || populatedVisit === void 0 ? void 0 : populatedVisit.vehicle) || null,
                    user: safeUserData,
                };
            }));
            return { data: processedData, meta: result.meta };
        }
        catch (error) {
            console.error("Error en find personalizado:", error);
            return ctx.badRequest("Error al obtener las visitas");
        }
    },
    // Método para crear una visita
    async create(ctx) {
        try {
            const { data } = ctx.request.body;
            // Validar que se proporcionaron los datos necesarios
            if (!data ||
                !data.entry_date ||
                !data.visiting_place ||
                !data.visitors ||
                !data.visitors.length) {
                return ctx.badRequest("Faltan datos requeridos para crear la visita");
            }
            // Crear la visita
            const visit = await strapi.entityService.create("api::visit.visit", {
                data: {
                    entry_date: data.entry_date,
                    visiting_place: data.visiting_place,
                    status: "active",
                    visitors: data.visitors,
                    vehicle: data.vehicle,
                    user: data.user,
                },
                populate: ["visitors", "vehicle", "user"],
            });
            // Sanitizar los datos del usuario si existen
            let sanitizedVisit = { ...visit };
            if (visit) {
                // Usar acceso seguro con operador opcional
                const userData = visit.user;
                if (userData) {
                    // Eliminar datos sensibles
                    const { password, resetPasswordToken, confirmationToken, ...safeData } = userData;
                    sanitizedVisit.user = safeData;
                }
            }
            // Enviar notificación si hay un usuario asociado
            if (sanitizedVisit.user && sanitizedVisit.user.id) {
                try {
                    // Obtener el nombre del visitante de forma segura
                    let visitorName = "un visitante";
                    if (sanitizedVisit.visitors && sanitizedVisit.visitors.length > 0) {
                        const visitor = sanitizedVisit.visitors[0];
                        if (visitor.first_name || visitor.last_name) {
                            visitorName = `${visitor.first_name || ''} ${visitor.last_name || ''}`.trim();
                        }
                        else if (visitor.name) {
                            visitorName = visitor.name;
                        }
                    }
                    // Crear la notificación
                    await strapi.service("api::notification.notification").create({
                        data: {
                            title: "Nueva visita registrada",
                            message: `Se ha registrado una visita para ti de ${visitorName}`,
                            type: "info",
                            read: false,
                            user: sanitizedVisit.user.id,
                        },
                    });
                    // Enviar notificación en tiempo real si está disponible el servicio SSE
                    if (strapi.service("api::sse.sse")) {
                        await strapi.service("api::sse.sse").sendNotification({
                            userId: sanitizedVisit.user.id,
                            data: {
                                title: "Nueva visita registrada",
                                message: `Se ha registrado una visita para ti de ${visitorName}`,
                            },
                        });
                    }
                }
                catch (error) {
                    // Registrar el error pero continuar con la creación de la visita
                    console.error("Error al enviar notificación:", error);
                }
            }
            return sanitizedVisit;
        }
        catch (error) {
            console.error("Error al crear la visita:", error);
            return ctx.badRequest("Error al crear la visita");
        }
    },
    // Método para finalizar una visita
    async finish(ctx) {
        try {
            const { id } = ctx.params;
            // Verificar que la visita existe y está activa
            const visit = await strapi.db.query("api::visit.visit").findOne({
                where: { id, status: "active" },
            });
            if (!visit) {
                return ctx.notFound("Visita no encontrada o ya finalizada");
            }
            // Actualizar la visita con la fecha de salida y el estado
            const updatedVisit = await strapi.entityService.update("api::visit.visit", id, {
                data: {
                    exit_date: new Date().toISOString(),
                    status: "finished",
                },
                populate: ["user", "visitors", "vehicle"],
            });
            // Filtrar información sensible del usuario
            let sanitizedVisit = { ...updatedVisit };
            if (updatedVisit) {
                // Usar acceso seguro con operador opcional
                const userData = updatedVisit.user;
                if (userData) {
                    // Eliminar datos sensibles
                    const { password, resetPasswordToken, confirmationToken, ...safeData } = userData;
                    sanitizedVisit.user = safeData;
                }
            }
            return sanitizedVisit;
        }
        catch (error) {
            console.error("Error al finalizar la visita:", error);
            return ctx.badRequest("Error al finalizar la visita");
        }
    },
    // Método para marcar visitantes como frecuentes
    async markVisitorAsFrequent(ctx) {
        try {
            const { visitorId } = ctx.params;
            if (!visitorId) {
                return ctx.badRequest("ID de visitante requerido");
            }
            // Verificar que el visitante existe
            const visitor = await strapi.db.query("api::visitor.visitor").findOne({
                where: { id: visitorId },
            });
            if (!visitor) {
                return ctx.notFound("Visitante no encontrado");
            }
            // Marcar como frecuente
            const updatedVisitor = await strapi.entityService.update("api::visitor.visitor", visitorId, {
                data: {
                    is_frequent: true,
                },
            });
            return updatedVisitor;
        }
        catch (error) {
            console.error("Error al marcar visitante como frecuente:", error);
            return ctx.badRequest("Error al actualizar el visitante");
        }
    },
    // Método para obtener visitantes frecuentes
    async getFrequentVisitors(ctx) {
        try {
            const frequentVisitors = await strapi.db
                .query("api::visitor.visitor")
                .findMany({
                where: { is_frequent: true },
            });
            return frequentVisitors;
        }
        catch (error) {
            console.error("Error al obtener visitantes frecuentes:", error);
            return ctx.badRequest("Error al obtener visitantes frecuentes");
        }
    },
}));
