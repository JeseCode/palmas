import { factories } from "@strapi/strapi";

interface SSEResponse {
  write(data: string): void;
  on(event: string, callback: () => void): void;
}

type SSEConnection = SSEResponse | ((data: string) => void);

declare global {
  var sseConnections: Map<string, Set<SSEConnection>>;
}

// Extender la interfaz Strapi para incluir el servicio SSE
declare module "@strapi/strapi" {
  interface Strapi {
    sse: {
      registerConnection(userId: string, res: SSEResponse): void;
      sendNotification(userId: string, data: any): boolean;
    };
  }
}

const sseService = {
  initialize() {
    // Inicializar el almacén de conexiones SSE si no existe
    if (!global.sseConnections) {
      global.sseConnections = new Map<string, Set<SSEConnection>>();
    }

    return {
      // Registrar una nueva conexión SSE
      registerConnection(userId: string, res: SSEResponse) {
        if (!global.sseConnections.has(userId)) {
          global.sseConnections.set(userId, new Set());
        }
        global.sseConnections.get(userId)?.add(res);

        // Configurar el cleanup cuando se cierre la conexión
        res.on("close", () => {
          const userConnections = global.sseConnections.get(userId);
          if (userConnections) {
            userConnections.delete(res);
            if (userConnections.size === 0) {
              global.sseConnections.delete(userId);
            }
          }
        });
      },

      // Enviar una notificación a un usuario específico
      sendNotification(userId: string, data: any) {
        console.log(`Intentando enviar notificación SSE a usuario ${userId}:`, data);
        const userConnections = global.sseConnections.get(userId);

        if (!userConnections || userConnections.size === 0) {
          console.log(`No hay conexiones activas para el usuario ${userId}`);
          return false;
        }

        const message = `data: ${JSON.stringify(data)}\n\n`;
        let sent = false;

        userConnections.forEach((connection) => {
          try {
            if (typeof connection === "function") {
              connection(message);
            } else {
              connection.write(message);
            }
            sent = true;
          } catch (error) {
            console.error(
              `Error al enviar notificación a una conexión del usuario ${userId}:`,
              error
            );
            userConnections.delete(connection);
          }
        });

        return sent;
      },
    };
  },
};

export default sseService;
