import DotEnv from 'dotenv';
import { defineConfig } from 'vite';

import { getBuildConfig } from './build';
import { ViteEnvConfig, ViteMode, VitePlatform } from './config.types';
import { getBuildDefines, getDevDefines } from './define';
import { getBuildPlugins, getDevPlugins } from './plugins';
import { getServerConfig } from './server';
import styles from './styles';

const defaultConfig = {
  css: styles,
};

const getEnvConfig = (mode: ViteMode, platform: VitePlatform): ViteEnvConfig => {
  const fileName = platform ? `.${platform}.${mode}.env` : `.${mode}.env`;
  const path = `./setup/env/${fileName}`;
  const isDev = mode === 'dev';
  const result = DotEnv.config({ debug: isDev, path });

  if (result.error) {
    throw result.error;
  }

  return result.parsed as ViteEnvConfig;
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode = 'dev' }) => {
  const platform = (process?.env?.platform || '') as VitePlatform;
  const envConfig = getEnvConfig(mode as ViteMode, platform);

  switch (command) {
    case 'build':
      return {
        ...defaultConfig,
        build: getBuildConfig(platform),
        define: getBuildDefines(envConfig, platform),
        mode: 'production',
        plugins: getBuildPlugins(platform),
      };
    default:
      return {
        ...defaultConfig,
        define: getDevDefines(envConfig, platform),
        plugins: getDevPlugins(platform),
        server: getServerConfig(envConfig),
      };
  }
});
