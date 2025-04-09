/**
 * reservation controller
 */

import { factories } from "@strapi/strapi";

interface ReservationWithOwner {
  createdAt: any;
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  socialArea: string;
  eventType: string;
  attendees: number;
  status: string;
  rejectionReason?: string;
  owner?: {
    address: any;
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    status: boolean;
    imgUrl?: {
      url: string;
    };
  };
}

interface StrapiUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: boolean;
  imgUrl?: {
    url: string;
  };
}

interface StrapiReservation {
  id: number;
  attributes: any;
  owner?: StrapiUser;
}

interface ReservationResponse {
  id: number;
  attributes: {
    owner: {
      data: {
        id: number;
        attributes: any;
      };
    };
    // otros atributos
  };
}

export default factories.createCoreController(
  "api::reservation.reservation",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        console.log("=== Inicio de create en reservation controller ===");
        console.log("Request body:", JSON.stringify(ctx.request.body, null, 2));
        console.log("User state:", JSON.stringify(ctx.state.user, null, 2));

        const { user } = ctx.state;
        const { data } = ctx.request.body;

        // Validar que los datos estén presentes
        if (!data) {
          console.log("Error: No se encontró el objeto data en la solicitud");
          return ctx.badRequest({
            error: "Los datos de la reserva son requeridos",
          });
        }

        console.log("Datos recibidos:", JSON.stringify(data, null, 2));

        // Validar campos requeridos
        const requiredFields = [
          "date",
          "startTime",
          "endTime",
          "socialArea",
          "eventType",
          "attendees",
        ];

        for (const field of requiredFields) {
          if (!data[field]) {
            console.log(`Error: Campo requerido ${field} no encontrado`);
            return ctx.badRequest({
              error: `El campo ${field} es requerido`,
            });
          }
        }

        // Validar que attendees sea un número
        const attendees = Number(data.attendees);
        if (isNaN(attendees)) {
          console.log("Error: attendees no es un número válido");
          return ctx.badRequest({
            error: "El número de asistentes debe ser un número válido",
          });
        }

        // Validar que attendees esté dentro del rango permitido
        if (attendees < 1 || attendees > 100) {
          console.log("Error: attendees fuera de rango");
          return ctx.badRequest({
            error: "El número de asistentes debe estar entre 1 y 100",
          });
        }

        // Validar que socialArea sea un valor válido
        const validSocialAreas = ["communalHall", "pool", "bbq", "terrace"];
        if (!validSocialAreas.includes(data.socialArea)) {
          console.log("Error: socialArea no válido");
          return ctx.badRequest({
            error: "Área social no válida",
          });
        }

        // Validar formato de fecha
        const reservationDate = new Date(data.date);
        if (isNaN(reservationDate.getTime())) {
          console.log("Error: Formato de fecha inválido");
          return ctx.badRequest({
            error: "Formato de fecha inválido",
          });
        }

        // Validar formato de hora
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
          console.log("Error: Formato de hora inválido");
          return ctx.badRequest({
            error: "Formato de hora inválido. Use el formato HH:mm",
          });
        }

        // Formatear las horas al formato requerido por Strapi (HH:mm:ss.SSS)
        const formatTime = (time: string) => {
          return `${time}:00.000`;
        };

        console.log(
          "Todas las validaciones pasadas, procediendo a crear la reserva"
        );

        // Asignar el usuario actual a la reserva
        const reservation = await strapi.entityService.create(
          "api::reservation.reservation",
          {
            data: {
              ...data,
              startTime: formatTime(data.startTime),
              endTime: formatTime(data.endTime),
              attendees: attendees,
              owner: user.id,
              status: "pending",
            },
          }
        );

        console.log(
          "Reserva creada exitosamente:",
          JSON.stringify(reservation, null, 2)
        );
        return { data: reservation };
      } catch (error) {
        console.error("Error en create:", error);
        return ctx.badRequest({
          error: error.message || "Error al crear la reserva",
        });
      }
    },

    async find(ctx) {
      try {
        const { user } = ctx.state;

        // Obtener el rol completo del usuario
        const userWithRole = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: user.id },
            populate: ["role"],
          });

        const isAdmin = userWithRole?.role?.type === "admin";

        // Configurar la consulta base
        ctx.query = {
          ...ctx.query,
          populate: ["owner.imgUrl"],
        };

        // Aplicar filtro si no es admin
        if (!isAdmin) {
          ctx.query = {
            ...ctx.query,
            filters: {
              owner: {
                id: user.id,
              },
            },
          };
        }

        // Obtener resultados
        const { data, meta } = await super.find(ctx);

        console.log(
          "Primera reservación completa:",
          JSON.stringify(data[0], null, 2)
        );

        // Transformar resultados
        const enhancedData = data.map((item) => {
          console.log(`Procesando reservación ${item.id}:`, {
            hasOwner: !!item.owner,
            ownerData: item.owner,
          });

          return {
            id: item.id,
            documentId: item.documentId,
            date: item.date,
            startTime: item.startTime?.slice(0, 5) || "",
            endTime: item.endTime?.slice(0, 5) || "",
            socialArea: item.socialArea,
            eventType: item.eventType,
            attendees: item.attendees,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            publishedAt: item.publishedAt,
            rejectionReason: item.rejectionReason,
            user: item.owner
              ? {
                  id: item.owner.id,
                  username: item.owner.username,
                  firstName: item.owner.firstName,
                  lastName: item.owner.lastName,
                  imgUrl: item.owner.imgUrl?.url,
                  isSolvente: item.owner.status,
                }
              : null,
          };
        });

        return { data: enhancedData, meta };
      } catch (error) {
        console.error("Error en find:", error);
        return ctx.badRequest("Error al obtener las reservaciones");
      }
    },

    async findOne(ctx) {
      const { user } = ctx.state;
      const { id } = ctx.params;
      const { role } = user;

      const result = await super.findOne(ctx);
      const reservation = result.data as unknown as ReservationWithOwner;

      // Si el usuario es admin o es el dueño de la reserva, puede verla
      if (role?.type === "admin" || reservation?.owner?.id === user.id) {
        return result;
      }

      return ctx.forbidden("No tienes permiso para ver esta reserva");
    },

    async update(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;
        const { data } = ctx.request.body;

        console.log(
          "Update Reservation - Request Data:",
          JSON.stringify({ id, data }, null, 2)
        );

        // Verificar si el usuario existe
        if (!user) {
          return ctx.forbidden("Usuario no autenticado");
        }

        // Validar que status sea uno de los valores permitidos
        const validStatuses = ["pending", "approved", "rejected"];
        if (data.status && !validStatuses.includes(data.status)) {
          return ctx.badRequest("Estado no válido");
        }

        // Si el status es rejected, asegurarse de que hay un rejectionReason
        if (data.status === "rejected" && !data.rejectionReason) {
          return ctx.badRequest("Se requiere un motivo de rechazo");
        }

        // Obtener la reservación actual para verificar que existe
        const existingReservation = await strapi.entityService.findOne(
          "api::reservation.reservation",
          id
        );

        if (!existingReservation) {
          return ctx.notFound("Reservación no encontrada");
        }

        // Construir el objeto de actualización
        const updateData = {
          status: data.status,
        };

        // Solo incluir rejectionReason si el status es rejected
        if (data.status === "rejected") {
          (
            updateData as { status: string; rejectionReason?: string }
          ).rejectionReason = data.rejectionReason;
        }

        // Actualizar la reservación
        const updatedReservation = await strapi.entityService.update(
          "api::reservation.reservation",
          id,
          {
            data: updateData,
          }
        );

        // Crear y enviar notificación al propietario de la reserva
        try {
          // Obtener el propietario de la reserva
          const reservation = await strapi.entityService.findOne(
            "api::reservation.reservation",
            id,
            {
              populate: ["owner"],
            }
          );

          if ((reservation as ReservationWithOwner)?.owner?.id) {
            // Crear mensaje según el estado
            const title =
              data.status === "approved" ? "Reserva aprobada" : "Reserva rechazada";

            const message =
              data.status === "approved"
                ? "Tu solicitud de reserva ha sido aprobada"
                : `Tu solicitud de reserva ha sido rechazada. Motivo: ${data.rejectionReason}`;

            // Crear la notificación en la base de datos
            await strapi.service("api::notification.notification").create({
              data: {
                title,
                message,
                type: data.status === "approved" ? "success" : "warning",
                read: false,
                user: (reservation as ReservationWithOwner).owner.id,
              },
            });

            // Enviar notificación en tiempo real si está disponible el servicio SSE
            if (strapi.service("api::sse.sse")) {
              await strapi.service("api::sse.sse").sendNotification({
                userId: (reservation as ReservationWithOwner).owner.id,
                data: {
                  title,
                  message,
                  type: data.status === "approved" ? "success" : "warning",
                  reservationId: id,
                  status: data.status,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error al enviar notificación:", error);
          // No interrumpimos el flujo si falla la notificación
        }

        console.log(
          "Update Reservation - Success:",
          JSON.stringify(updatedReservation, null, 2)
        );

        return {
          data: updatedReservation,
        };
      } catch (error) {
        console.error("Error en update:", error);
        return ctx.badRequest({
          error: error.message || "Error al actualizar la reserva",
        });
      }
    },

    async delete(ctx) {
      try {
        const { user } = ctx.state;
        const { id } = ctx.params;

        if (!user) {
          return ctx.unauthorized("Usuario no autenticado");
        }

        const userWithRole = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { id: user.id },
            populate: ["role"],
          });

        const isAdmin = userWithRole?.role?.type === "admin";

        // Obtener la reservación con el casting apropiado
        const reservation = await strapi.entityService.findOne(
          "api::reservation.reservation",
          id,
          {
            populate: ["owner"],
          }
        ) as unknown as ReservationWithOwner;

        if (!reservation) {
          return ctx.notFound("Reservación no encontrada");
        }

        // Ahora TypeScript reconocerá la propiedad owner
        if (!isAdmin && reservation?.owner?.id !== user.id) {
          return ctx.forbidden("No tienes permiso para eliminar esta reserva");
        }

        const deletedReservation = await strapi.entityService.delete(
          "api::reservation.reservation",
          id
        );

        return {
          data: deletedReservation,
          meta: {
            deletedBy: user.id,
            deletedAt: new Date(),
            isAdminAction: isAdmin,
          },
        };
      } catch (error) {
        console.error("Error al eliminar reservación:", error);
        return ctx.badRequest("Error al eliminar la reservación");
      }
    },

    async findByOwner(ctx) {
      try {
        const { user } = ctx.state;
        const { ownerId } = ctx.params;
        const { role } = user;

        // Solo los administradores pueden ver las reservas de otros usuarios
        if (role?.type !== "admin" && user.id !== parseInt(ownerId)) {
          return ctx.forbidden(
            "No tienes permiso para ver las reservas de otros usuarios"
          );
        }

        const reservations = (await strapi.entityService.findMany(
          "api::reservation.reservation",
          {
            filters: {
              owner: {
                id: ownerId,
              },
            },
            populate: {
              owner: {
                populate: ["imgUrl"],
              },
            },
            sort: { createdAt: "desc" },
          }
        )) as unknown as ReservationWithOwner[];

        return {
          data: reservations.map((reservation) => ({
            id: Number(reservation.id),
            attributes: {
              ...reservation,
              id: undefined,
              startTime: reservation.startTime?.slice(0, 5) || null, // Aseguramos formato HH:mm
              endTime: reservation.endTime?.slice(0, 5) || null, // Aseguramos formato HH:mm
              date: reservation.date, // Aseguramos que sea una fecha válida
              createdAt: reservation.createdAt, // Aseguramos que sea una fecha válida
              owner: reservation.owner
                ? {
                    data: {
                      id: Number(reservation.owner.id),
                      attributes: {
                        firstName: reservation.owner.firstName || "",
                        lastName: reservation.owner.lastName || "",
                        address: reservation.owner.address,
                        imgUrl: reservation.owner.imgUrl,
                      },
                    },
                  }
                : null,
            },
          })),
        };
      } catch (error) {
        console.error("Error en findByOwner:", error);
        return ctx.badRequest("Error al obtener las reservaciones");
      }
    },

    async me(ctx) {
      try {
        const { user } = ctx.state;

        if (!user) {
          return ctx.unauthorized("Usuario no autenticado");
        }

        const reservations = (await strapi.entityService.findMany(
          "api::reservation.reservation",
          {
            filters: {
              owner: {
                id: user.id,
              },
            },
            populate: {
              owner: {
                populate: ["imgUrl"],
              },
            },
            sort: { createdAt: "desc" },
          }
        )) as unknown as ReservationWithOwner[];

        return {
          data: reservations.map((reservation) => ({
            id: Number(reservation.id),
            attributes: {
              ...reservation,
              id: undefined,
              startTime: reservation.startTime?.slice(0, 5) || null, // Aseguramos formato HH:mm
              endTime: reservation.endTime?.slice(0, 5) || null, // Aseguramos formato HH:mm
              date: reservation.date, // Aseguramos que sea una fecha válida
              createdAt: reservation.createdAt, // Aseguramos que sea una fecha válida
              owner: reservation.owner
                ? {
                    data: {
                      id: Number(reservation.owner.id),
                      attributes: {
                        firstName: reservation.owner.firstName || "",
                        lastName: reservation.owner.lastName || "",
                        address: reservation.owner.address,
                        imgUrl: reservation.owner.imgUrl,
                      },
                    },
                  }
                : null,
            },
          })),
        };
      } catch (error) {
        console.error("Error en me:", error);
        return ctx.badRequest("Error al obtener las reservaciones");
      }
    },
  })
);

