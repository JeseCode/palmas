module.exports = (plugin) => {
    // Extender el controlador de usuarios
    const sanitizeOutput = (user) => {
        const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;
        // Normalizar el campo phone
        if (sanitizedUser.phone && Object.keys(sanitizedUser.phone).length === 0) {
            sanitizedUser.phone = null;
        }
        return sanitizedUser;
    };
    // Extender el controlador de autenticación
    const originalCallback = plugin.controllers.auth.callback;
    plugin.controllers.auth.callback = async (ctx) => {
        await originalCallback(ctx);
        // Normalizar la respuesta del usuario y añadir la imagen
        if (ctx.body && ctx.body.user) {
            // Obtener el usuario con la imagen
            const userWithImg = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                where: { id: ctx.body.user.id },
                select: [
                    "id",
                    "documentId",
                    "username",
                    "email",
                    "firstName",
                    "lastName",
                    "address",
                    "coefficient",
                    "phone",
                    "status",
                    "createdAt",
                    "updatedAt",
                    "publishedAt",
                    "locale",
                ],
                populate: {
                    imgUrl: {
                        fields: [
                            "name",
                            "width",
                            "height",
                            "formats",
                            "url",
                            "alternativeText",
                        ],
                    },
                    role: true,
                },
            });
            ctx.body.user = sanitizeOutput(userWithImg);
        }
    };
    // Sobrescribir el controlador `me`
    plugin.controllers.user.me = async (ctx) => {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized();
        }
        const userWithImg = await strapi
            .query("plugin::users-permissions.user")
            .findOne({
            where: { id: user.id },
            select: [
                "id",
                "documentId",
                "username",
                "email",
                "firstName",
                "lastName",
                "address",
                "coefficient",
                "phone",
                "status",
                "createdAt",
                "updatedAt",
                "publishedAt",
                "locale",
            ],
            populate: {
                imgUrl: {
                    fields: ["name", "width", "height", "formats", "url", "alternativeText"],
                },
                role: true,
            },
        });
        ctx.body = sanitizeOutput(userWithImg);
    };
    // Extender el controlador update para normalizar el teléfono y enviar notificaciones
    const originalUpdate = plugin.controllers.user.update;
    plugin.controllers.user.update = async (ctx) => {
        var _a;
        const { id } = ctx.params;
        let { body } = ctx.request;
        const adminUser = ctx.state.user;
        // Obtener el usuario antes de la actualización
        const previousUser = await strapi.entityService.findOne("plugin::users-permissions.user", id, {
            populate: ["role"],
        });
        // Normalizar el teléfono antes de la actualización
        if (body.phone && Object.keys(body.phone).length === 0) {
            body.phone = null;
        }
        ctx.request.body = body;
        await originalUpdate(ctx);
        // Obtener el usuario actualizado
        const updatedUser = await strapi.entityService.findOne("plugin::users-permissions.user", id, {
            populate: ["role", "imgUrl"],
        });
        // Si el que actualiza es un administrador y es diferente al usuario actualizado
        if (adminUser &&
            ((_a = adminUser.role) === null || _a === void 0 ? void 0 : _a.type) === "admin" &&
            adminUser.id !== updatedUser.id) {
            // Detectar cambios significativos
            const changes = [];
            if (previousUser.status !== updatedUser.status) {
                changes.push(`estado de pago a ${updatedUser.status ? "solvente" : "moroso"}`);
            }
            if (previousUser.coefficient !== updatedUser.coefficient) {
                changes.push(`coeficiente a ${updatedUser.coefficient}`);
            }
            if (previousUser.address !== updatedUser.address) {
                changes.push(`dirección a ${updatedUser.address}`);
            }
            // Si hay cambios, enviar notificación
            if (changes.length > 0) {
                try {
                    // Crear la notificación
                    const notification = await strapi.entityService.create("api::notification.notification", {
                        data: {
                            title: "Actualización de tu perfil",
                            message: `Un administrador ha actualizado tu ${changes.join(", ")}`,
                            type: "info",
                            read: false,
                            user: updatedUser.id,
                            publishedAt: new Date(),
                            data: {
                                changes,
                                updatedFields: {
                                    status: updatedUser.status,
                                    coefficient: updatedUser.coefficient,
                                    address: updatedUser.address,
                                },
                            },
                        },
                    });
                    // Enviar notificación en tiempo real
                    // @ts-ignore - SSE service is available at runtime
                    if (strapi.sse) {
                        // @ts-ignore - SSE service is available at runtime
                        strapi.sse.sendNotification(updatedUser.id, {
                            type: "notification",
                            notification: {
                                id: notification.id,
                                title: "Actualización de tu perfil",
                                message: `Un administrador ha actualizado tu ${changes.join(", ")}`,
                                type: "info",
                                read: false,
                                createdAt: notification.createdAt,
                                data: {
                                    changes,
                                    updatedFields: {
                                        status: updatedUser.status,
                                        coefficient: updatedUser.coefficient,
                                        address: updatedUser.address,
                                    },
                                },
                            },
                        });
                    }
                }
                catch (error) {
                    console.error("Error al enviar notificación:", error);
                }
            }
        }
        // Sanitizar la respuesta
        ctx.body = sanitizeOutput(updatedUser);
    };
    return plugin;
};
