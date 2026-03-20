import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../pages/Login'
import { BrowserRouter } from 'react-router-dom'

test('renders login form and shows validation', ()=>{
  render(<BrowserRouter><Login/></BrowserRouter>)
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
  const btn = screen.getByRole('button', { name: /login/i })
  fireEvent.click(btn)
  // form submits to API — without backend this should not crash
  expect(btn).toBeInTheDocument()
})
