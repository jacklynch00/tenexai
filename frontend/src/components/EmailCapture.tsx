'use client'

import { useState } from 'react'

interface EmailCaptureProps {
  onSubmit: (email?: string) => void
}

export default function EmailCapture({ onSubmit }: EmailCaptureProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email.trim() || undefined)
  }

  const handleSkip = () => {
    onSubmit()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Get Your Analysis Results
        </h2>
        <p className="text-gray-600">
          Enter your email to receive a copy of your AI opportunity analysis, or skip to view results now.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address (Optional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            {email.trim() ? 'Get Results & Email Copy' : 'Get Results'}
          </button>
          
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
          >
            Skip
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        We respect your privacy. Your email will only be used to send you this analysis report.
      </div>
    </div>
  )
}