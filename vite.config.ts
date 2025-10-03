import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
          dest: 'wasm',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
          dest: 'wasm',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
          dest: 'wasm',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs',
          dest: 'wasm',
        },
      ],
    }),
  ],
});
