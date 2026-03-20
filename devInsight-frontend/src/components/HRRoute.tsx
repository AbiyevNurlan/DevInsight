import React from 'react'
import { Navigate } from 'react-router-dom'

interface HRRouteProps {
  children: React.ReactNode
}

const HRRoute: React.FC<HRRouteProps> = ({ children }) => {
  const token = localStorage.getItem('devinsight_jwt')
  const role = localStorage.getItem('devinsight_role')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Allow HR, ADMIN, RECRUITER, and INTERVIEWER roles
  const allowedRoles = ['HR', 'ADMIN', 'RECRUITER', 'INTERVIEWER']
  if (!allowedRoles.includes(role || '')) {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}

export default HRRoute
