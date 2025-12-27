const path = require('path');

/**
 * Next.js configuration for buildspaces-ui-reference
 * Sets turbopack.root to the monorepo root to silence the "inferred workspace root" warning.
 */
module.exports = {
  turbopack: {
    root: path.resolve(__dirname, '..', '..'),
  },
};
