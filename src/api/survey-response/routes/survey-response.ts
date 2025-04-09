/**
 * survey-response router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/survey-responses",
      handler: "survey-response.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/survey-responses/:id",
      handler: "survey-response.update",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/survey-responses/:id",
      handler: "survey-response.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/survey-responses",
      handler: "survey-response.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/survey-responses/:id",
      handler: "survey-response.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/survey-responses/survey/:id",
      handler: "survey-response.findBySurvey",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
