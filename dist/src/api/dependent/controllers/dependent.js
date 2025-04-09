"use strict";
/**
 * dependent controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::dependent.dependent", ({ strapi }) => ({
    async create(ctx) {
        var _a;
        console.log("Inicio de createWithImage...");
        try {
            // Parsear datos del cuerpo de la solicitud
            console.log("Parseando datos del cuerpo de la solicitud...");
            const data = JSON.parse(ctx.request.body.data || "{}");
            console.log("Datos parseados:", data);
            // Verificar si se incluye un archivo de imagen
            const imgUrl = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.imgUrl;
            console.log("Archivo imgUrl presente:", imgUrl ? "Sí" : "No");
            if (imgUrl) {
                // Crear dependiente con la imagen en un solo paso
                console.log("Creando dependiente con imagen...");
                const uploadedFiles = await strapi.plugins.upload
                    .service("upload")
                    .upload({
                    data: {
                        ref: "api::dependent.dependent",
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                console.log("Archivos subidos:", uploadedFiles);
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const createdDependent = await strapi.entityService.create("api::dependent.dependent", {
                        data: {
                            ...data,
                            imgUrl: uploadedFiles[0].id, // Asociar la imagen directamente
                        },
                    });
                    console.log("Dependiente creado con imagen:", createdDependent);
                    return ctx.send(createdDependent);
                }
                else {
                    throw new Error("No se pudo subir la imagen.");
                }
            }
            else {
                // Crear dependiente sin imagen
                console.log("Creando dependiente sin imagen...");
                const createdDependent = await strapi.entityService.create("api::dependent.dependent", { data });
                console.log("Dependiente creado sin imagen:", createdDependent);
                return ctx.send(createdDependent);
            }
        }
        catch (error) {
            console.error("Error en createWithImage:", error);
            return ctx.badRequest({
                error: error.message + " Error al crear dependiente.",
            });
        }
    },
    async findByUser(ctx) {
        const { id } = ctx.params;
        try {
            // Consulta solo los dependientes publicados
            const dependents = await strapi.db
                .query("api::dependent.dependent")
                .findMany({
                where: {
                    users_permissions_user: id,
                    publishedAt: { $notNull: true }, // Asegúrate de que esté publicado
                },
                populate: {
                    imgUrl: {
                        select: ["url", "formats"], // Selecciona solo lo necesario
                    },
                },
            });
            // Procesar los datos si necesitas un formato específico de imgUrl
            const processedDependents = dependents.map((dependent) => {
                var _a, _b, _c;
                return ({
                    ...dependent,
                    imgUrl: ((_c = (_b = (_a = dependent.imgUrl) === null || _a === void 0 ? void 0 : _a.formats) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url) || null,
                });
            });
            return processedDependents;
        }
        catch (err) {
            ctx.throw(500, err);
        }
    },
    async delete(ctx) {
        const { id } = ctx.params;
        try {
            // Verifica si el dependiente existe antes de eliminarlo
            const dependent = await strapi.db.query("api::dependent.dependent").findOne({
                where: { id },
            });
            if (!dependent) {
                return ctx.notFound("El dependiente no existe.");
            }
            // Elimina el dependiente por su ID
            await strapi.db.query("api::dependent.dependent").delete({
                where: { id },
            });
            return { message: "Dependiente eliminado exitosamente." };
        }
        catch (err) {
            ctx.throw(500, err);
        }
    },
    async update(ctx) {
        var _a, _b;
        console.log("Inicio de updateWithImage...");
        try {
            const { id } = ctx.params; // ID del dependiente a actualizar
            // Parse data differently to handle the complex payload
            console.log("payload", ctx.request.body.data);
            const data = ctx.request.body.data
                ? typeof ctx.request.body.data === "string"
                    ? JSON.parse(ctx.request.body.data)
                    : ctx.request.body.data
                : {};
            // Clean up the data object
            const cleanData = {
                name: data.name,
                lastName: data.lastName,
                kinship: data.kinship,
                gender: data.gender,
                birthday: data.birthday,
                users_permissions_user: ((_a = data.users_permissions_user) === null || _a === void 0 ? void 0 : _a.id) || data.users_permissions_user,
            };
            console.log("Datos parseados:", cleanData);
            // Actualiza el dependiente sin la imagen primero
            console.log("Actualizando dependiente sin imagen...");
            const updatedDependent = await strapi.entityService.update("api::dependent.dependent", id, { data: cleanData });
            console.log("Dependiente actualizado:", updatedDependent);
            // Verificar si se envió una nueva imagen
            const imgUrl = (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b.imgUrl;
            console.log("Archivo imgUrl presente:", imgUrl ? "Sí" : "No");
            if (imgUrl) {
                console.log("Subiendo nueva imagen...");
                const uploadedFiles = await strapi.plugins.upload
                    .service("upload")
                    .upload({
                    data: {
                        ref: "api::dependent.dependent",
                        refId: updatedDependent.id,
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                console.log("Archivos subidos:", uploadedFiles);
                if (uploadedFiles && uploadedFiles.length > 0) {
                    console.log("Actualizando dependiente con nueva imagen...");
                    const finalDependent = await strapi.entityService.update("api::dependent.dependent", updatedDependent.id, {
                        data: {
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    console.log("Dependiente actualizado con imagen:", finalDependent);
                    return ctx.send(finalDependent);
                }
                else {
                    console.log("Error al subir la imagen o no se subió ningún archivo.");
                }
            }
            return ctx.send(updatedDependent);
        }
        catch (error) {
            console.error("Error al actualizar dependiente:", error);
            return ctx.badRequest({
                error: error.message + " Error al actualizar dependiente",
            });
        }
    },
}));
