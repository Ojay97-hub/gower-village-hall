import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminRoute } from '../src/components/AdminRoute'
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

function setup(requiredRole?: string) {
  return render(
    <MemoryRouter initialEntries={['/admin/blog']}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route element={<AdminRoute requiredRole={requiredRole} />}>
          <Route path="/admin/blog" element={<div>Protected Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin/login when the user is not authenticated', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isAdmin: false }))
    setup('blog')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('shows a loading skeleton while auth is resolving', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isLoading: true }))
    const { container } = setup('blog')
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows Access Denied when the user lacks the required role', () => {
    mockUseAuth.mockReturnValue(
      baseAuth({ isAdmin: true, hasRole: vi.fn(() => false) })
    )
    setup('blog')
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
  })

  it('renders the protected page when the user has the required role', () => {
    mockUseAuth.mockReturnValue(
      baseAuth({ isAdmin: true, hasRole: vi.fn(() => true) })
    )
    setup('blog')
    expect(screen.getByText('Protected Page')).toBeInTheDocument()
  })

  it('renders the protected page when no specific role is required', () => {
    mockUseAuth.mockReturnValue(baseAuth({ isAdmin: true }))
    setup(undefined)
    expect(screen.getByText('Protected Page')).toBeInTheDocument()
  })
})
