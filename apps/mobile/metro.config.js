/**
 * Metro config for the SkillBridge mobile app (apps/mobile).
 *
 * Built on expo/metro-config's defaults (the recommended base — hand-rolling
 * a minimal config skips SDK-required defaults) and extended with the monorepo
 * workspace folders so @skillbridge/* packages resolve from source.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const root = __dirname;

const config = getDefaultConfig(root);

config.watchFolders = [
  root,
  path.resolve(root, '../../packages/config'),
  path.resolve(root, '../../packages/types'),
  path.resolve(root, '../../packages/ui'),
  path.resolve(root, '../../packages/utils'),
];

module.exports = config;
