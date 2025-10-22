module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Reanimated plugin (now that worklets is installed)
      'react-native-reanimated/plugin',
    ],
  };
};
