// vite.config.ts
import { defineConfig } from 'file:///Users/k-johancc-jbl/dev/airlookjs/node_modules/.pnpm/vite@5.0.13_@types+node@20.12.7/node_modules/vite/dist/node/index.js';
import { nxViteTsPaths } from 'file:///Users/k-johancc-jbl/dev/airlookjs/node_modules/.pnpm/@nx+vite@19.1.0_@babel+traverse@7.24.6_@swc-node+register@1.9.1_@swc+core@1.5.7_@swc+helpers@_opclldoew6ef6r5s5dqkxlb4ae/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js';
var __vite_injected_original_dirname =
  '/Users/k-johancc-jbl/dev/airlookjs/packages/loudness';
var vite_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  //cacheDir: '../node_modules/.vite/libs',
  plugins: [nxViteTsPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    globals: true,
    cache: { dir: '../node_modules/.vitest' },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: { reportsDirectory: '../coverage/libs', provider: 'v8' },
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvay1qb2hhbmNjLWpibC9kZXYvYWlybG9va2pzL3BhY2thZ2VzL2xvdWRuZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvay1qb2hhbmNjLWpibC9kZXYvYWlybG9va2pzL3BhY2thZ2VzL2xvdWRuZXNzL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rLWpvaGFuY2MtamJsL2Rldi9haXJsb29ranMvcGFja2FnZXMvbG91ZG5lc3Mvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IG54Vml0ZVRzUGF0aHMgfSBmcm9tICdAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpbic7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IF9fZGlybmFtZSxcbiAgLy9jYWNoZURpcjogJy4uL25vZGVfbW9kdWxlcy8udml0ZS9saWJzJyxcblxuICBwbHVnaW5zOiBbbnhWaXRlVHNQYXRocygpXSxcblxuICAvLyBVbmNvbW1lbnQgdGhpcyBpZiB5b3UgYXJlIHVzaW5nIHdvcmtlcnMuXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgcGx1Z2luczogWyBueFZpdGVUc1BhdGhzKCkgXSxcbiAgLy8gfSxcblxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBjYWNoZTogeyBkaXI6ICcuLi9ub2RlX21vZHVsZXMvLnZpdGVzdCcgfSxcbiAgICBlbnZpcm9ubWVudDogJ25vZGUnLFxuICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3Rlc3Qsc3BlY30ue2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fSddLFxuICAgIHJlcG9ydGVyczogWydkZWZhdWx0J10sXG4gICAgY292ZXJhZ2U6IHsgcmVwb3J0c0RpcmVjdG9yeTogJy4uL2NvdmVyYWdlL2xpYnMnLCBwcm92aWRlcjogJ3Y4JyB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThVLFNBQVMsb0JBQW9CO0FBQzNXLFNBQVMscUJBQXFCO0FBRDlCLElBQU0sbUNBQW1DO0FBR3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQTtBQUFBLEVBR04sU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPekIsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsT0FBTyxFQUFFLEtBQUssMEJBQTBCO0FBQUEsSUFDeEMsYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLHNEQUFzRDtBQUFBLElBQ2hFLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDckIsVUFBVSxFQUFFLGtCQUFrQixvQkFBb0IsVUFBVSxLQUFLO0FBQUEsRUFDbkU7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
