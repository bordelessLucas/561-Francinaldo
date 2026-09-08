module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Must be last. Do not add react-native-worklets/plugin separately on SDK 57.
    plugins: ['react-native-reanimated/plugin'],
  };
};
