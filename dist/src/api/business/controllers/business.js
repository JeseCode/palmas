"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
/**
 * Genera un ID de documento único para un nuevo emprendimiento
 * @returns String con ID único de 24 caracteres
 */
function generateDocumentId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.default = strapi_1.factories.createCoreController("api::business.business", ({ strapi }) => ({
    async create(ctx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        try {
            console.log("Inicio de creación de emprendimiento...");
            // Depurar la estructura completa de ctx.request.files
            console.log("Estructura de ctx.request.files:", JSON.stringify(ctx.request.files, null, 2));
            // Parsear los datos enviados en el cuerpo de la solicitud
            const data = JSON.parse(ctx.request.body.data || "{}");
            console.log("Datos recibidos:", data);
            // Obtener las imágenes desde los archivos enviados
            const logo = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a["files.logo"];
            const photoOne = (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b["files.photoOne"];
            const photoTwo = (_c = ctx.request.files) === null || _c === void 0 ? void 0 : _c["files.photoTwo"];
            const photoThree = (_d = ctx.request.files) === null || _d === void 0 ? void 0 : _d["files.photoThree"];
            const photoFour = (_e = ctx.request.files) === null || _e === void 0 ? void 0 : _e["files.photoFour"];
            console.log("Imágenes recibidas después de corrección:", {
                logo: logo ? (Array.isArray(logo) ? logo.length : 1) : false,
                photoOne: photoOne ? (Array.isArray(photoOne) ? photoOne.length : 1) : false,
                photoTwo: photoTwo ? (Array.isArray(photoTwo) ? photoTwo.length : 1) : false,
                photoThree: photoThree ? (Array.isArray(photoThree) ? photoThree.length : 1) : false,
                photoFour: photoFour ? (Array.isArray(photoFour) ? photoFour.length : 1) : false,
                logoDetails: logo ? (Array.isArray(logo) ? logo.map(f => ({ size: f.size })) : { size: logo.size }) : null,
                photoOneDetails: photoOne ? (Array.isArray(photoOne) ? photoOne.map(f => ({ size: f.size })) : { size: photoOne.size }) : null,
                photoTwoDetails: photoTwo ? (Array.isArray(photoTwo) ? photoTwo.map(f => ({ size: f.size })) : { size: photoTwo.size }) : null,
                photoThreeDetails: photoThree ? (Array.isArray(photoThree) ? photoThree.map(f => ({ size: f.size })) : { size: photoThree.size }) : null,
                photoFourDetails: photoFour ? (Array.isArray(photoFour) ? photoFour.map(f => ({ size: f.size })) : { size: photoFour.size }) : null
            });
            // Crear el emprendimiento sin las imágenes primero
            const entity = await strapi.entityService.create("api::business.business", {
                data: {
                    ...data,
                    documentId: generateDocumentId(),
                    businessUser: (_f = ctx.state.user) === null || _f === void 0 ? void 0 : _f.id,
                },
            });
            console.log("Emprendimiento creado:", {
                id: entity.id,
                name: entity.name,
            });
            // Subir las imágenes si existen
            if (logo || photoOne || photoTwo || photoThree || photoFour) {
                console.log("Subiendo imágenes...");
                const uploadPromises = [];
                // Subir el logo
                if (logo) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: entity.id,
                            field: "logo",
                        },
                        files: logo,
                    }));
                }
                // Subir las fotos
                if (photoOne) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: entity.id,
                            field: "photoOne",
                        },
                        files: photoOne,
                    }));
                }
                if (photoTwo) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: entity.id,
                            field: "photoTwo",
                        },
                        files: photoTwo,
                    }));
                }
                if (photoThree) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: entity.id,
                            field: "photoThree",
                        },
                        files: photoThree,
                    }));
                }
                if (photoFour) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: entity.id,
                            field: "photoFour",
                        },
                        files: photoFour,
                    }));
                }
                // Esperar a que todas las imágenes se suban
                const uploadResults = await Promise.all(uploadPromises);
                console.log("Resultados de subida de imágenes:", uploadResults.map(result => {
                    var _a, _b, _c;
                    return ({
                        id: (_a = result[0]) === null || _a === void 0 ? void 0 : _a.id,
                        name: (_b = result[0]) === null || _b === void 0 ? void 0 : _b.name,
                        url: (_c = result[0]) === null || _c === void 0 ? void 0 : _c.url
                    });
                }));
            }
            // Obtener el emprendimiento con las imágenes
            const updatedEntity = await strapi.db.query("api::business.business").findOne({
                where: { id: entity.id },
                populate: {
                    logo: true,
                    photoOne: true,
                    photoTwo: true,
                    photoThree: true,
                    photoFour: true,
                    businessUser: {
                        select: ['id', 'username', 'email', 'firstName', 'lastName', 'address', 'phone'],
                    },
                },
            });
            // Procesar los datos para el formato esperado por el frontend
            const processedEntity = {
                id: updatedEntity.id,
                documentId: updatedEntity.documentId,
                name: updatedEntity.name,
                category: updatedEntity.category,
                description: updatedEntity.description,
                phone: updatedEntity.phone,
                email: updatedEntity.email,
                address: updatedEntity.address,
                schedule: updatedEntity.schedule,
                website: updatedEntity.website,
                facebook: updatedEntity.facebook,
                instagram: updatedEntity.instagram,
                featured: updatedEntity.featured,
                createdAt: updatedEntity.createdAt,
                updatedAt: updatedEntity.updatedAt,
                publishedAt: updatedEntity.publishedAt,
                // Procesar las URLs de las imágenes
                logo: ((_g = updatedEntity.logo) === null || _g === void 0 ? void 0 : _g.url) || null,
                photoOne: ((_h = updatedEntity.photoOne) === null || _h === void 0 ? void 0 : _h.url) || null,
                photoTwo: ((_j = updatedEntity.photoTwo) === null || _j === void 0 ? void 0 : _j.url) || null,
                photoThree: ((_k = updatedEntity.photoThree) === null || _k === void 0 ? void 0 : _k.url) || null,
                photoFour: ((_l = updatedEntity.photoFour) === null || _l === void 0 ? void 0 : _l.url) || null,
                photosCount: [
                    updatedEntity.photoOne,
                    updatedEntity.photoTwo,
                    updatedEntity.photoThree,
                    updatedEntity.photoFour
                ].filter(Boolean).length,
                // Filtrar información del usuario
                userName: ((_m = updatedEntity.businessUser) === null || _m === void 0 ? void 0 : _m.username) || null,
                businessUser: updatedEntity.businessUser ? {
                    id: updatedEntity.businessUser.id,
                    username: updatedEntity.businessUser.username,
                    email: updatedEntity.businessUser.email,
                    firstName: updatedEntity.businessUser.firstName,
                    lastName: updatedEntity.businessUser.lastName,
                    address: updatedEntity.businessUser.address,
                    phone: updatedEntity.businessUser.phone
                } : null
            };
            console.log("Emprendimiento creado con imágenes:", {
                id: processedEntity.id,
                name: processedEntity.name,
                logo: processedEntity.logo ? "Presente" : null,
                photoOne: processedEntity.photoOne ? "Presente" : null,
                photoTwo: processedEntity.photoTwo ? "Presente" : null,
                photoThree: processedEntity.photoThree ? "Presente" : null,
                photoFour: processedEntity.photoFour ? "Presente" : null,
                photosCount: processedEntity.photosCount
            });
            return processedEntity;
        }
        catch (error) {
            console.error("Error al crear emprendimiento:", error);
            ctx.throw(500, error);
        }
    },
    async update(ctx) {
        var _a, _b, _c, _d, _e;
        try {
            const { id } = ctx.params;
            console.log(`Actualizando emprendimiento con ID: ${id}`);
            // Verificar si el emprendimiento existe
            const existingBusiness = await strapi.db.query("api::business.business").findOne({
                where: { id },
                populate: ["logo", "photoOne", "photoTwo", "photoThree", "photoFour", "businessUser"],
            });
            if (!existingBusiness) {
                return ctx.notFound("Emprendimiento no encontrado");
            }
            // Parsear los datos enviados en el cuerpo de la solicitud
            const parsedData = JSON.parse(ctx.request.body.data || "{}");
            console.log("Datos recibidos para actualización:", parsedData);
            // Obtener las imágenes desde los archivos enviados
            const logo = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a["files.logo"];
            const photoOne = (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b["files.photoOne"];
            const photoTwo = (_c = ctx.request.files) === null || _c === void 0 ? void 0 : _c["files.photoTwo"];
            const photoThree = (_d = ctx.request.files) === null || _d === void 0 ? void 0 : _d["files.photoThree"];
            const photoFour = (_e = ctx.request.files) === null || _e === void 0 ? void 0 : _e["files.photoFour"];
            // Registrar información detallada sobre las imágenes recibidas
            console.log("Imágenes recibidas:", {
                logo: logo ? (Array.isArray(logo) ? logo.length : 1) : false,
                photoOne: photoOne ? (Array.isArray(photoOne) ? photoOne.length : 1) : false,
                photoTwo: photoTwo ? (Array.isArray(photoTwo) ? photoTwo.length : 1) : false,
                photoThree: photoThree ? (Array.isArray(photoThree) ? photoThree.length : 1) : false,
                photoFour: photoFour ? (Array.isArray(photoFour) ? photoFour.length : 1) : false,
            });
            // Preparar datos para actualización
            const updateData = {
                name: parsedData.name,
                category: parsedData.category,
                description: parsedData.description,
                phone: parsedData.phone,
                address: parsedData.address,
                email: parsedData.email,
                schedule: parsedData.schedule,
                website: parsedData.website,
                featured: parsedData.featured,
            };
            // Solo mantener las referencias a las imágenes existentes si no se están actualizando
            if (!logo && existingBusiness.logo) {
                updateData.logo = existingBusiness.logo.id;
            }
            else if (!logo) {
                updateData.logo = null;
            }
            if (!photoOne && existingBusiness.photoOne) {
                updateData.photoOne = existingBusiness.photoOne.id;
            }
            else if (!photoOne) {
                updateData.photoOne = null;
            }
            if (!photoTwo && existingBusiness.photoTwo) {
                updateData.photoTwo = existingBusiness.photoTwo.id;
            }
            else if (!photoTwo) {
                updateData.photoTwo = null;
            }
            if (!photoThree && existingBusiness.photoThree) {
                updateData.photoThree = existingBusiness.photoThree.id;
            }
            else if (!photoThree) {
                updateData.photoThree = null;
            }
            if (!photoFour && existingBusiness.photoFour) {
                updateData.photoFour = existingBusiness.photoFour.id;
            }
            else if (!photoFour) {
                updateData.photoFour = null;
            }
            console.log("Datos preparados para actualización:", updateData);
            // Actualizar el emprendimiento con los datos básicos
            const updatedEntity = await strapi.entityService.update("api::business.business", id, {
                data: updateData,
            });
            console.log("Emprendimiento actualizado con datos básicos:", {
                id: updatedEntity.id,
                name: updatedEntity.name,
            });
            // Subir las imágenes si existen
            if (logo || photoOne || photoTwo || photoThree || photoFour) {
                console.log("Subiendo imágenes para actualización...");
                const uploadPromises = [];
                // Subir el logo
                if (logo) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: id,
                            field: "logo",
                        },
                        files: logo,
                    }));
                }
                // Subir la foto principal
                if (photoOne) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: id,
                            field: "photoOne",
                        },
                        files: photoOne,
                    }));
                }
                // Subir la foto secundaria
                if (photoTwo) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: id,
                            field: "photoTwo",
                        },
                        files: photoTwo,
                    }));
                }
                // Subir la foto terciaria
                if (photoThree) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: id,
                            field: "photoThree",
                        },
                        files: photoThree,
                    }));
                }
                // Subir la foto cuaternaria
                if (photoFour) {
                    uploadPromises.push(strapi.plugins.upload.service("upload").upload({
                        data: {
                            ref: "api::business.business",
                            refId: id,
                            field: "photoFour",
                        },
                        files: photoFour,
                    }));
                }
                // Esperar a que todas las imágenes se suban
                if (uploadPromises.length > 0) {
                    await Promise.all(uploadPromises);
                    console.log("Todas las imágenes se han subido correctamente");
                }
            }
            // Buscar el emprendimiento actualizado con todas sus relaciones
            const updatedBusiness = await strapi.entityService.findOne("api::business.business", id, {
                populate: ["logo", "photoOne", "photoTwo", "photoThree", "photoFour", "businessUser"],
            });
            // Mapear los resultados para la respuesta
            const result = {
                id: updatedBusiness.id,
                name: updatedBusiness.name,
                category: updatedBusiness.category,
                description: updatedBusiness.description,
                phone: updatedBusiness.phone,
                email: updatedBusiness.email,
                address: updatedBusiness.address,
                schedule: updatedBusiness.schedule,
                website: updatedBusiness.website,
                featured: updatedBusiness.featured,
                createdAt: updatedBusiness.createdAt,
                updatedAt: updatedBusiness.updatedAt,
                publishedAt: updatedBusiness.publishedAt,
                logo: updatedBusiness.logo ? {
                    url: updatedBusiness.logo.url,
                    id: updatedBusiness.logo.id,
                    name: updatedBusiness.logo.name,
                } : null,
                photoOne: updatedBusiness.photoOne ? {
                    url: updatedBusiness.photoOne.url,
                    id: updatedBusiness.photoOne.id,
                    name: updatedBusiness.photoOne.name,
                } : null,
                photoTwo: updatedBusiness.photoTwo ? {
                    url: updatedBusiness.photoTwo.url,
                    id: updatedBusiness.photoTwo.id,
                    name: updatedBusiness.photoTwo.name,
                } : null,
                photoThree: updatedBusiness.photoThree ? {
                    url: updatedBusiness.photoThree.url,
                    id: updatedBusiness.photoThree.id,
                    name: updatedBusiness.photoThree.name,
                } : null,
                photoFour: updatedBusiness.photoFour ? {
                    url: updatedBusiness.photoFour.url,
                    id: updatedBusiness.photoFour.id,
                    name: updatedBusiness.photoFour.name,
                } : null,
                businessUser: updatedBusiness.businessUser ? {
                    id: updatedBusiness.businessUser.id,
                    username: updatedBusiness.businessUser.username,
                    email: updatedBusiness.businessUser.email,
                } : null,
            };
            return { data: result };
        }
        catch (error) {
            console.error("Error al actualizar emprendimiento:", error);
            return ctx.badRequest(`Error al actualizar emprendimiento: ${error.message}`);
        }
    },
    async find(ctx) {
        try {
            // Obtener los parámetros de consulta
            const { _q, _sort, _limit, _start, ...filters } = ctx.query;
            // Construir la consulta
            const query = {
                ...(filters || {}),
            };
            // Convertir _limit y _start a números
            const limit = parseInt(_limit, 10) || 25;
            const start = parseInt(_start, 10) || 0;
            // Ejecutar la consulta
            const [entities, count] = await Promise.all([
                strapi.entityService.findMany("api::business.business", {
                    filters: query,
                    sort: _sort ? _sort : undefined,
                    limit,
                    start,
                    populate: {
                        logo: true,
                        photoOne: true,
                        photoTwo: true,
                        photoThree: true,
                        photoFour: true,
                        businessUser: {
                            fields: ['id', 'username', 'email', 'firstName', 'lastName', 'address', 'phone'],
                        },
                    },
                }),
                strapi.entityService.count("api::business.business", {
                    filters: query,
                }),
            ]);
            // Procesar los resultados
            const results = entities.map((entity) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: entity.id,
                    documentId: entity.documentId,
                    name: entity.name,
                    category: entity.category,
                    description: entity.description,
                    phone: entity.phone,
                    email: entity.email,
                    address: entity.address,
                    schedule: entity.schedule,
                    website: entity.website,
                    facebook: entity.facebook,
                    instagram: entity.instagram,
                    featured: entity.featured,
                    createdAt: entity.createdAt,
                    updatedAt: entity.updatedAt,
                    publishedAt: entity.publishedAt,
                    // Procesar las URLs de las imágenes como campos individuales
                    logo: ((_a = entity.logo) === null || _a === void 0 ? void 0 : _a.url) || null,
                    photoOne: ((_b = entity.photoOne) === null || _b === void 0 ? void 0 : _b.url) || null,
                    photoTwo: ((_c = entity.photoTwo) === null || _c === void 0 ? void 0 : _c.url) || null,
                    photoThree: ((_d = entity.photoThree) === null || _d === void 0 ? void 0 : _d.url) || null,
                    photoFour: ((_e = entity.photoFour) === null || _e === void 0 ? void 0 : _e.url) || null,
                    // Filtrar información del usuario
                    userName: ((_f = entity.businessUser) === null || _f === void 0 ? void 0 : _f.username) || null,
                    businessUser: entity.businessUser ? {
                        id: entity.businessUser.id,
                        username: entity.businessUser.username,
                        email: entity.businessUser.email,
                        firstName: entity.businessUser.firstName,
                        lastName: entity.businessUser.lastName,
                        address: entity.businessUser.address,
                        phone: entity.businessUser.phone
                    } : null
                });
            });
            return {
                data: results,
                meta: {
                    pagination: {
                        page: Math.floor(start / limit) + 1,
                        pageSize: limit,
                        pageCount: Math.ceil(count / limit),
                        total: count,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error al obtener emprendimientos:", error);
            ctx.throw(500, error);
        }
    },
    async findOne(ctx) {
        var _a, _b, _c, _d, _e, _f;
        try {
            const { id } = ctx.params;
            // Obtener el emprendimiento
            const entity = await strapi.entityService.findOne("api::business.business", id, {
                populate: {
                    logo: true,
                    photoOne: true,
                    photoTwo: true,
                    photoThree: true,
                    photoFour: true,
                    businessUser: {
                        select: ['id', 'username', 'email', 'firstName', 'lastName', 'address', 'phone'],
                    },
                },
            });
            if (!entity) {
                return ctx.notFound("Emprendimiento no encontrado");
            }
            // Procesar los datos para el formato esperado por el frontend
            const processedEntity = {
                id: entity.id,
                documentId: entity.documentId,
                name: entity.name,
                category: entity.category,
                description: entity.description,
                phone: entity.phone,
                email: entity.email,
                address: entity.address,
                schedule: entity.schedule,
                website: entity.website,
                facebook: entity.facebook,
                instagram: entity.instagram,
                featured: entity.featured,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                publishedAt: entity.publishedAt,
                // Procesar las URLs de las imágenes
                logo: ((_a = entity.logo) === null || _a === void 0 ? void 0 : _a.url) || null,
                photoOne: ((_b = entity.photoOne) === null || _b === void 0 ? void 0 : _b.url) || null,
                photoTwo: ((_c = entity.photoTwo) === null || _c === void 0 ? void 0 : _c.url) || null,
                photoThree: ((_d = entity.photoThree) === null || _d === void 0 ? void 0 : _d.url) || null,
                photoFour: ((_e = entity.photoFour) === null || _e === void 0 ? void 0 : _e.url) || null,
                photosCount: [
                    entity.photoOne,
                    entity.photoTwo,
                    entity.photoThree,
                    entity.photoFour
                ].filter(Boolean).length,
                // Filtrar información del usuario
                userName: ((_f = entity.businessUser) === null || _f === void 0 ? void 0 : _f.username) || null,
                businessUser: entity.businessUser ? {
                    id: entity.businessUser.id,
                    username: entity.businessUser.username,
                    email: entity.businessUser.email,
                    firstName: entity.businessUser.firstName,
                    lastName: entity.businessUser.lastName,
                    address: entity.businessUser.address,
                    phone: entity.businessUser.phone
                } : null
            };
            return processedEntity;
        }
        catch (error) {
            console.error("Error al obtener emprendimiento:", error);
            ctx.throw(500, error);
        }
    },
    /**
     * Busca negocios por ID de propietario
     * @param {Object} ctx - Contexto de Koa
     * @returns {Object} Negocios encontrados
     */
    async findById(ctx) {
        try {
            const { ownerId } = ctx.params;
            if (!ownerId) {
                return ctx.badRequest("ID de propietario no proporcionado");
            }
            console.log(`Buscando negocios para el propietario con ID: ${ownerId}`);
            // Ejecutar la consulta
            const entities = await strapi.entityService.findMany("api::business.business", {
                filters: {
                    businessUser: ownerId
                },
                populate: {
                    logo: true,
                    photoOne: true,
                    photoTwo: true,
                    photoThree: true,
                    photoFour: true,
                    businessUser: {
                        fields: ['id', 'username', 'email', 'firstName', 'lastName', 'address', 'phone'],
                    },
                },
            });
            // Procesar los resultados
            const results = entities.map((entity) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: entity.id,
                    documentId: entity.documentId,
                    name: entity.name,
                    category: entity.category,
                    description: entity.description,
                    phone: entity.phone,
                    email: entity.email,
                    address: entity.address,
                    schedule: entity.schedule,
                    website: entity.website,
                    facebook: entity.facebook,
                    instagram: entity.instagram,
                    featured: entity.featured,
                    createdAt: entity.createdAt,
                    updatedAt: entity.updatedAt,
                    publishedAt: entity.publishedAt,
                    // Procesar las URLs de las imágenes
                    logo: ((_a = entity.logo) === null || _a === void 0 ? void 0 : _a.url) || null,
                    photoOne: ((_b = entity.photoOne) === null || _b === void 0 ? void 0 : _b.url) || null,
                    photoTwo: ((_c = entity.photoTwo) === null || _c === void 0 ? void 0 : _c.url) || null,
                    photoThree: ((_d = entity.photoThree) === null || _d === void 0 ? void 0 : _d.url) || null,
                    photoFour: ((_e = entity.photoFour) === null || _e === void 0 ? void 0 : _e.url) || null,
                    photosCount: [
                        entity.photoOne,
                        entity.photoTwo,
                        entity.photoThree,
                        entity.photoFour
                    ].filter(Boolean).length,
                    // Filtrar información del usuario
                    userName: ((_f = entity.businessUser) === null || _f === void 0 ? void 0 : _f.username) || null,
                    businessUser: entity.businessUser ? {
                        id: entity.businessUser.id,
                        username: entity.businessUser.username,
                        email: entity.businessUser.email,
                        firstName: entity.businessUser.firstName,
                        lastName: entity.businessUser.lastName,
                        address: entity.businessUser.address,
                        phone: entity.businessUser.phone
                    } : null
                });
            });
            return {
                data: results,
                meta: {
                    count: results.length
                }
            };
        }
        catch (error) {
            console.error("Error al buscar negocios por propietario:", error);
            return ctx.badRequest(`Error al buscar negocios por propietario: ${error.message}`);
        }
    },
    // Método personalizado para eliminar un negocio
    delete: async (ctx) => {
        try {
            const { id } = ctx.params;
            // Validar que se proporcione un ID
            if (!id) {
                return ctx.badRequest("Se requiere un ID de negocio para eliminar");
            }
            console.log(`Intentando eliminar negocio con ID: ${id}`);
            // Verificar si el negocio existe
            const business = await strapi.entityService.findOne("api::business.business", id, {
                populate: ["businessUser"],
            });
            if (!business) {
                return ctx.notFound(`No se encontró un negocio con ID: ${id}`);
            }
            // Eliminar el negocio
            const deletedBusiness = await strapi.entityService.delete("api::business.business", id);
            console.log(`Negocio eliminado exitosamente: ${id}`);
            return {
                data: deletedBusiness,
                meta: {
                    message: "Negocio eliminado exitosamente",
                },
            };
        }
        catch (error) {
            console.error(`Error al eliminar negocio: ${error.message}`);
            return ctx.badRequest(`Error al eliminar negocio: ${error.message}`);
        }
    },
}));
