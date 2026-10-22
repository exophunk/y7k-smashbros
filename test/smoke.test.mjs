import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { test } from 'node:test'
import bcrypt from 'bcryptjs'
import connect from 'socket.io-client'

function socketEvent (socket, event) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 5000)
    socket.once(event, data => {
      clearTimeout(timeout)
      resolve(data)
    })
  })
}

test('built game serves assets, admin, and a multiplayer round on Node 26', { timeout: 20000 }, async t => {
  const password = 'build-smoke-test'
  const server = spawn(process.execPath, ['--enable-source-maps', 'server/server.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      GAME_PUBLIC_DIR: 'dist',
      PORT: '0',
      ADMIN_USER: 'smoke',
      ADMIN_PWHASH: bcrypt.hashSync(password, 4)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  let logs = ''
  server.stdout.on('data', chunk => { logs += chunk })
  server.stderr.on('data', chunk => { logs += chunk })
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit')
      server.kill()
      await exited
    }
  })
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server did not start: ${logs}`)), 5000)
    server.once('error', error => { clearTimeout(timeout); reject(error) })
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited (${code}): ${logs}`)) })
    server.stdout.on('data', () => {
      const match = logs.match(/Listening on Port (\d+)/)
      if (match) { clearTimeout(timeout); resolve(match[1]) }
    })
  })
  const url = `http://127.0.0.1:${port}`

  const page = await fetch(url)
  assert.equal(page.status, 200)
  const html = await page.text()
  assert.match(html, /Y7K Smash Bros/)
  assert.doesNotMatch(html, /\/src\/|@vite\/client/)
  const assets = [...html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map(match => match[1])
  assets.push('/build/assets/data/characters.json', '/build/assets/data/throwables.json', '/build/css/admin.css')
  for (const asset of new Set(assets)) {
    const response = await fetch(`${url}${asset}`)
    assert.equal(response.status, 200, `Missing built asset: ${asset}`)
    await response.arrayBuffer()
  }

  assert.equal((await fetch(`${url}/admin`)).status, 401)
  const admin = await fetch(`${url}/admin`, {
    headers: { Authorization: `Basic ${Buffer.from(`smoke:${password}`).toString('base64')}` }
  })
  assert.equal(admin.status, 200)
  assert.match(await admin.text(), /Y7K Smashbros/)

  // Exercise both transports and the existing room/join/world-snapshot protocol.
  const first = connect(url, { forceNew: true, reconnection: false, transports: ['polling'] })
  const second = connect(url, { forceNew: true, reconnection: false, transports: ['websocket'] })
  t.after(() => { first.disconnect(); second.disconnect() })
  await Promise.all([socketEvent(first, 'connect'), socketEvent(second, 'connect')])
  const player = (key, name) => ({ name, char: { key, body: { x: 200, y: 200 } } })
  const joinedFirst = socketEvent(first, 'confirm_join')
  first.emit('join', { playerData: player('gabriella', 'First') })
  const firstState = await joinedFirst
  assert.equal(Object.keys(firstState.worldSnapshot.players).length, 1)
  assert.ok(Object.keys(firstState.worldSnapshot.throwables).length > 0)

  const enemyJoined = socketEvent(first, 'enemy_joined')
  const roundStarted = socketEvent(first, 'round_start')
  const joinedSecond = socketEvent(second, 'confirm_join')
  second.emit('join', { playerData: player('joris', 'Second') })
  const [secondState, enemy] = await Promise.all([joinedSecond, enemyJoined, roundStarted])
  assert.equal(enemy.id, secondState.id)
  assert.equal(Object.keys(secondState.worldSnapshot.players).length, 2)
  assert.equal(secondState.isRoundRunning, true)
  const world = await socketEvent(first, 'update_world')
  assert.equal(typeof world.serverTime, 'number')
  const enemyLeft = socketEvent(first, 'enemy_left')
  second.disconnect()
  assert.equal(await enemyLeft, secondState.id)
})
