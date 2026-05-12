import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminToolbar } from '../src/components/AdminToolbar'
import * as AuthContextModule from '../src/context/AuthContext'

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(AuthContextModule.useAuth)

function baseAuth(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    session: null,
    isAuthenticated: true,
    isAdmin: true,
    isMasterAdmin: false,
    isLoading: false,
    userEmail: 'admin@example.com',
    adminRoles: [],
    hasRole: vi.fn(() => false),
    isMasterAdminEmail: vi.fn(() => false),
    adminUsersList: [],
    fetchAdminUsers: vi.fn(),
    inviteAdminUser: vi.fn(),
    removeAdminUser: vi.fn(),
    updateAdminUserRoles: vi.fn(),
    promoteMasterAdmin: vi.fn(),
    demoteMasterAdmin: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    adminLogout: vi.fn(),
    switchUser: vi.fn(),
    ...overrides,
  } as any
}

function setup() {
  return render(
    <MemoryRouter>
      <AdminToolbar />
    </MemoryRouter>
  )
}

describe('AdminToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hides mailbox access for non-master admins', () => {
    mockUseAuth.mockReturnValue(
      baseAuth({
        adminRoles: ['blog'],
        hasRole: vi.fn((role: string) => role === 'blog'),
      })
    )

    setup()

    expect(screen.queryByRole('button', { name: /mailbox/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manage blog/i })).toBeInTheDocument()
  })

  it('shows mailbox access for master admins', () => {
    mockUseAuth.mockReturnValue(
      baseAuth({
        isMasterAdmin: true,
        hasRole: vi.fn(() => true),
      })
    )

    setup()

    expect(screen.getByRole('button', { name: /mailbox/i })).toBeInTheDocument()
  })
})
