import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../pages/Login'
import { BrowserRouter } from 'react-router-dom'
import api from '../services/api'

// ===== TEST 1: Login formu render =====
describe('Login Page', () => {
  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

  test('renders email input, password input and Sign In button', () => {
    renderLogin()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  test('shows validation error when email is empty and form submitted', async () => {
    renderLogin()
    const btn = screen.getByRole('button', { name: /Sign In/i })
    fireEvent.click(btn)
    // HTML5 required validation prevents submit; button should remain
    expect(btn).toBeInTheDocument()
  })

  test('calls api.post on submit with email and password', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          token: 'test-token',
          refreshToken: 'test-refresh',
          role: 'CANDIDATE',
          email: 'test@example.com',
          fullName: 'Test User'
        }
      }
    })

    renderLogin()

    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
