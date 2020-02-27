const pnp = require(`./.pnp.js`);

module.exports = {
  interfaceVersion: 2,
  resolve: (source, file) => {
    console.error(source, file);

    try {
      return { found: true, path: pnp.resolveRequest(source, file) };
    } catch (error) {
      return  { found: false };
    }
  },
};
