import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthSession, AccountRoleError } from '../src/auth/session.ts'
import { homeForRole, parseUser, parseLogin } from '../src/auth/auth.ts'
import { ApiError } from '../src/api/client.ts'

const user = { id: '7154c4de-cacd-44fd-9381-a20ad67ba541', nome: 'Pessoa Teste', email: 'user@example.test', perfil: 'COLABORADOR', empresaId: null }
const response = (value, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => value })
const loginResult = (usuario = user, accessToken = 'test.token.signature') => ({ accessToken, tokenType: 'Bearer', expiresIn: 3600, usuario })
function fixture() {
  const map = new Map()
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) }
  let now = 1000
  return { map, storage, session: createAuthSession(() => storage, () => now), advance: ms => { now += ms } }
}

test('contrato aceita somente perfis conhecidos e empresa vinculada', () => {
  assert.deepEqual(parseUser(user), user)
  assert.throws(() => parseUser({ ...user, perfil: 'ADMIN' }), ApiError)
  assert.throws(() => parseUser({ ...user, perfil: 'EMPRESA' }), ApiError)
  assert.throws(() => parseLogin({ ...loginResult(), expiresIn: NaN }, 0), ApiError)
  assert.equal(homeForRole('colaborador'), '/dashboard')
  assert.equal(homeForRole('empresa'), '/empresa/dashboard')
})

test('flags antigas de mock não autenticam e são removidas', async () => {
  const { map, session } = fixture()
  map.set('etp-mock-session', 'true')
  map.set('etp-mock-role', 'empresa')
  await session.restore()
  assert.equal(session.getSnapshot().status, 'anonymous')
  assert.equal(map.size, 0)
})

test('login envia somente credenciais e salva somente token e validade', async t => {
  const { map, session } = fixture()
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    assert.equal(path, '/api/auth/login')
    assert.deepEqual(JSON.parse(options.body), { email: user.email, senha: 'test-password' })
    assert.equal(options.credentials, 'omit')
    return response(loginResult())
  })
  await session.login(` ${user.email} `, 'test-password', 'colaborador')
  assert.deepEqual(session.getSnapshot().user, user)
  assert.deepEqual(JSON.parse(map.get('etp-auth-session-v1')), { accessToken: 'test.token.signature', expiresAt: 3601000 })
  session.logout()
  assert.equal(map.size, 0)
  assert.equal(session.getSnapshot().user, null)
})

test('seleção de empresa não promove um colaborador', async t => {
  const { map, session } = fixture()
  t.mock.method(globalThis, 'fetch', async () => response(loginResult()))
  await assert.rejects(session.login(user.email, 'test-password', 'empresa'), AccountRoleError)
  assert.equal(session.getSnapshot().status, 'anonymous')
  assert.equal(map.size, 0)
})

test('erro de credenciais e falha de rede nunca ativam sessão mock', async t => {
  const { session } = fixture()
  const fetch = t.mock.method(globalThis, 'fetch', async () => response({}, 401))
  await assert.rejects(session.login(user.email, 'wrong', 'colaborador'), { status: 401 })
  fetch.mock.mockImplementation(async () => { throw new TypeError('offline') })
  await assert.rejects(session.login(user.email, 'test-password', 'colaborador'), { status: 0 })
  assert.equal(session.getSnapshot().status, 'anonymous')
})

test('recarga depende de /me e usa o perfil retornado pelo servidor', async t => {
  const { map, session } = fixture()
  map.set('etp-auth-session-v1', JSON.stringify({ accessToken: 'saved', expiresAt: 9000, perfil: 'EMPRESA' }))
  let resolve
  t.mock.method(globalThis, 'fetch', (path, options) => {
    assert.equal(path, '/api/auth/me')
    assert.equal(options.headers.Authorization, 'Bearer saved')
    return new Promise(done => { resolve = done })
  })
  const restoring = session.restore()
  assert.equal(session.getSnapshot().status, 'checking')
  resolve(response(user))
  await restoring
  assert.equal(session.getSnapshot().user.perfil, 'COLABORADOR')
})

test('falha temporária na recarga bloqueia acesso e permite tentar novamente', async t => {
  const { map, session } = fixture()
  map.set('etp-auth-session-v1', JSON.stringify({ accessToken: 'saved', expiresAt: 9000 }))
  const fetch = t.mock.method(globalThis, 'fetch', async () => response({}, 503))
  await session.restore()
  assert.equal(session.getSnapshot().status, 'unavailable')
  assert.equal(session.getSnapshot().user, null)
  assert.ok(map.has('etp-auth-session-v1'))
  fetch.mock.mockImplementation(async () => response(user))
  await session.restore()
  assert.equal(session.getSnapshot().status, 'authenticated')
})

test('token expirado ou rejeitado é removido', async t => {
  const { map, session } = fixture()
  map.set('etp-auth-session-v1', JSON.stringify({ accessToken: 'expired', expiresAt: 999 }))
  await session.restore()
  assert.equal(session.getSnapshot().expired, true)
  assert.equal(map.size, 0)
  map.set('etp-auth-session-v1', JSON.stringify({ accessToken: 'revoked', expiresAt: 9000 }))
  t.mock.method(globalThis, 'fetch', async () => response({}, 401))
  await session.restore()
  assert.equal(session.getSnapshot().status, 'anonymous')
  assert.equal(map.size, 0)
})

test('requisições enviam Bearer: 403 preserva a sessão e 401 a encerra', async t => {
  const { session } = fixture()
  const fetch = t.mock.method(globalThis, 'fetch', async () => response(loginResult()))
  await session.login(user.email, 'test-password', 'colaborador')
  fetch.mock.mockImplementation(async (_path, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test.token.signature')
    return response({}, 403)
  })
  await assert.rejects(session.request('/api/empresa/test'), { status: 403 })
  assert.equal(session.getSnapshot().status, 'authenticated')
  fetch.mock.mockImplementation(async () => response({}, 401))
  await assert.rejects(session.request('/api/cursos'), { status: 401 })
  assert.equal(session.getSnapshot().expired, true)
})

test('resposta atrasada de login não reabre sessão após logout', async t => {
  const { session, map } = fixture()
  let resolve
  t.mock.method(globalThis, 'fetch', () => new Promise(done => { resolve = done }))
  const pending = session.login(user.email, 'test-password', 'colaborador')
  session.logout()
  resolve(response(loginResult()))
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(session.getSnapshot().status, 'anonymous')
  assert.equal(map.size, 0)
})

test('401 atrasado de outra sessão não encerra um login novo', async t => {
  const { session } = fixture()
  const fetch = t.mock.method(globalThis, 'fetch', async () => response(loginResult()))
  await session.login(user.email, 'test-password', 'colaborador')
  let resolve
  fetch.mock.mockImplementation(() => new Promise(done => { resolve = done }))
  const pending = session.request('/api/cursos')
  fetch.mock.mockImplementation(async () => response(loginResult(user, 'new.token.signature')))
  await session.login(user.email, 'test-password', 'colaborador')
  resolve(response({}, 401))
  await assert.rejects(pending, { status: 401 })
  assert.equal(session.getSnapshot().status, 'authenticated')
})

test('expiração por tempo remove sessão mesmo sem fazer requisição', async t => {
  const { session, advance, map } = fixture()
  t.mock.method(globalThis, 'fetch', async () => response(loginResult()))
  await session.login(user.email, 'test-password', 'colaborador')
  advance(3600001)
  session.expireIfNeeded()
  assert.equal(session.getSnapshot().expired, true)
  assert.equal(map.size, 0)
})

test('armazenamento indisponível mantém sessão somente em memória', async t => {
  const session = createAuthSession(() => { throw new Error('storage blocked') })
  t.mock.method(globalThis, 'fetch', async () => response(loginResult()))
  await session.login(user.email, 'test-password', 'colaborador')
  assert.equal(session.getSnapshot().status, 'authenticated')
  session.logout()
  assert.equal(session.getSnapshot().status, 'anonymous')
})
