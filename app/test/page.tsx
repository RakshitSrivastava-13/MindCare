'use client'

import React from 'react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p>If you can see this, Next.js is working!</p>
        <div className="mt-4 space-y-2">
          <a href="/doctor/dashboard" className="block text-blue-600 hover:underline">
            Go to Doctor Dashboard
          </a>
          <a href="/patient/dashboard" className="block text-blue-600 hover:underline">
            Go to Patient Dashboard
          </a>
          <a href="/auth" className="block text-blue-600 hover:underline">
            Go to Auth Page
          </a>
        </div>
      </div>
    </div>
  )
}
