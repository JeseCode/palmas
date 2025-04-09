module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      rest: {
        defaultLimit: 25,
        maxLimit: 100,
      },
      jwt: {
        expiresIn: "7d",
      },
    },
  },
});
