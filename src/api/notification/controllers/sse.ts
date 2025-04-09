/**
 * Server-Sent Events controller
 */

import { factories } from '@strapi/strapi';

// Almacena las conexiones activas por usuario
const userConnections = new Map();

export default {
  // Establece una conexión SSE
  async connect(ctx) {
    try {
      const { userId } = ctx.params;
      const { token } = ctx.query; // Obtener el token de la URL
      
      if (!userId) {
        return ctx.badRequest('Se requiere el ID del usuario');
      }

      // Verificar que el usuario existe
      let userExists;
      
      try {
        // Si hay token, intentar verificar el usuario con el token
        if (token) {
          try {
            const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(token);
            if (decoded && decoded.id) {
              userExists = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
            }
          } catch (tokenError) {
            console.error('Error al verificar token SSE:', tokenError);
          }
        }
        
        // Si no hay token o falló la verificación, intentar buscar el usuario directamente
        if (!userExists) {
          userExists = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        }
      } catch (error) {
        console.error(`Error al buscar usuario ${userId}:`, error);
        return ctx.notFound('Usuario no encontrado');
      }
      
      if (!userExists) {
        console.error(`SSE: Usuario con ID ${userId} no encontrado`);
        return ctx.notFound('Usuario no encontrado');
      }

      // Configurar la respuesta para SSE
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Para Nginx
      });
      
      // Mantener la conexión abierta
      ctx.req.socket.setTimeout(0);
      ctx.req.socket.setNoDelay(true);
      ctx.req.socket.setKeepAlive(true);
      
      // Función para enviar eventos al cliente
      const send = (data) => {
        try {
          ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          console.error(`Error al enviar datos SSE a usuario ${userId}:`, error);
        }
      };
      
      // Enviar un evento inicial para confirmar la conexión
      send({ type: 'connection', message: 'Conexión SSE establecida' });
      
      // Almacenar la conexión para este usuario
      if (!userConnections.has(userId)) {
        userConnections.set(userId, []);
      }
      userConnections.get(userId).push(send);
      
      console.log(`Nueva conexión SSE establecida para usuario ${userId}. Total conexiones: ${userConnections.get(userId).length}`);
      
      // Manejar el cierre de la conexión
      ctx.req.on('close', () => {
        const connections = userConnections.get(userId) || [];
        const index = connections.indexOf(send);
        if (index !== -1) {
          connections.splice(index, 1);
          console.log(`Conexión SSE cerrada para usuario ${userId}. Conexiones restantes: ${connections.length}`);
        }
        if (connections.length === 0) {
          userConnections.delete(userId);
          console.log(`Todas las conexiones SSE cerradas para usuario ${userId}`);
        }
      });
      
      // Mantener la conexión abierta
      return new Promise(() => {});
    } catch (error) {
      console.error('Error en el controlador SSE:', error);
      return ctx.internalServerError('Error en el servidor de eventos');
    }
  },
  
  // Envía una notificación a un usuario específico a través de SSE
  sendNotification(userId, notification) {
    try {
      if (!userId) {
        console.error('SSE: Intento de enviar notificación sin ID de usuario');
        return false;
      }
      
      const userIdStr = userId.toString();
      const connections = userConnections.get(userIdStr) || [];
      
      if (connections.length > 0) {
        console.log(`Enviando notificación SSE a usuario ${userIdStr} (${connections.length} conexiones)`);
        
        connections.forEach(send => {
          try {
            send({
              type: 'notification',
              data: notification
            });
          } catch (error) {
            console.error(`Error al enviar notificación SSE a usuario ${userIdStr}:`, error);
          }
        });
        return true;
      } else {
        console.log(`Usuario ${userIdStr} no está conectado por SSE`);
        return false;
      }
    } catch (error) {
      console.error('Error al enviar notificación SSE:', error);
      return false;
    }
  }
};
