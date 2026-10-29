# multi-page-template

基于 Vite 的多页面 React 应用模板。每个页面独立入口、独立 HTML，产物扁平输出，可整体部署到任意子路径。

## 技术栈

- React 19 + TypeScript 7（`strict`）
- Vite 8（`appType: 'mpa'`）
- Sass + CSS Modules
- SVGR（`*.svg?react` 当组件用）
- oxlint

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000/page1.html
npm run build    # tsc 类型检查 + 打包到 dist/
npm run preview  # 预览产物
npm run lint     # oxlint
```

## 目录结构

```
src/
  views/
    page1/
      template.html       # 页面 HTML 入口（约定文件名，Vite 据此生成页面）
      main.tsx            # 挂载 React
      index.tsx           # 页面组件
      index.module.scss
    page2/
      ...
public/                   # 原样拷贝到产物根目录（favicon、robots.txt）
```

`@/*` 映射到 `src/*`（`vite.config.ts` 与 `tsconfig.app.json` 保持一致）。

## 路由约定

开发与构建后的 URL 严格一致，均为 `/<page>.html`：

- `/page1.html` → `src/views/page1/template.html`
- `/page2.html` → `src/views/page2/template.html`

`/`、`/page1`（无后缀）、`/page1/` 都不响应。多页面之间跳转直接写 `href="./page2.html"`。

## 新增页面

建一个 `src/views/<page>/` 目录，放入 `template.html`（`<script>` 指向本目录的 `main.tsx`）和 `main.tsx` 即可，`vite.config.ts` 会自动收录，无需改配置：

```bash
mkdir src/views/about
cp src/views/page1/template.html src/views/about/template.html  # 改 title 与 script 路径
```

## 构建产物

```
dist/
  page1.html
  page2.html
  favicon.ico
  assets/
```

- `base: './'`，产物使用相对路径，可部署到任意子路径。
- 版本化输出目录：`PAGE_VERSION=web01 npm run build` 输出到 `web01/`（`.gitignore` 已预留 `web[0-9]*`）。

## 开发代理

在 `vite.config.ts` 的 `server.proxy` 中添加，路径原样透传、不做 rewrite：

```ts
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
},
```

## 约定

- 组件文件 `PascalCase`，工具函数与变量 `camelCase`，常量 `UPPER_SNAKE_CASE`
- 函数组件 + Hooks，Props 用 `interface` 显式定义
- 页面样式用 CSS Modules（`index.module.scss`），不写内联样式
