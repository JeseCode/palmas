export default {
  config: {
    // Agregar locales aquí
    locales: ["es"], // Agrega "es" para español

    // Extender las traducciones
    translations: {
      es: {
        "Auth.form.email.label": "Correo Electrónico",
        "Auth.form.password.label": "Contraseña",
        Users: "Usuarios",
        City: "Ciudad",
        Id: "ID",
      },
    },
    theme: {
      colors: {
        primary100: "#f6ecfc",
        primary200: "#e0c1f4",
        primary500: "#ac73e6",
        primary600: "#9736e8",
        primary700: "#8312d1",
        danger700: "#b72b1a",
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },
  bootstrap() {},
};
