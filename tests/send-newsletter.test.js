import { vi, describe, it, expect, beforeEach } from 'vitest'

// Note: vi.mock cannot intercept require() calls inside CJS handler files —
// that is a documented vitest limitation. These tests cover the validation
// and routing logic that executes before any email is sent.

import handler from '../api/send-newsletter.js'

function makeRes() {
  const res = { statusCode: 200, _body: null }
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => { res._body = data; return res }
  res.setHeader = () => {}
  res.end = (data) => { if (data) res._body = JSON.parse(data) }
  Object.defineProperty(res, 'headersSent', { get: () => false })
  return res
}

describe('POST /api/send-newsletter — validation', () => {
  beforeEach(() => {
    process.env.NOTIFICATION_EMAIL = 'admin@test.com'
    process.env.BREVO_FROM_EMAIL = 'noreply@test.com'
    delete process.env.BREVO_API_KEY
    delete process.env.BREVO_HALL_LIST_ID
    delete process.env.BREVO_CHURCHES_LIST_ID
  })

  it('returns 405 for non-POST requests', async () => {
    const res = makeRes()
    await handler({ method: 'GET', body: {} }, res)
    expect(res.statusCode).toBe(405)
    expect(res._body).toMatchObject({ error: 'Method not allowed' })
  })

  it('returns 400 when email is missing', async () => {
    const res = makeRes()
    await handler({ method: 'POST', body: { name: 'Alice' } }, res)
    expect(res.statusCode).toBe(400)
    expect(res._body).toMatchObject({ error: 'Email is required' })
  })
})
