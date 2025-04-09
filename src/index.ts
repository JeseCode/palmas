// @ts-ignore
import type { Strapi } from "@strapi/strapi";
import sseService from "./bootstrap/sse";

interface SSEResponse {
  write(data: string): void;
  on(event: string, callback: () => void): void;
}

type SSEConnection = SSEResponse | ((data: string) => void);

// Extender la interfaz Strapi para incluir el servicio SSE
declare module "@strapi/strapi" {
  interface Strapi {
    sse: {
      registerConnection(userId: string, res: SSEResponse): void;
      sendNotification(userId: string, data: any): boolean;
    };
  }
}

// Almacenar las conexiones SSE
declare global {
  var sseConnections: Map<string, Set<SSEConnection>>;
}

// Inicializar el mapa de conexiones global
global.sseConnections = new Map();

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Registrar el servicio SSE
    strapi.sse = sseService.initialize();
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Configurar middleware personalizado para SSE
    strapi.server.use(async (ctx, next) => {
      // Solo procesar rutas SSE específicas
      if (ctx.path.startsWith("/api/notifications/sse/")) {
        console.log(`Interceptando solicitud SSE: ${ctx.path}`);
        try {
          // Extraer el ID de usuario de la URL
          const userId = ctx.path.split("/").pop();

          if (!userId) {
            ctx.status = 400;
            ctx.body = { error: "Se requiere el ID del usuario" };
            return;
          }

          // Verificar que el usuario existe
          let userExists;
          try {
            userExists = await strapi.entityService.findOne(
              "plugin::users-permissions.user",
              userId
            );
          } catch (error) {
            console.error(`Error al buscar usuario ${userId}:`, error);
          }

          if (!userExists) {
            console.error(`SSE: Usuario con ID ${userId} no encontrado`);
            ctx.status = 404;
            ctx.body = { error: "Usuario no encontrado" };
            return;
          }

          // Configurar la respuesta para SSE
          ctx.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // Para Nginx
          });

          // Mantener la conexión abierta
          ctx.req.socket.setTimeout(0);
          ctx.req.socket.setNoDelay(true);
          ctx.req.socket.setKeepAlive(true);

          // Función para enviar eventos al cliente
          const send = (data: string) => {
            try {
              ctx.res.write(`data: ${data}\n\n`);
            } catch (error) {
              console.error(`Error al enviar datos SSE a usuario ${userId}:`, error);
            }
          };

          // Enviar un evento inicial para confirmar la conexión
          send(
            JSON.stringify({
              type: "connection",
              message: "Conexión SSE establecida",
            })
          );

          // Registrar la conexión en el servicio SSE
          strapi.sse.registerConnection(userId, {
            write: send,
            on: (event: string, callback: () => void) => {
              if (event === "close") {
                ctx.req.on("close", callback);
              }
            },
          });

          // Mantener la conexión abierta
          await new Promise(() => {});
        } catch (error) {
          console.error("Error en el middleware SSE:", error);
          ctx.status = 500;
          ctx.body = { error: "Error en el servidor de eventos" };
        }
      } else {
        // No es una ruta SSE, continuar con el siguiente middleware
        await next();
      }
    });
  },
};
