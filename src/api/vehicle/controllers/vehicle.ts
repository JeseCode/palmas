/**
 * vehicle controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::vehicle.vehicle', ({ strapi }) => ({
  async create(ctx) {
    try {
      const data = JSON.parse(ctx.request.body.data || "{}");
      const imgUrl = ctx.request.files?.imgUrl;

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
    } catch (error) {
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

      const processedVehicles = vehicles.map((vehicle) => ({
        id: vehicle.id,
        brand: vehicle.brand,
        color: vehicle.color,
        plaque: vehicle.plaque,
        type: vehicle.type,
        imgUrl: vehicle.imgUrl?.formats?.thumbnail?.url || vehicle.imgUrl?.url || null,
      }));

      return ctx.send(processedVehicles);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async update(ctx) {
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
        owner: data.owner?.id || data.owner,
      };

      const updatedVehicle = await strapi.entityService.update("api::vehicle.vehicle", id, {
        data: cleanData,
      });

      const imgUrl = ctx.request.files?.imgUrl;
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
          const finalVehicle = await strapi.entityService.update(
            "api::vehicle.vehicle",
            updatedVehicle.id,
            {
              data: {
                imgUrl: uploadedFiles[0].id,
              },
            }
          );
          return ctx.send(finalVehicle);
        }
      }

      return ctx.send(updatedVehicle);
    } catch (error) {
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
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
