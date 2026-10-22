import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { context } from 'esbuild'
import { createServer } from 'vite'
import { buildAdminStyles, prepareStaticFiles, resolve, root, serverOptions } from './build-support.mjs'

process.chdir(root)
if (existsSync('.env')) process.loadEnvFile()
await prepareStaticFiles()

const serverBuild = await context(serverOptions)
let backend
let vite
let stopping = false
async function stop (code = 0) {
  if (stopping) return
  stopping = true
  backend?.kill('SIGTERM')
  await Promise.all([serverBuild.dispose(), vite?.close()])
  process.exit(code)
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

try {
  await serverBuild.rebuild()
  await serverBuild.watch()
  backend = spawn(process.execPath, ['--watch', '--enable-source-maps', 'server/server.js'], {
    stdio: 'inherit',
    env: { ...process.env, GAME_PUBLIC_DIR: resolve('public') }
  })
  backend.on('exit', code => { if (!stopping) stop(code || 1) })
  vite = await createServer()

  // Vite handles client JS and main.scss. Mirror runtime-loaded assets and Twig
  // templates, which are intentionally outside the browser's module graph.
  const copies = [
    ['src/assets', 'public/build/assets'],
    ['src/js/vendor', 'public/build/js/vendor'],
    ['src/js/libs', 'public/build/js/libs'],
    ['src/views/admin', 'server/admin/views']
  ]
  vite.watcher.add([...copies.map(([source]) => resolve(source)), resolve('src/scss')])
  let pending = Promise.resolve()
  vite.watcher.on('all', (event, file) => {
    if (!['add', 'change', 'unlink'].includes(event)) return
    const relative = path.relative(root, file).split(path.sep).join('/')
    pending = pending.then(async () => {
      for (const [source, destination] of copies) {
        if (!relative.startsWith(`${source}/`)) continue
        const target = resolve(destination, relative.slice(source.length + 1))
        if (event === 'unlink') await rm(target, { force: true })
        else {
          await mkdir(path.dirname(target), { recursive: true })
          await cp(file, target)
        }
        vite.ws.send({ type: 'full-reload' })
      }
      if (relative.startsWith('src/scss/') && !relative.endsWith('/main.scss')) {
        await buildAdminStyles()
      }
    }).catch(error => console.error(error))
  })
  await vite.listen()
  vite.printUrls()
} catch (error) {
  console.error(error)
  await stop(1)
}
