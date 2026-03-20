import React from 'react'
import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🚫</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403 - Forbidden</h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. 
          This area is restricted to administrators only.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
          >
            Login as Admin
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}
