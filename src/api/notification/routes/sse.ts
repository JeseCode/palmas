/**
 * Server-Sent Events routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/notifications/sse/:userId',
      handler: 'sse.connect',
      config: {
        auth: false, // Permitir conexiones sin autenticación para SSE
        policies: [],
        middlewares: [],
      },
    },
  ],
};
