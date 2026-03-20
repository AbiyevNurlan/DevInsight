import React from 'react'
import ProtectedRoute from './ProtectedRoute'

interface HRRouteProps {
  children: React.ReactNode
}

const HRRoute: React.FC<HRRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['HR', 'ADMIN', 'RECRUITER', 'INTERVIEWER']}>
      {children}
    </ProtectedRoute>
  )
}

export default HRRoute
