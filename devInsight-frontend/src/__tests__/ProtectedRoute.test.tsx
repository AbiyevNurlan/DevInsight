import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import api from '../services/api'

// ===== TEST 2: Dashboard route guard — login olmadan redirect =====
describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('redirects to /login when no token exists', async () => {
    ;(api.getToken as jest.Mock).mockReturnValue(null)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN', 'HR']}>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  test('shows content when user is authenticated with correct role', async () => {
    ;(api.getToken as jest.Mock).mockReturnValue('valid-jwt-token')
    ;(api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: { role: 'CANDIDATE' } }
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN', 'HR']}>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    })
  })

  test('redirects to /forbidden when user role is not allowed', async () => {
    ;(api.getToken as jest.Mock).mockReturnValue('valid-jwt-token')
    ;(api.get as jest.Mock).mockResolvedValueOnce({
      data: { data: { role: 'CANDIDATE' } }
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Panel</div>
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<div>Forbidden Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Forbidden Page')).toBeInTheDocument()
    })

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
  })
})
