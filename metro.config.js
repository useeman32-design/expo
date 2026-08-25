const { getDefaultConfig } = require('expo/metro-config');

// Hosted under a subpath on GitHub Pages (https://useeman32-design.github.io/expo/)
// so web assets must be served from /expo/ — matches app.json > web.baseUrl.
const config = getDefaultConfig(__dirname);
config.transformer.assetPrefix = '/expo/';

module.exports = config;
