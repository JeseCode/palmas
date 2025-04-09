export default {
  routes: [
    {
      method: 'GET',
      path: '/notifications/user/:userId',
      handler: 'notification.findByUser',
      config: {
        auth: {
          scope: ['api::notification.notification.findByUser'],
        },
      },
    },
    {
      method: 'GET',
      path: '/notifications/sse/:userId',
      handler: 'notification.sse',
      config: {
        auth: {
          scope: ['api::notification.notification.sse'],
        },
      },
    },
    {
      method: 'POST',
      path: '/notifications/user/:userId/send',
      handler: 'notification.sendToUser',
      config: {
        auth: {
          scope: ['api::notification.notification.sendToUser'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      handler: 'notification.markAsRead',
      config: {
        auth: {
          scope: ['api::notification.notification.markAsRead'],
        },
      },
    },
    {
      method: 'PUT',
      path: '/notifications/user/:userId/read-all',
      handler: 'notification.markAllAsRead',
      config: {
        auth: {
          scope: ['api::notification.notification.markAllAsRead'],
        },
      },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'notification.deleteNotification',
      config: {
        auth: {
          scope: ['api::notification.notification.deleteNotification'],
        },
      },
    },
  ],
};
