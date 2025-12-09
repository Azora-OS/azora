const { withCustomConfig } = require("postcss-config-custom");

module.exports = withCustomConfig({
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
});
