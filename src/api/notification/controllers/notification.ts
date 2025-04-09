/**
 * notification controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::notification.notification",
  ({ strapi }) => ({
    async findByUser(ctx) {
      try {
        const { userId } = ctx.params;
        if (!userId) {
          return ctx.badRequest("Se requiere el ID del usuario");
        }

        const notifications = await strapi.entityService.findMany(
          "api::notification.notification",
          {
            filters: {
              user: {
                id: {
                  $eq: userId,
                },
              },
            },
            sort: { createdAt: "desc" },
            populate: {
              user: {
                fields: ["id", "firstName", "lastName", "address"], // Solo incluir campos no sensibles
              },
            },
          }
        );

        return this.transformResponse(notifications);
      } catch (err) {
        strapi.log.error("Error en findByUser:", err);
        return ctx.badRequest("Error al buscar notificaciones del usuario");
      }
    },

    async markAsRead(ctx) {
      try {
        const { id } = ctx.params;
        if (!id) {
          return ctx.badRequest("Se requiere el ID de la notificación");
        }

        const notification = await strapi.entityService.update(
          "api::notification.notification",
          id,
          {
            data: { read: true },
          }
        );

        return this.transformResponse(notification);
      } catch (err) {
        strapi.log.error("Error en markAsRead:", err);
        return ctx.badRequest("Error al marcar la notificación como leída");
      }
    },

    async markAllAsRead(ctx) {
      try {
        const { userId } = ctx.params;
        if (!userId) {
          return ctx.badRequest("Se requiere el ID del usuario");
        }

        // Encontrar todas las notificaciones no leídas del usuario
        const unreadNotifications = await strapi.entityService.findMany(
          "api::notification.notification",
          {
            filters: {
              user: {
                id: {
                  $eq: userId,
                },
              },
              read: false,
            },
          }
        );

        if (unreadNotifications.length === 0) {
          return this.transformResponse({
            message: "No hay notificaciones sin leer para este usuario.",
          });
        }

        // Actualizar todas las notificaciones encontradas a leídas
        const updatePromises = unreadNotifications.map((notification) =>
          strapi.entityService.update(
            "api::notification.notification",
            notification.id,
            {
              data: { read: true },
            }
          )
        );

        await Promise.all(updatePromises);

        return this.transformResponse({
          message: `Se marcaron ${unreadNotifications.length} notificaciones como leídas.`,
        });
      } catch (err) {
        strapi.log.error("Error en markAllAsRead:", err);
        return ctx.badRequest(
          "Error al marcar todas las notificaciones como leídas"
        );
      }
    },

    async sendToUser(ctx) {
      try {
        const { userId } = ctx.params;
        const { title, message } = ctx.request.body;

        if (!userId || !title || !message) {
          return ctx.badRequest("Se requieren ID de usuario, título y mensaje");
        }

        // Verificar si el usuario existe
        const userExists = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            fields: ["id", "firstName", "lastName", "address"], // Solo incluir campos no sensibles
          }
        );
        if (!userExists) {
          return ctx.notFound("Usuario no encontrado");
        }

        const newNotification = await strapi.entityService.create(
          "api::notification.notification",
          {
            data: {
              title,
              message,
              read: false,
              user: userId,
              publishedAt: new Date(),
            },
          }
        );

        // Intentar enviar la notificación en tiempo real a través de SSE
        // Evitamos usar el controlador directamente para evitar problemas de tipos
        // En su lugar, emitimos un evento que el controlador SSE puede escuchar
        try {
          // Obtenemos el servicio de notificaciones
          const notificationService = strapi.service(
            "api::notification.notification"
          );
          if (
            notificationService &&
            typeof notificationService.notifyUser === "function"
          ) {
            await notificationService.notifyUser(userId, {
              type: "notification",
              data: {
                id: newNotification.id,
                title,
                message,
              },
            });
          }
        } catch (error) {
          strapi.log.error("Error al enviar notificación en tiempo real:", error);
        }

        return this.transformResponse(newNotification);
      } catch (err) {
        strapi.log.error("Error en sendToUser:", err);
        return ctx.badRequest("Error al enviar la notificación al usuario");
      }
    },

    async deleteNotification(ctx) {
      try {
        const { id } = ctx.params;
        if (!id) {
          return ctx.badRequest("Se requiere el ID de la notificación");
        }

        // Verificar que la notificación existe
        const notification = await strapi.entityService.findOne(
          "api::notification.notification",
          id
        );
        if (!notification) {
          return ctx.notFound("Notificación no encontrada");
        }

        // Eliminar la notificación
        await strapi.entityService.delete("api::notification.notification", id);

        return this.transformResponse({
          message: "Notificación eliminada correctamente",
        });
      } catch (err) {
        strapi.log.error("Error en deleteNotification:", err);
        return ctx.badRequest("Error al eliminar la notificación");
      }
    },

    // Método para manejar conexiones SSE
    async sse(ctx) {
      const { userId } = ctx.params;

      if (!userId) {
        return ctx.badRequest("Se requiere el ID del usuario");
      }

      // Configurar cabeceras para SSE
      ctx.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Para Nginx
      });

      // Mantener la conexión abierta
      ctx.respond = false;
      const res = ctx.res;

      // Enviar un evento inicial para confirmar la conexión
      res.write(
        `data: ${JSON.stringify({ type: "connected", message: "Conexión SSE establecida" })}\n\n`
      );

      // Registrar la conexión en el servicio SSE
      // @ts-ignore - SSE service is available at runtime
      if (strapi.sse && typeof strapi.sse.registerConnection === "function") {
        // @ts-ignore
        strapi.sse.registerConnection(userId, res);
      }

      // Manejar la desconexión del cliente
      ctx.req.on("close", () => {
        console.log(`Cliente SSE desconectado: ${userId}`);
      });
    },
  })
);
