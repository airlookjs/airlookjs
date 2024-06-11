// vite.config.ts
import { defineConfig } from 'file:///Users/k-johancc-jbl/dev/airlookjs/node_modules/.pnpm/vite@5.0.13_@types+node@20.12.7/node_modules/vite/dist/node/index.js';
import { nxViteTsPaths } from 'file:///Users/k-johancc-jbl/dev/airlookjs/node_modules/.pnpm/@nx+vite@19.1.0_@babel+traverse@7.24.6_@swc-node+register@1.9.1_@swc+core@1.5.7_@swc+helpers@_opclldoew6ef6r5s5dqkxlb4ae/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js';
var __vite_injected_original_dirname =
  '/Users/k-johancc-jbl/dev/airlookjs/libs/util';
var vite_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: '../node_modules/.vite/libs',
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvay1qb2hhbmNjLWpibC9kZXYvYWlybG9va2pzL2xpYnMvdXRpbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2stam9oYW5jYy1qYmwvZGV2L2Fpcmxvb2tqcy9saWJzL3V0aWwvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2stam9oYW5jYy1qYmwvZGV2L2Fpcmxvb2tqcy9saWJzL3V0aWwvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcblxuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gJ0BueC92aXRlL3BsdWdpbnMvbngtdHNjb25maWctcGF0aHMucGx1Z2luJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogX19kaXJuYW1lLFxuICBjYWNoZURpcjogJy4uL25vZGVfbW9kdWxlcy8udml0ZS9saWJzJyxcblxuICBwbHVnaW5zOiBbbnhWaXRlVHNQYXRocygpXSxcblxuICAvLyBVbmNvbW1lbnQgdGhpcyBpZiB5b3UgYXJlIHVzaW5nIHdvcmtlcnMuXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgcGx1Z2luczogWyBueFZpdGVUc1BhdGhzKCkgXSxcbiAgLy8gfSxcblxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBjYWNoZTogeyBkaXI6ICcuLi9ub2RlX21vZHVsZXMvLnZpdGVzdCcgfSxcbiAgICBlbnZpcm9ubWVudDogJ25vZGUnLFxuICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3Rlc3Qsc3BlY30ue2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fSddLFxuICAgIHJlcG9ydGVyczogWydkZWZhdWx0J10sXG4gICAgY292ZXJhZ2U6IHsgcmVwb3J0c0RpcmVjdG9yeTogJy4uL2NvdmVyYWdlL2xpYnMnLCBwcm92aWRlcjogJ3Y4JyB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQW9CO0FBRW5WLFNBQVMscUJBQXFCO0FBRjlCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFVBQVU7QUFBQSxFQUVWLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT3pCLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULE9BQU8sRUFBRSxLQUFLLDBCQUEwQjtBQUFBLElBQ3hDLGFBQWE7QUFBQSxJQUNiLFNBQVMsQ0FBQyxzREFBc0Q7QUFBQSxJQUNoRSxXQUFXLENBQUMsU0FBUztBQUFBLElBQ3JCLFVBQVUsRUFBRSxrQkFBa0Isb0JBQW9CLFVBQVUsS0FBSztBQUFBLEVBQ25FO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
