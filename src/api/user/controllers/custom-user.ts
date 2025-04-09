import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "plugin::users-permissions.user",
  ({ strapi }) => ({
    async updateImgUrl(ctx) {
      const { id } = ctx.params;

      if (!ctx.state.user) {
        return ctx.forbidden("Usuario no autenticado");
      }

      if (ctx.state.user.id !== Number(id)) {
        return ctx.forbidden("No tienes permiso para modificar este recurso");
      }

      try {
        const imgUrl = ctx.request.files.imgUrl;

        if (!imgUrl) {
          return ctx.badRequest("No se recibió el archivo imgUrl");
        }

        console.log("Archivo imgUrl recibido:", imgUrl);

        const uploadedFiles = await strapi.service("plugin::upload.upload").upload({
          data: {},
          files: imgUrl,
        });

        console.log("Archivo subido a Cloudinary:", uploadedFiles);

        const imageUrl = uploadedFiles[0]?.url;
        if (!imageUrl) {
          return ctx.internalServerError("No se pudo subir la imagen a Cloudinary");
        }

        // Actualiza la URL de la imagen en el usuario
        const updatedUser = await strapi
          .query("plugin::users-permissions.user")
          .update({
            where: { id },
            data: {
              imgUrl: uploadedFiles[0].id, // Pasa el ID del archivo subido
            },
          });

        return ctx.send(updatedUser);
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        return ctx.internalServerError("Error al procesar la imagen");
      }
    },
  })
);
