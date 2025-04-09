"use strict";
/**
 * vehicle controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::vehicle.vehicle', ({ strapi }) => ({
    async create(ctx) {
        var _a;
        try {
            const data = JSON.parse(ctx.request.body.data || "{}");
            const imgUrl = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.imgUrl;
            if (imgUrl) {
                const uploadedFiles = await strapi.plugins.upload.service("upload").upload({
                    data: {
                        ref: "api::vehicle.vehicle",
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const createdVehicle = await strapi.entityService.create("api::vehicle.vehicle", {
                        data: {
                            ...data,
                            owner: data.owner,
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    return ctx.send(createdVehicle);
                }
                throw new Error("No se pudo subir la imagen.");
            }
            const createdVehicle = await strapi.entityService.create("api::vehicle.vehicle", {
                data: {
                    ...data,
                    owner: data.owner,
                },
            });
            return ctx.send(createdVehicle);
        }
        catch (error) {
            return ctx.badRequest({
                error: error.message + " Error al crear vehículo.",
            });
        }
    },
    async findByOwner(ctx) {
        const { ownerId } = ctx.params;
        try {
            const query = {
                where: {
                    owner: parseInt(ownerId),
                },
                populate: { imgUrl: true, owner: true },
            };
            const vehicles = await strapi.db.query("api::vehicle.vehicle").findMany(query);
            const processedVehicles = vehicles.map((vehicle) => {
                var _a, _b, _c, _d;
                return ({
                    id: vehicle.id,
                    brand: vehicle.brand,
                    color: vehicle.color,
                    plaque: vehicle.plaque,
                    type: vehicle.type,
                    imgUrl: ((_c = (_b = (_a = vehicle.imgUrl) === null || _a === void 0 ? void 0 : _a.formats) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url) || ((_d = vehicle.imgUrl) === null || _d === void 0 ? void 0 : _d.url) || null,
                });
            });
            return ctx.send(processedVehicles);
        }
        catch (error) {
            ctx.throw(500, error);
        }
    },
    async update(ctx) {
        var _a, _b;
        try {
            const { id } = ctx.params;
            const data = ctx.request.body.data
                ? typeof ctx.request.body.data === "string"
                    ? JSON.parse(ctx.request.body.data)
                    : ctx.request.body.data
                : {};
            const cleanData = {
                brand: data.brand,
                color: data.color,
                plaque: data.plaque,
                type: data.type,
                owner: ((_a = data.owner) === null || _a === void 0 ? void 0 : _a.id) || data.owner,
            };
            const updatedVehicle = await strapi.entityService.update("api::vehicle.vehicle", id, {
                data: cleanData,
            });
            const imgUrl = (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b.imgUrl;
            if (imgUrl) {
                const uploadedFiles = await strapi.plugins.upload.service("upload").upload({
                    data: {
                        ref: "api::vehicle.vehicle",
                        refId: updatedVehicle.id,
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const finalVehicle = await strapi.entityService.update("api::vehicle.vehicle", updatedVehicle.id, {
                        data: {
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    return ctx.send(finalVehicle);
                }
            }
            return ctx.send(updatedVehicle);
        }
        catch (error) {
            return ctx.badRequest({
                error: error.message + " Error al actualizar vehículo",
            });
        }
    },
    async delete(ctx) {
        const { id } = ctx.params;
        try {
            const vehicle = await strapi.db.query("api::vehicle.vehicle").findOne({
                where: { id },
            });
            if (!vehicle) {
                return ctx.notFound("El vehículo no existe.");
            }
            await strapi.db.query("api::vehicle.vehicle").delete({
                where: { id },
            });
            return { message: "Vehículo eliminado exitosamente." };
        }
        catch (err) {
            ctx.throw(500, err);
        }
    },
}));
