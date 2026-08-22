/**
 * Minimal Metro config for the SkillBridge mobile app (apps/mobile).
 *
 * We avoid getDefaultConfig (which pins projectRoot to CWD-relative '.')
 * and set everything explicitly so ./index.ts resolves from apps/mobile.
 */
const path = require("path");

const root = __dirname;

module.exports = {
  projectRoot: root,
  resolver: {
    projectRoot: root,
    sourceExts: ["js", "jsx", "ts", "tsx", "json", "native"],
  },
  watchFolders: [
    root,
    path.resolve(root, "../../packages/config"),
    path.resolve(root, "../../packages/types"),
    path.resolve(root, "../../packages/ui"),
    path.resolve(root, "../../packages/utils"),
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
