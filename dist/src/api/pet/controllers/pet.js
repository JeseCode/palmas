"use strict";
/**
 * pet controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::pet.pet", ({ strapi }) => ({
    async create(ctx) {
        var _a;
        console.log("Inicio de createWithImage para Pet...");
        try {
            const data = JSON.parse(ctx.request.body.data || "{}");
            console.log("Datos parseados:", data);
            const imgUrl = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.imgUrl;
            console.log("Archivo imgUrl presente:", imgUrl ? "Sí" : "No");
            if (imgUrl) {
                console.log("Creando mascota con imagen...");
                const uploadedFiles = await strapi.plugins.upload.service("upload").upload({
                    data: {
                        ref: "api::pet.pet",
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const createdPet = await strapi.entityService.create("api::pet.pet", {
                        data: {
                            ...data,
                            owner: data.owner, // Relación actualizada
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    console.log("Mascota creada con imagen:", createdPet);
                    return ctx.send(createdPet);
                }
                else {
                    throw new Error("No se pudo subir la imagen.");
                }
            }
            else {
                console.log("Creando mascota sin imagen...");
                const createdPet = await strapi.entityService.create("api::pet.pet", {
                    data: {
                        ...data,
                        owner: data.owner, // Relación actualizada
                    },
                });
                console.log("Mascota creada sin imagen:", createdPet);
                return ctx.send(createdPet);
            }
        }
        catch (error) {
            console.error("Error en createWithImage para Pet:", error);
            return ctx.badRequest({
                error: error.message + " Error al crear mascota.",
            });
        }
    },
    async findByOwner(ctx) {
        const { ownerId } = ctx.params;
        try {
            const query = {
                where: {
                    owner: parseInt(ownerId),
                    publishedAt: { $notNull: true }, // Asegúrate de que esté publicado
                },
                populate: { imgUrl: true, owner: true },
            };
            const pets = await strapi.db.query("api::pet.pet").findMany(query);
            // Transformar los datos al formato esperado por el frontend
            const processedPets = pets.map((pet) => {
                var _a, _b, _c, _d;
                return ({
                    id: pet.id,
                    name: pet.name,
                    color: pet.color,
                    breed: pet.breed,
                    type: pet.type,
                    gender: pet.gender,
                    imgUrl: ((_c = (_b = (_a = pet.imgUrl) === null || _a === void 0 ? void 0 : _a.formats) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url) || ((_d = pet.imgUrl) === null || _d === void 0 ? void 0 : _d.url) || null,
                });
            });
            return ctx.send(processedPets);
        }
        catch (error) {
            console.error("Error en findByOwner:", error);
            ctx.throw(500, error);
        }
    },
    async delete(ctx) {
        const { id } = ctx.params;
        try {
            const pet = await strapi.db.query("api::pet.pet").findOne({
                where: { id },
            });
            if (!pet) {
                return ctx.notFound("La mascota no existe.");
            }
            await strapi.db.query("api::pet.pet").delete({
                where: { id },
            });
            return { message: "Mascota eliminada exitosamente." };
        }
        catch (err) {
            ctx.throw(500, err);
        }
    },
    async update(ctx) {
        var _a, _b;
        console.log("Inicio de updateWithImage para Pet...");
        try {
            const { id } = ctx.params;
            const data = ctx.request.body.data
                ? typeof ctx.request.body.data === "string"
                    ? JSON.parse(ctx.request.body.data)
                    : ctx.request.body.data
                : {};
            const cleanData = {
                name: data.name,
                breed: data.breed,
                color: data.color,
                type: data.type,
                gender: data.gender,
                owner: ((_a = data.owner) === null || _a === void 0 ? void 0 : _a.id) || data.owner,
            };
            console.log("Datos a actualizar:", cleanData);
            const updatedPet = await strapi.entityService.update("api::pet.pet", id, {
                data: cleanData,
            });
            const imgUrl = (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b.imgUrl;
            if (imgUrl) {
                const uploadedFiles = await strapi.plugins.upload.service("upload").upload({
                    data: {
                        ref: "api::pet.pet",
                        refId: updatedPet.id,
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const finalPet = await strapi.entityService.update("api::pet.pet", updatedPet.id, {
                        data: {
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    return ctx.send(finalPet);
                }
            }
            return ctx.send(updatedPet);
        }
        catch (error) {
            console.error("Error al actualizar mascota:", error);
            return ctx.badRequest({
                error: error.message + " Error al actualizar mascota",
            });
        }
    },
    async findAll(ctx) {
        try {
            const pets = await strapi.db.query("api::pet.pet").findMany({
                populate: {
                    imgUrl: true,
                    owner: {
                        fields: ["address", "id"],
                    },
                },
            });
            // Transformar los datos al formato esperado por el frontend
            const processedPets = pets.map((pet) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return ({
                    id: pet.id,
                    name: pet.name,
                    color: pet.color,
                    breed: pet.breed,
                    type: pet.type,
                    gender: pet.gender,
                    imgUrl: ((_c = (_b = (_a = pet.imgUrl) === null || _a === void 0 ? void 0 : _a.formats) === null || _b === void 0 ? void 0 : _b.thumbnail) === null || _c === void 0 ? void 0 : _c.url) || ((_d = pet.imgUrl) === null || _d === void 0 ? void 0 : _d.url) || null,
                    address: ((_e = pet.owner) === null || _e === void 0 ? void 0 : _e.address) || null,
                    ownerName: `${(_f = pet.owner) === null || _f === void 0 ? void 0 : _f.firstName} ${(_g = pet.owner) === null || _g === void 0 ? void 0 : _g.lastName}` || null,
                    ownerId: (_h = pet.owner) === null || _h === void 0 ? void 0 : _h.id,
                });
            });
            return ctx.send(processedPets);
        }
        catch (error) {
            console.error("Error en findAll:", error);
            ctx.throw(500, error);
        }
    },
}));
