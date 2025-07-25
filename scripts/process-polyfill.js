/**
 * Process polyfill for browser environment
 */
window.process = {
  env: {
    NODE_ENV: 'development'
  },
  browser: true,
  version: '',
  versions: {},
  platform: 'browser'
};

window.global = window;