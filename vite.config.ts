import { defineConfig } from 'vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: '.build_stats.html',
      title: 'Build Analysis',
      open: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AiriotClient',
      fileName: (format) => `airiot-client.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        globals: {
          // 如果有外部依赖，在这里配置全局变量名
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-router': 'ReactRouter'
        }
      },
      external: [
        // 在这里添加不希望打包进库的依赖
        // 例如: 'react', 'react-dom'
        'react', 'react-dom', 'react-router'
      ]
    },
    sourcemap: true,
    minify: 'esbuild'
  }
})
