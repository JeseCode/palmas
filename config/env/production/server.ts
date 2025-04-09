export default ({ env }) => ({
  url: "https://palmas-production.up.railway.app", // Asegura la URL pública
  proxy: true, // ⚠️ Necesario para que CORS funcione en producción
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});
