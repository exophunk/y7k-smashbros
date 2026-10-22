import { build as buildClient } from 'vite'
import { build as buildServer } from 'esbuild'
import { prepareStaticFiles, serverOptions, root } from './build-support.mjs'

process.chdir(root)
await prepareStaticFiles()
await buildServer(serverOptions)
await buildClient({ mode: process.argv.includes('--development') ? 'development' : 'production' })
