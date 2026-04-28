import { describe, it, expect } from 'vitest'

function isMasterAdminEmail(
  email: string | null | undefined,
  masterEmailsEnv: string
): boolean {
  if (!email) return false
  const masterEmails = masterEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
  return masterEmails.includes(email.toLowerCase())
}

function hasRole(
  role: string,
  isMasterAdmin: boolean,
  adminRoles: string[]
): boolean {
  if (isMasterAdmin) return true
  return adminRoles.includes(role)
}

describe('isMasterAdminEmail', () => {
  const MASTER_EMAILS = 'admin@gower.com, super@gower.com'

  it('returns true for a known master-admin email', () => {
    expect(isMasterAdminEmail('admin@gower.com', MASTER_EMAILS)).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isMasterAdminEmail('ADMIN@GOWER.COM', MASTER_EMAILS)).toBe(true)
  })

  it('trims whitespace around email entries in the env variable', () => {
    expect(isMasterAdminEmail('super@gower.com', MASTER_EMAILS)).toBe(true)
  })

  it('returns false for an unrecognised email', () => {
    expect(isMasterAdminEmail('stranger@example.com', MASTER_EMAILS)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isMasterAdminEmail(null, MASTER_EMAILS)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isMasterAdminEmail(undefined, MASTER_EMAILS)).toBe(false)
  })

  it('returns false when the env variable is empty', () => {
    expect(isMasterAdminEmail('admin@gower.com', '')).toBe(false)
  })
})

describe('hasRole', () => {
  it('master admin bypasses all role checks', () => {
    expect(hasRole('blog', true, [])).toBe(true)
    expect(hasRole('bookings', true, [])).toBe(true)
    expect(hasRole('committee', true, [])).toBe(true)
    expect(hasRole('coffee_mornings', true, [])).toBe(true)
  })

  it('returns true when the user has the required role', () => {
    expect(hasRole('blog', false, ['blog', 'bookings'])).toBe(true)
  })

  it('returns false when the user lacks the required role', () => {
    expect(hasRole('committee', false, ['blog', 'bookings'])).toBe(false)
  })

  it('returns false with an empty role list and non-master admin', () => {
    expect(hasRole('blog', false, [])).toBe(false)
  })
})
