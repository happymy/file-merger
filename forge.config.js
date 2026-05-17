const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    win32metadata: {
      publisher: 'file-merger',
    },
    // 禁用自动更新相关设置
    disableSquirrelAutoUpdate: true,
  },
  rebuildConfig: {},
  makers: [
    // 移除了 @electron-forge/maker-squirrel，因为它会生成 Update.exe
    // 如果您确实需要 Windows 安装程序，可以考虑使用 maker-wix 或 maker-nsis 替代
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin'], // 支持 Windows 和 macOS 的 ZIP 打包
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};