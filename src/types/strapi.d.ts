import "@strapi/strapi";

declare module "@strapi/strapi" {
  interface Strapi {
    sse: {
      registerConnection(userId: string, res: any): void;
      sendNotification(userId: string, data: any): boolean;
    };
  }
}

export {};
