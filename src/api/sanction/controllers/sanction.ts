/**
 * sanction controller
 */

import { factories } from "@strapi/strapi";

interface UploadedFiles {
  evidenceImgOne?: number | null; // Cambia el tipo según lo que necesites
  evidenceImgTwo?: number | null; // Cambia el tipo según lo que necesites
}

let uploadedFiles: UploadedFiles = {};

interface Sanction {
  evidenceImgOne?: { id: number }; // Asegúrate de que el tipo coincida con tu estructura
  evidenceImgTwo?: { id: number };
  // Agrega otras propiedades según sea necesario
}

// Define un tipo que incluya las propiedades necesarias
interface SanctionWithImages {
  id: number;
  petId: number;
  ownerPetId: number;
  reason: string;
  evidenceImgOne?: { url?: string } | null; // Asegúrate de que el tipo coincida
  evidenceImgTwo?: { url?: string } | null; // Asegúrate de que el tipo coincida
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default factories.createCoreController(
  "api::sanction.sanction",
  ({ strapi }) => ({
    async create(ctx) {
      console.log("Inicio de creación de sanción...");
      try {
        // Parsear los datos enviados en el cuerpo de la solicitud
        const data = JSON.parse(ctx.request.body.data || "{}");
        console.log("Datos recibidos:", data);

        // Obtener las imágenes desde los archivos enviados
        const evidenceImgOne = ctx.request.files?.evidenceImgOne;
        const evidenceImgTwo = ctx.request.files?.evidenceImgTwo;
        console.log("Imágenes recibidas:", {
          evidenceImgOne: !!evidenceImgOne,
          evidenceImgTwo: !!evidenceImgTwo,
        });

        // Subir las imágenes si existen
        if (evidenceImgOne || evidenceImgTwo) {
          const uploadPromises = [];

          if (evidenceImgOne) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::sanction.sanction",
                  field: "evidenceImgOne",
                },
                files: evidenceImgOne,
              })
            );
          }

          if (evidenceImgTwo) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::sanction.sanction",
                  field: "evidenceImgTwo",
                },
                files: evidenceImgTwo,
              })
            );
          }

          const results = await Promise.all(uploadPromises);

          // Guardar los IDs de las imágenes subidas
          uploadedFiles = {
            evidenceImgOne: results[0]?.[0]?.id || null,
            evidenceImgTwo: results[1]?.[0]?.id || null,
          };
        }

        console.log("Archivos subidos:", uploadedFiles);

        // Crear la sanción en la base de datos
        const createdSanction = await strapi.entityService.create(
          "api::sanction.sanction",
          {
            data: {
              ...data,
              reportBy: ctx.state.user.id, // Relacionar la sanción con el usuario autenticado
              evidenceImgOne: uploadedFiles.evidenceImgOne || null,
              evidenceImgTwo: uploadedFiles.evidenceImgTwo || null,
            },
          }
        );

        console.log("Sanción creada exitosamente:", createdSanction);
        return ctx.send(createdSanction);
      } catch (error) {
        console.error("Error al crear la sanción:", error);

        if (error.name === "YupValidationError") {
          return ctx.badRequest({
            error: "Validación fallida. Verifique los datos ingresados.",
            details: error.details,
          });
        }

        return ctx.badRequest({
          error: "Error inesperado al crear la sanción.",
          details: error.message,
        });
      }
    },
    async update(ctx) {
      console.log("Iniciando actualización de sanción...");
      try {
        const { id } = ctx.params;
        const data = ctx.request.body.data
          ? typeof ctx.request.body.data === "string"
            ? JSON.parse(ctx.request.body.data)
            : ctx.request.body.data
          : {};

        const evidenceImgOne = ctx.request.files?.evidenceImgOne;
        const evidenceImgTwo = ctx.request.files?.evidenceImgTwo;

        // Validar datos requeridos
        if (!data.reason && !data.petId && !data.ownerPetId) {
          return ctx.badRequest("Faltan datos para actualizar.");
        }

        const sanctionData: Record<string, any> = {
          ...(data.reason && { reason: data.reason }),
          ...(data.petId && { petId: data.petId }),
          ...(data.ownerPetId && { ownerPetId: data.ownerPetId }),
        };

        // Actualizar primera imagen
        if (evidenceImgOne) {
          const uploadedImgOne = await strapi.plugins.upload.services.upload.upload({
            data: {
              ref: "api::sanction.sanction",
              refId: id,
              field: "evidenceImgOne",
            },
            files: evidenceImgOne,
          });

          if (uploadedImgOne && uploadedImgOne.length > 0) {
            sanctionData.evidenceImgOne = uploadedImgOne[0].id;
          }
        }

        // Actualizar segunda imagen
        if (evidenceImgTwo) {
          const uploadedImgTwo = await strapi.plugins.upload.services.upload.upload({
            data: {
              ref: "api::sanction.sanction",
              refId: id,
              field: "evidenceImgTwo",
            },
            files: evidenceImgTwo,
          });

          if (uploadedImgTwo && uploadedImgTwo.length > 0) {
            sanctionData.evidenceImgTwo = uploadedImgTwo[0].id;
          }
        }

        console.log("Datos listos para la actualización:", sanctionData);

        // Actualizar la sanción
        const updatedSanction = await strapi.entityService.update(
          "api::sanction.sanction",
          id,
          {
            data: sanctionData,
            populate: ["evidenceImgOne", "evidenceImgTwo"],
          }
        );

        console.log("Sanción actualizada exitosamente:", updatedSanction);

        return ctx.send({
          message: "Sanción actualizada exitosamente.",
          data: updatedSanction,
        });
      } catch (error) {
        console.error("Error al actualizar sanción:", error);
        return ctx.badRequest({
          error: error.message || "Error al actualizar la sanción.",
          details: error,
        });
      }
    },
    async delete(ctx) {
      console.log("Iniciando eliminación de sanción...");
      try {
        const { id } = ctx.params;
        const sanctionId = parseInt(id, 10);

        // Buscar la sanción
        const sanction = await strapi.db.query("api::sanction.sanction").findOne({
          where: { id: sanctionId },
          populate: ["evidenceImgOne", "evidenceImgTwo"],
        });

        if (!sanction) {
          return ctx.notFound("Sanción no encontrada.");
        }

        console.log("Sanción encontrada para eliminar:", sanction);

        // Eliminar las imágenes asociadas si existen
        const deleteImagePromises = [];
        if (sanction.evidenceImgOne) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(sanction.evidenceImgOne)
          );
        }
        if (sanction.evidenceImgTwo) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(sanction.evidenceImgTwo)
          );
        }

        if (deleteImagePromises.length > 0) {
          await Promise.all(deleteImagePromises);
          console.log("Imágenes asociadas eliminadas correctamente.");
        }

        // Eliminar la sanción
        const deletedSanction = await strapi.db
          .query("api::sanction.sanction")
          .delete({
            where: { id: sanctionId },
          });

        console.log("Sanción eliminada exitosamente:", deletedSanction);
        return ctx.send({
          message: "Sanción eliminada exitosamente.",
          data: deletedSanction,
        });
      } catch (error) {
        console.error("Error al eliminar la sanción:", error);
        return ctx.badRequest({
          error: "Error al eliminar la sanción.",
          details: error.message,
        });
      }
    },

    async findById(ctx) {
      console.log("Iniciando búsqueda de sanciones por propietario...");
      try {
        const { ownerId } = ctx.params; // Suponiendo que el ID del propietario se pasa como parámetro en la URL

        const sanctions = await strapi.entityService.findMany(
          "api::sanction.sanction",
          {
            where: { ownerPetId: ownerId }, // Filtrar sanciones por ownerPetId
            populate: ["evidenceImgOne", "evidenceImgTwo"], // Población de imágenes si es necesario
          }
        );

        console.log("Sanciones encontradas para el propietario:", sanctions);
        return ctx.send(sanctions);
      } catch (error) {
        console.error("Error al buscar sanciones por propietario:", error);
        return ctx.badRequest({
          error: "Error al buscar sanciones por propietario.",
          details: error.message,
        });
      }
    },
    async findOne(ctx) {
      console.log("Iniciando búsqueda de sanción por ID...");
      try {
        const { id } = ctx.params; // Obtener el ID de los parámetros de la URL

        const sanction = await strapi.entityService.findOne(
          "api::sanction.sanction",
          id,
          {
            populate: ["evidenceImgOne", "evidenceImgTwo"], // Población de imágenes si es necesario
          }
        );

        if (!sanction) {
          return ctx.notFound("Sanción no encontrada.");
        }

        console.log("Sanción encontrada:", sanction);
        return ctx.send(sanction);
      } catch (error) {
        console.error("Error al buscar sanción por ID:", error);
        return ctx.badRequest({
          error: "Error al buscar la sanción.",
          details: error.message,
        });
      }
    },
    async findAll(ctx) {
      try {
        const sanctions = await strapi.db.query("api::sanction.sanction").findMany({
          populate: {
            evidenceImgOne: true,
            evidenceImgTwo: true,
            ownerPetId: {
              fields: ["id", "address", "firstName", "lastName"], // Obtenemos los datos del dueño
            },
          },
        });

        // Transformar los datos al formato esperado por el frontend
        const processedSanctions = sanctions.map((sanction) => ({
          id: sanction.id,
          reason: sanction.reason,
          evidenceImgOne:
            sanction.evidenceImgOne?.formats?.thumbnail?.url ||
            sanction.evidenceImgOne?.url ||
            null,
          evidenceImgTwo:
            sanction.evidenceImgTwo?.formats?.thumbnail?.url ||
            sanction.evidenceImgTwo?.url ||
            null,
          sanctionsUser: sanction.sanctionsUser,
          reportBy: sanction.reportBy || null,
          address: sanction.ownerPetId?.address || null, // Dirección del dueño de la mascota
          ownerName:
            `${sanction.ownerPetId?.firstName || ""} ${
              sanction.ownerPetId?.lastName || ""
            }`.trim() || null, // Nombre completo del dueño
          petId: sanction.petId,
          ownerPetId: sanction.ownerPetId?.id || null,
          createdAt: sanction.createdAt,
          updatedAt: sanction.updatedAt,
          publishedAt: sanction.publishedAt,
        }));

        return ctx.send(processedSanctions);
      } catch (error) {
        console.error("Error en findAll:", error);
        ctx.throw(500, "Error al obtener las sanciones.");
      }
    },
  })
);
