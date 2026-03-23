import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import { globSync } from 'glob'
import vituum from 'vituum'
import pages from 'vituum/plugins/pages.js'
import sassGlobImports from 'vite-plugin-sass-glob-import'
import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminWebp from 'imagemin-webp'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import pug from '@vituum/vite-plugin-pug'
import postcssWillChange from 'postcss-will-change'
import autoprefixer from 'autoprefixer'
import postcssUrl from 'postcss-url'
import { svgSpritemap } from 'vite-plugin-svg-spritemap'

const COMPONENTS_DIR = path.resolve(__dirname, 'src/pug/components')
const PUG_FOLDERS = ['blocks', 'elements', 'sections', 'ui', 'utils']

function generateAllIncludes() {
  const out = path.join(COMPONENTS_DIR, '_auto-import.pug')
  let content = ''

  PUG_FOLDERS.forEach(folder => {
    const dir = path.join(COMPONENTS_DIR, folder)
    if (!fs.existsSync(dir)) return
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.pug'))
      .sort()
    if (files.length) {
      content += `//- ${folder}\n`
      content += files.map(f => `include ./${folder}/${f}`).join('\n') + '\n'
    }
  })

  fs.writeFileSync(out, content)
}

function pugComponentsAutoInclude() {
  return {
    name: 'vite-pug-components-autoinclude',
    buildStart() {
      generateAllIncludes()
    },
    configureServer(server) {
      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.pug') && file.includes('components')) {
          generateAllIncludes()
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.pug') && file.includes('components')) {
        generateAllIncludes()
        server.ws.send({ type: 'full-reload' })
      }
    }
  }
}

function watchScssFiles() {
  return {
    name: 'vite-watch-scss-files',
    configureServer(server) {
      server.watcher.on('add', (file) => {
        if (file.endsWith('.scss')) {
          console.log('New SCSS file detected:', file)
          server.moduleGraph.invalidateAll()
          server.ws.send({
            type: 'full-reload',
            path: '*'
          })
        }
      })
    }
  }
}

const disableWebp = () => {
  return {
    apply: 'serve',
    name: 'disable-webp',
    transformIndexHtml(html) {
      return html.replaceAll(
        /<source type=\"image\/webp\" (.*?)>/g,
        `<!-- <source type="image/webp"> disable webp for "serve" mode -->`,
      )
    }
  }
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: './',
    resolve: {
      alias: {
        '@animations': path.resolve(__dirname, 'src/js/animations'),
        '@scss': path.resolve(__dirname, 'src/scss'),
        '@utils': path.resolve(__dirname, 'src/js/utils'),
        '@data': path.resolve(__dirname, 'src/js/data'),
        '@libs': path.resolve(__dirname, 'src/js/libs'),
        '@modules': path.resolve(__dirname, 'src/js/modules'),
        '@helpers': path.resolve(__dirname, 'src/js/helpers'),
        '@types': path.resolve(__dirname, 'src/js/types')
      }
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['mixed-decls'],
          additionalData: isProd
            ? `$url-img: '../img/bg';`
            : `$url-img: '/public/assets/img/bg';`
        }
      },
      postcss: {
        plugins: [
          postcssWillChange(),
          autoprefixer(),
          postcssUrl({
            url: (asset) => {
              if (!isProd) {
                return asset.url
              }
              if (asset.url.includes('/assets/fonts/')) {
                return asset.url.replace('/assets/fonts/', '../fonts/')
              }
              return asset.url
            }
          })
        ]
      }
    },
    build: {
      outDir: 'build',
      minify: isProd,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: globSync('./src/pug/pages/*.pug', { posix: true }),
        output: {
          chunkFileNames: () => `assets/[name].js`,
          assetFileNames: () => `assets/[name].[ext]`
        }
      },
    },
    experimental: {
      renderBuiltUrl: (filename, {type}) => {
        if (type === 'asset') {
          return `./${filename}`
        } else {
          return {
            relative: true,
          };
        }
      },
    },
    server: {
      open: true,
      port: 9000
    },
    plugins: [
      watchScssFiles(),
      disableWebp(),
      viteImagemin({
        // verbose: false,
        include: ['build/img/**/*.(png|jpg|svg)'],
        exclude: ['build/*.(png|jpg|svg)', '**/node_modules/**', '*/*/sprite.svg'],
        plugins: {
          jpg: imageminMozjpeg({quality: 80}),
          jpeg: imageminMozjpeg({quality: 80}),
          png: imageminPngquant({quality: [0.8, 0.9]}),
          svg: imageminSvgo()
        },
        makeWebp: {
          formatFilePath: (file) => `${file.slice(0, file.lastIndexOf('.'))}.webp`,
          skipIfLargerThan: false,
          plugins: {
            jpg: imageminWebp({quality: 80}),
            jpeg: imageminWebp({quality: 80}),
            png: imageminWebp({quality: 80})
          }
        },
      }),
      svgSpritemap({
        pattern: 'src/icns/*.svg',
        // currentColor: true,
        filename: 'assets/img/sprite.svg'
      }),
      vituum(),
      sassGlobImports(),
      pug({
        root: './src/pug/pages'
      }),
      pages({
        dir: './src/pug/pages',
        normalizeBasePath: true
      }),
      pugComponentsAutoInclude()
    ]
  }
})
