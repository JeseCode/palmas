"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    beforeCreate: async (event) => {
        const { data } = event.params;
        // Validar que la hora de fin sea posterior a la hora de inicio
        const startTime = new Date(`1970-01-01T${data.startTime}`);
        const endTime = new Date(`1970-01-01T${data.endTime}`);
        if (endTime <= startTime) {
            throw new Error("La hora de fin debe ser posterior a la hora de inicio");
        }
        // Validar que la fecha no sea en el pasado
        const reservationDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (reservationDate < today) {
            throw new Error("La fecha de reserva no puede ser en el pasado");
        }
        // Verificar disponibilidad
        const existingReservations = await strapi.entityService.findMany("api::reservation.reservation", {
            filters: {
                date: data.date,
                socialArea: data.socialArea,
                status: {
                    $in: ["pending", "approved"],
                },
            },
        });
        // Verificar superposición de horarios
        for (const reservation of existingReservations) {
            const existingStart = new Date(`1970-01-01T${reservation.startTime}`);
            const existingEnd = new Date(`1970-01-01T${reservation.endTime}`);
            if ((startTime >= existingStart && startTime < existingEnd) ||
                (endTime > existingStart && endTime <= existingEnd) ||
                (startTime <= existingStart && endTime >= existingEnd)) {
                throw new Error("Ya existe una reserva para este horario en esta área");
            }
        }
    },
    beforeUpdate: async (event) => {
        const { data, where } = event.params;
        if (data.startTime || data.endTime) {
            const reservation = await strapi.entityService.findOne("api::reservation.reservation", where.id, {
                populate: {
                    owner: true,
                },
            });
            const startTime = new Date(`1970-01-01T${data.startTime || reservation.startTime}`);
            const endTime = new Date(`1970-01-01T${data.endTime || reservation.endTime}`);
            if (endTime <= startTime) {
                throw new Error("La hora de fin debe ser posterior a la hora de inicio");
            }
            // Verificar disponibilidad excluyendo la reserva actual
            const existingReservations = await strapi.entityService.findMany("api::reservation.reservation", {
                filters: {
                    date: data.date || reservation.date,
                    socialArea: data.socialArea || reservation.socialArea,
                    status: {
                        $in: ["pending", "approved"],
                    },
                    id: {
                        $ne: where.id,
                    },
                },
            });
            // Verificar superposición de horarios
            for (const existing of existingReservations) {
                const existingStart = new Date(`1970-01-01T${existing.startTime}`);
                const existingEnd = new Date(`1970-01-01T${existing.endTime}`);
                if ((startTime >= existingStart && startTime < existingEnd) ||
                    (endTime > existingStart && endTime <= existingEnd) ||
                    (startTime <= existingStart && endTime >= existingEnd)) {
                    throw new Error("Ya existe una reserva para este horario en esta área");
                }
            }
        }
    },
};
