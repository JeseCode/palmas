/**
 * Configuración específica para SSE
 */

export default {
  // Deshabilitar completamente la autenticación para las rutas SSE
  settings: {
    auth: {
      enabled: false,
    },
    policies: {
      enabled: false,
    },
    middlewares: {
      enabled: false,
    },
  },
};
