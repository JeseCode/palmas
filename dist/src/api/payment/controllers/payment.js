"use strict";
/**
 * payment controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = require("cloudinary").v2;
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::payment.payment", ({ strapi }) => ({
    async create(ctx) {
        var _a;
        console.log("Inicio de create para Payment...");
        try {
            const data = JSON.parse(ctx.request.body.data || "{}");
            console.log("Datos parseados:", data);
            const imgUrl = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.imgUrl;
            console.log("Archivo imgUrl presente:", imgUrl ? "Sí" : "No");
            if (imgUrl) {
                console.log("Creando payment con imagen...");
                const uploadedFiles = await strapi.plugins.upload
                    .service("upload")
                    .upload({
                    data: {
                        ref: "api::payment.payment",
                        field: "imgUrl",
                    },
                    files: imgUrl,
                });
                if (uploadedFiles && uploadedFiles.length > 0) {
                    const createdPayment = await strapi.entityService.create("api::payment.payment", {
                        data: {
                            ...data,
                            owner: data.owner,
                            imgUrl: uploadedFiles[0].id,
                        },
                    });
                    console.log("Pago creado:", createdPayment);
                    return ctx.send(createdPayment);
                }
                else {
                    throw new Error("No se pudo subir el documento.");
                }
            }
            else {
                console.log("Creando mascota sin imagen...");
                const createdPayment = await strapi.entityService.create("api::payment.payment", {
                    data: {
                        ...data,
                        owner: data.owner,
                    },
                });
                console.log("Payment creada sin imagen:", createdPayment);
                return ctx.send(createdPayment);
            }
        }
        catch (error) {
            console.error("Error en create para Payment:", error);
            return ctx.badRequest({
                error: error.message + " Error al crear pago.",
            });
        }
    },
    async getDownloadUrl(ctx) {
        try {
            const { fileUrl } = ctx.request.body;
            console.log("fileUrl recibido:", fileUrl);
            // Extraer el public_id y la versión del URL de Cloudinary
            const matches = fileUrl.match(/\/upload\/(?:v(\d+)\/)?(.+?)\.pdf$/);
            if (!matches) {
                throw new Error("Invalid Cloudinary URL format");
            }
            const version = matches[1];
            const publicId = matches[2];
            // Generar URL firmada con flag de descarga
            const signedUrl = cloudinary.url(publicId, {
                resource_type: "image",
                type: "upload",
                version: version,
                format: "pdf",
                secure: true,
                sign_url: true,
                flags: "attachment", // Forzar descarga
                transformation: [
                    {
                        flags: "attachment",
                    },
                ],
                expires_at: Math.floor(Date.now() / 1000) + 3600, // URL válida por 1 hora
            });
            console.log("URL firmada generada:", signedUrl);
            return ctx.send({ downloadUrl: signedUrl });
        }
        catch (error) {
            console.error("Error en getDownloadUrl:", error);
            return ctx.throw(500, error.message);
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
            const payments = await strapi.db
                .query("api::payment.payment")
                .findMany(query);
            const processedPayments = payments.map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                monthOfPayment: payment.monthOfPayment,
                dateOfPayment: payment.dateOfPayment,
                transactionId: payment.transactionId,
                documentId: payment.documentId,
                beneficiary: payment.beneficiary,
                bank: payment.bank,
                description: payment.description,
                imgUrl: payment.imgUrl ? payment.imgUrl : null,
            }));
            return ctx.send(processedPayments);
        }
        catch (error) {
            console.error("Error en findByOwner:", error);
            ctx.throw(500, error);
        }
    },
    async delete(ctx) {
        const { id } = ctx.params;
        try {
            const payment = await strapi.db.query("api::payment.payment").findOne({
                where: { id },
            });
            if (!payment) {
                return ctx.notFound("El pago no existe.");
            }
            await strapi.db.query("api::payment.payment").delete({
                where: { id },
            });
            return { message: "Pago eliminado exitosamente." };
        }
        catch (err) {
            ctx.throw(500, err);
        }
    },
    async update(ctx) {
        var _a;
        try {
            const { id } = ctx.params;
            const data = ctx.request.body.data
                ? typeof ctx.request.body.data === "string"
                    ? JSON.parse(ctx.request.body.data)
                    : ctx.request.body.data
                : {};
            // Remove id from the data to prevent foreign key issues
            const { id: _, imgUrl: __, ...dataWithoutId } = data;
            let updateData = {
                ...dataWithoutId,
                owner: ((_a = data.owner) === null || _a === void 0 ? void 0 : _a.id) || data.owner,
            };
            // Handle file upload if present
            if (ctx.request.files && ctx.request.files.imgUrl) {
                console.log("Procesando archivo de imagen...");
                try {
                    const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
                        data: {
                            ref: "api::payment.payment",
                            refId: id,
                            field: "imgUrl",
                        },
                        files: ctx.request.files.imgUrl,
                    });
                    if (uploadedFiles && uploadedFiles.length > 0) {
                        console.log("Archivo subido exitosamente:", uploadedFiles[0].id);
                        updateData.imgUrl = uploadedFiles[0].id;
                    }
                }
                catch (uploadError) {
                    console.error("Error al subir el archivo:", uploadError);
                    throw new Error("Error al subir el archivo: " + uploadError.message);
                }
            }
            console.log("Update data:", updateData);
            const updatedPayment = await strapi.entityService.update("api::payment.payment", id, {
                data: updateData,
            });
            return ctx.send(updatedPayment);
        }
        catch (error) {
            console.error("Error al actualizar pago:", error);
            return ctx.badRequest({
                error: error.message + " Error al actualizar pago",
            });
        }
    },
}));
