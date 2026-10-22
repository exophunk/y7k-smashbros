import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileAsync } from 'sass'

export const root = fileURLToPath(new URL('../', import.meta.url))
export const resolve = (...parts) => path.resolve(root, ...parts)
export const aliases = Object.fromEntries(
  ['client', 'server', 'shared'].map(name => [name, resolve('src/js', name)])
)

export const serverOptions = {
  absWorkingDir: root,
  entryPoints: ['src/js/server/server.js'],
  outfile: 'server/server.js',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node26',
  packages: 'external',
  alias: aliases,
  sourcemap: true,
  logLevel: 'info'
}

export async function buildAdminStyles () {
  const result = await compileAsync(resolve('src/scss/admin.scss'), { style: 'compressed' })
  await mkdir(resolve('public/build/css'), { recursive: true })
  await writeFile(resolve('public/build/css/admin.css'), result.css)
}

// These scripts predate ES modules and deliberately expose Phaser/Fabrique globals.
// Keep their original execution order and the game's existing asset URLs.
export async function prepareStaticFiles () {
  await rm(resolve('public/build'), { recursive: true, force: true })
  await mkdir(resolve('public/build/js/vendor'), { recursive: true })
  await Promise.all([
    cp(resolve('src/assets'), resolve('public/build/assets'), { recursive: true }),
    cp(resolve('src/js/vendor'), resolve('public/build/js/vendor'), { recursive: true }),
    cp(resolve('src/js/libs'), resolve('public/build/js/libs'), { recursive: true }),
    cp(resolve('node_modules/phaser-ce/build/phaser.min.js'), resolve('public/build/js/vendor/phaser.min.js')),
    cp(resolve('node_modules/webfontloader/webfontloader.js'), resolve('public/build/js/vendor/webfontloader.js')),
    cp(resolve('src/views/admin'), resolve('server/admin/views'), { recursive: true }),
    buildAdminStyles()
  ])
}
