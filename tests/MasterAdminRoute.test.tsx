import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { MasterAdminRoute } from '../src/components/MasterAdminRoute'
import * as AuthContextModule from '../src/context/AuthContext'

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(AuthContextModule.useAuth)

function baseAuth(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    session: null,
    isAuthenticated: false,
    isAdmin: false,
    isMasterAdmin: false,
    isLoading: false,
    userEmail: null,
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
    <MemoryRouter initialEntries={['/admin/users']}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route element={<MasterAdminRoute />}>
          <Route path="/admin/users" element={<div>Users Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('MasterAdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin/login when the user is not a master admin', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isMasterAdmin: false }))
    setup()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('shows a loading skeleton while auth is resolving', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isLoading: true }))
    const { container } = setup()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders the protected page for a master admin', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isMasterAdmin: true }))
    setup()
    expect(screen.getByText('Users Page')).toBeInTheDocument()
  })
})
