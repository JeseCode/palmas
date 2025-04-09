import { factories } from "@strapi/strapi";

interface UploadedFiles {
  imgOne?: number | null;
  imgTwo?: number | null;
  imgThree?: number | null;
  imgFour?: number | null;
}

let uploadedFiles: UploadedFiles = {};

export default factories.createCoreController(
  "api::rental.rental",
  ({ strapi }) => ({
    async create(ctx) {
      console.log("Inicio de creación de publicación...");
      try {
        // Parsear los datos enviados en el cuerpo de la solicitud
        const data = JSON.parse(ctx.request.body.data || "{}");
        console.log("Datos recibidos:", data);

        // Obtener las imágenes desde los archivos enviados
        const imgOne = ctx.request.files?.imgOne;
        const imgTwo = ctx.request.files?.imgTwo;
        const imgThree = ctx.request.files?.imgThree;
        const imgFour = ctx.request.files?.imgFour;

        console.log("Imágenes recibidas:", {
          imgOne: !!imgOne,
          imgTwo: !!imgTwo,
          imgThree: !!imgThree,
          imgFour: !!imgFour,
        });

        // Subir las imágenes si existen
        if (imgOne || imgTwo || imgThree || imgFour) {
          const uploadPromises = [];

          if (imgOne) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::rental.rental",
                  field: "imgOne",
                },
                files: imgOne,
              })
            );
          }

          if (imgTwo) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::rental.rental",
                  field: "imgTwo",
                },
                files: imgTwo,
              })
            );
          }

          if (imgThree) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::rental.rental",
                  field: "imgThree",
                },
                files: imgThree,
              })
            );
          }

          if (imgFour) {
            uploadPromises.push(
              strapi.plugins.upload.service("upload").upload({
                data: {
                  ref: "api::rental.rental",
                  field: "imgFour",
                },
                files: imgFour,
              })
            );
          }

          const results = await Promise.all(uploadPromises);

          // Guardar los IDs de las imágenes subidas
          uploadedFiles = {
            imgOne: results[0]?.[0]?.id || null,
            imgTwo: results[1]?.[0]?.id || null,
            imgThree: results[2]?.[0]?.id || null,
            imgFour: results[3]?.[0]?.id || null,
          };
        }

        console.log("Archivos subidos:", uploadedFiles);

        // Crear la publicación en la base de datos
        const createdRental = await strapi.entityService.create(
          "api::rental.rental",
          {
            data: {
              ...data,
              rentalsUser: ctx.state.user.id, // Asignar el ID del usuario autenticado
              imgOne: uploadedFiles.imgOne || null,
              imgTwo: uploadedFiles.imgTwo || null,
              imgThree: uploadedFiles.imgThree || null,
              imgFour: uploadedFiles.imgFour || null,
            },
          }
        );

        console.log("Publicación creada exitosamente:", createdRental);
        return ctx.send(createdRental);
      } catch (error) {
        console.error("Error al crear la publicación:", error);

        if (error.name === "YupValidationError") {
          return ctx.badRequest({
            error: "Validación fallida. Verifique los datos ingresados.",
            details: error.details,
          });
        }

        return ctx.badRequest({
          error: "Error inesperado al crear la publicación.",
          details: error.message,
        });
      }
    },
    async update(ctx) {
      console.log("Iniciando actualización de publicación...");
      try {
        const { id } = ctx.params;
        const data = ctx.request.body.data
          ? typeof ctx.request.body.data === "string"
            ? JSON.parse(ctx.request.body.data)
            : ctx.request.body.data
          : {};

        const imgOne = ctx.request.files?.imgOne;
        const imgTwo = ctx.request.files?.imgTwo;
        const imgThree = ctx.request.files?.imgThree;
        const imgFour = ctx.request.files?.imgFour;

        // Validar datos requeridos
        if (!data.amount) {
          return ctx.badRequest("Faltan datos para actualizar.");
        }

        const rentalData: Record<string, any> = {
          ...(data.amount && { amount: data.amount }),
          ...(data.description && { description: data.description }),
          ...(data.address && { address: data.address }),
          ...(data.rentOrSale && { rentOrSale: data.rentOrSale }),
        };

        // Actualizar primera imagen
        if (imgOne) {
          const uploadedImgOne =
            await strapi.plugins.upload.services.upload.upload({
              data: {
                ref: "api::rental.rental",
                refId: id,
                field: "imgOne",
              },
              files: imgOne,
            });

          if (uploadedImgOne && uploadedImgOne.length > 0) {
            rentalData.imgOne = uploadedImgOne[0].id;
          }
        }

        // Actualizar segunda imagen
        if (imgTwo) {
          const uploadedImgTwo =
            await strapi.plugins.upload.services.upload.upload({
              data: {
                ref: "api::rental.rental",
                refId: id,
                field: "imgTwo",
              },
              files: imgTwo,
            });

          if (uploadedImgTwo && uploadedImgTwo.length > 0) {
            rentalData.imgTwo = uploadedImgTwo[0].id;
          }
        }

        // Actualizar tercera imagen
        if (imgThree) {
          const uploadedImgThree =
            await strapi.plugins.upload.services.upload.upload({
              data: {
                ref: "api::rental.rental",
                refId: id,
                field: "imgThree",
              },
              files: imgThree,
            });

          if (uploadedImgThree && uploadedImgThree.length > 0) {
            rentalData.imgThree = uploadedImgThree[0].id;
          }
        }

        // Actualizar cuarta imagen
        if (imgFour) {
          const uploadedImgFour =
            await strapi.plugins.upload.services.upload.upload({
              data: {
                ref: "api::rental.rental",
                refId: id,
                field: "imgFour",
              },
              files: imgFour,
            });

          if (uploadedImgFour && uploadedImgFour.length > 0) {
            rentalData.imgFour = uploadedImgFour[0].id;
          }
        }

        console.log("Datos listos para la actualización:", rentalData);

        // Actualizar la publicación
        const updatedRental = await strapi.entityService.update(
          "api::rental.rental",
          id,
          {
            data: rentalData,
            populate: ["imgOne", "imgTwo", "imgThree", "imgFour"],
          }
        );

        console.log("Publicación actualizada exitosamente:", updatedRental);

        return ctx.send({
          message: "Publicación actualizada exitosamente.",
          data: updatedRental,
        });
      } catch (error) {
        console.error("Error al actualizar publicación:", error);
        return ctx.badRequest({
          error: error.message || "Error al actualizar la publicación.",
          details: error,
        });
      }
    },
    async delete(ctx) {
      console.log("Iniciando eliminación de publicación...");
      try {
        const { id } = ctx.params;
        const rentalId = parseInt(id, 10);

        // Buscar la publicación
        const rental = await strapi.db.query("api::rental.rental").findOne({
          where: { id: rentalId },
          populate: ["imgOne", "imgTwo", "imgThree", "imgFour"],
        });

        if (!rental) {
          return ctx.notFound("Publicación no encontrada.");
        }

        console.log("Publicación encontrada para eliminar:", rental);

        // Eliminar las imágenes asociadas si existen
        const deleteImagePromises = [];
        if (rental.imgOne) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(rental.imgOne)
          );
        }
        if (rental.imgTwo) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(rental.imgTwo)
          );
        }
        if (rental.imgThree) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(rental.imgThree)
          );
        }
        if (rental.imgFour) {
          deleteImagePromises.push(
            strapi.plugins.upload.services.upload.remove(rental.imgFour)
          );
        }

        if (deleteImagePromises.length > 0) {
          await Promise.all(deleteImagePromises);
          console.log("Imágenes asociadas eliminadas correctamente.");
        }

        // Eliminar la publicación
        const deletedRental = await strapi.db
          .query("api::rental.rental")
          .delete({
            where: { id: rentalId },
          });

        console.log("Publicación eliminada exitosamente:", deletedRental);
        return ctx.send({
          message: "Publicación eliminada exitosamente.",
          data: deletedRental,
        });
      } catch (error) {
        console.error("Error al eliminar la publicación:", error);
        return ctx.badRequest({
          error: "Error al eliminar la publicación.",
          details: error.message,
        });
      }
    },
    async findById(ctx) {
      console.log("Iniciando búsqueda de publicaciones por usuario...");
      try {
        const { userId } = ctx.params; // Suponiendo que el ID del usuario se pasa como parámetro en la URL

        const rentals = await strapi.entityService.findMany(
          "api::rental.rental",
          {
            where: { rentalsUser: userId }, // Filtrar publicaciones por rentalsUser
            populate: ["imgOne", "imgTwo", "imgThree", "imgFour"], // Población de imágenes si es necesario
          }
        );

        console.log("Publicaciones encontradas para el usuario:", rentals);
        return ctx.send(rentals);
      } catch (error) {
        console.error("Error al buscar publicaciones por usuario:", error);
        return ctx.badRequest({
          error: "Error al buscar publicaciones por usuario.",
          details: error.message,
        });
      }
    },
    async findOne(ctx) {
      console.log("Iniciando búsqueda de publicación por ID...");
      try {
        const { id } = ctx.params; // Obtener el ID de los parámetros de la URL

        const rental = await strapi.entityService.findOne(
          "api::rental.rental",
          id,
          {
            populate: ["imgOne", "imgTwo", "imgThree", "imgFour"], // Población de imágenes si es necesario
          }
        );

        if (!rental) {
          return ctx.notFound("Publicación no encontrada.");
        }

        console.log("Publicación encontrada:", rental);
        return ctx.send(rental);
      } catch (error) {
        console.error("Error al buscar publicación por ID:", error);
        return ctx.badRequest({
          error: "Error al buscar la publicación.",
          details: error.message,
        });
      }
    },
    async findAll(ctx) {
      try {
        const rentals = await strapi.db.query("api::rental.rental").findMany({
          populate: {
            imgOne: true,
            imgTwo: true,
            imgThree: true,
            imgFour: true,
            rentalsUser: {
              fields: ["id", "address", "firstName", "lastName", "phone"], // Incluir el campo phone
            },
          },
        });

        // Transformar los datos al formato esperado por el frontend
        const processedRentals = rentals.map((rental) => ({
          id: rental.id,
          amount: rental.amount,
          description: rental.description,
          imgOne: rental.imgOne?.url || null,
          imgTwo: rental.imgTwo?.url || null,
          imgThree: rental.imgThree?.url || null,
          imgFour: rental.imgFour?.url || null,
          address: rental.rentalsUser?.address || null, // Dirección del usuario
          userName:
            `${rental.rentalsUser?.firstName || ""} ${
              rental.rentalsUser?.lastName || ""
            }`.trim() || null, // Nombre completo del usuario
          phone: rental.rentalsUser?.phone || null, // Teléfono del usuario
          createdAt: rental.createdAt,
          updatedAt: rental.updatedAt,
          publishedAt: rental.publishedAt,
          rentOrSale: rental.rentOrSale,
        }));

        return ctx.send(processedRentals);
      } catch (error) {
        console.error("Error en findAll:", error);
        ctx.throw(500, "Error al obtener las publicaciones.");
      }
    },
  })
);
