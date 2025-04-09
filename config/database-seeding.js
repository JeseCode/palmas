module.exports = {
  enabled: true,
  seeders: [
    {
      name: 'blocks-seeder',
      seeder: require('../src/api/block/content-types/block/data/seed'),
      run: true,
    },
  ],
};
