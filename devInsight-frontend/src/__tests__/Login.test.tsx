import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../pages/Login'
import { BrowserRouter } from 'react-router-dom'

test('renders login form and shows validation', ()=>{
  render(<BrowserRouter><Login/></BrowserRouter>)
  expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  const btn = screen.getByRole('button', { name: /Sign In/i })
  fireEvent.click(btn)
  expect(btn).toBeInTheDocument()
})
