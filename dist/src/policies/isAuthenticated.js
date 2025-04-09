"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = async (ctx, config, { strapi }) => {
    var _a;
    console.log("Encabezados:", ctx.request.headers); // Verifica si el token llega correctamente
    const token = (_a = ctx.request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        console.log("Token no encontrado");
        return ctx.forbidden("Token no encontrado");
    }
    try {
        const decoded = await strapi.plugins["users-permissions"].services.jwt.verify(token);
        ctx.state.user = decoded;
        console.log("Usuario autenticado:", decoded);
        return true;
    }
    catch (error) {
        console.log("Error al verificar el token:", error);
        return ctx.forbidden("Token inválido");
    }
};
