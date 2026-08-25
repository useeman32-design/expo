const { getDefaultConfig } = require('expo/metro-config');

// Default Expo Metro config. The web hosting base path is configured via
// app.json > experiments.baseUrl ("/expo" on GitHub Pages).
const config = getDefaultConfig(__dirname);

module.exports = config;
