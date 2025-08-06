'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle
} from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const isActive = (path: string) => pathname?.startsWith(path)
  const isLandingPage = pathname === '/'

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const doctorNavItems = [
    {
      name: 'Dashboard',
      href: '/doctor/dashboard',
      icon: Home
    },
    {
      name: 'Patients',
      href: '/doctor/patients',
      icon: Users
    },
    {
      name: 'Appointments',
      href: '/doctor/appointments',
      icon: Calendar
    },
    {
      name: 'Messages',
      href: '/doctor/messages',
      icon: MessageSquare
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: MessageCircle
    }
  ]

  const patientNavItems = [
    {
      name: 'Dashboard',
      href: '/patient/dashboard',
      icon: Home
    },
    {
      name: 'Appointments',
      href: '/patient/appointments',
      icon: Calendar
    },
    {
      name: 'Messages',
      href: '/patient/messages',
      icon: MessageSquare
    },
    {
      name: 'AI Chat',
      href: '/chat',
      icon: MessageCircle
    }
  ]

  const navItems = userProfile?.userType === 'doctor' ? doctorNavItems : patientNavItems

  // Landing page navigation
  if (isLandingPage) {
    return (
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-serif text-white">
              MindCare
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auth" className="text-white hover:text-gray-300">
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/auth"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Don't show navigation on auth page
  if (pathname === '/auth') return null

  // Don't show navigation if not authenticated
  if (!user || !userProfile) return null

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden z-50">
        <Link href="/" className="text-2xl font-serif text-[#1a2f1a]">
          MindCare
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-16 md:hidden">
          <nav className="p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 ${
                    isActive(item.href)
                      ? 'bg-[#1a2f1a] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <Link
                href="/settings"
                className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 ${
                  isActive('/settings')
                    ? 'bg-[#1a2f1a] text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-56 lg:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <Link href="/" className="text-2xl font-serif text-[#1a2f1a]">
                MindCare
              </Link>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg ${
                      isActive(item.href)
                        ? 'bg-[#1a2f1a] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4">
            <Link
              href="/settings"
              className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 ${
                isActive('/settings')
                  ? 'bg-[#1a2f1a] text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 