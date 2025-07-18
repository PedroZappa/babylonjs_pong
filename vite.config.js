import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  return {
    build: {
      target: 'esnext'
    },
    resolve: {
      alias: {
        'babylonjs': mode === 'development' ? 'babylonjs/babylon.max' : 'babylonjs'
      }
    }
  };
});

