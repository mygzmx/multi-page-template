import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { defineConfig, type Plugin } from 'vite'

const root = import.meta.dirname
const viewsDir = resolve(root, 'src/views')

// 约定：src/views/<page>/template.html 就是一个页面入口。
// 新增页面只需建目录，这里自动收录，不用改配置。
const views = readdirSync(viewsDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      existsSync(resolve(viewsDir, entry.name, 'template.html')),
  )
  .map((entry) => entry.name)

const input = Object.fromEntries(
  views.map((name) => [name, resolve(viewsDir, name, 'template.html')]),
)

// 产物扁平化：src/views/<page>/template.html → dist/<page>.html
const flattenViewsHtml = (): Plugin => ({
  name: 'flatten-views-html',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const page of views) {
      const fileName = `src/views/${page}/template.html`
      const html = bundle[fileName]
      if (html?.type !== 'asset') continue
      const source =
        typeof html.source === 'string'
          ? html.source
          : new TextDecoder().decode(html.source)
      // Vite 按 HTML 所在深度生成 ../../../ 前缀，移到根目录后要改回 ./
      const depth = fileName.split('/').length - 1
      this.emitFile({
        type: 'asset',
        fileName: `${page}.html`,
        source: source.replaceAll('../'.repeat(depth), './'),
      })
      delete bundle[fileName]
    }
  },
})

// dev 下仅 /<page>.html 命中源码页面，与产物 URL 严格一致（/ 和 /home 不响应）
const devViewsAlias = (): Plugin => ({
  name: 'dev-views-alias',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [pathname, search = ''] = (req.url ?? '').split(/(?=\?)/)
      const match = /^\/([^/]+)\.html$/.exec(pathname)
      if (match && views.includes(match[1])) {
        req.url = `/src/views/${match[1]}/template.html${search}`
      }
      next()
    })
  },
  // preview 会自动把 /home 补成 /home.html，这里拦掉，只留带后缀的地址
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const [pathname] = (req.url ?? '').split(/(?=\?)/)
      if (views.some((page) => pathname === `/${page}` || pathname === `/${page}/`)) {
        res.statusCode = 404
        res.end()
        return
      }
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), flattenViewsHtml(), devViewsAlias()],
  appType: 'mpa',
  // 相对 base，产物可整体部署到任意子路径下
  base: './',
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  server: {
    port: 3000,
    // open: '/page1.html',
    // 开发代理，路径原样透传，不做 rewrite
    proxy: {
    },
  },
  build: {
    // 版本化产物目录：PAGE_VERSION=web01 npm run build，或 npm run build -- --outDir web01
    outDir: process.env.PAGE_VERSION || 'dist',
    rolldownOptions: { input },
  },
})
