"use client"

import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { aiService } from '../services/ai'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  options?: string[]
}

export default function ChatPage() {
  const { user, userProfile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Add initial welcome message when component mounts
  useEffect(() => {
    const showWelcomeMessage = async () => {
      try {
        const response = await aiService.getResponse('hello', {
          messageCount: 0,
          category: 'greeting'
        })

        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: "Hi! How are you feeling today? I'm here to listen and support you.",
          sender: 'ai',
          timestamp: new Date(),
          options: [
            "I'd like to talk about how I'm feeling",
            "I'm looking for coping strategies",
            "I need help with something specific",
            "I'm just here to explore"
          ]
        }

        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Error showing welcome message:', error)
      }
    }

    if (messages.length === 0) {
      showWelcomeMessage()
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await aiService.getResponse(userMessage.text, {
        messageCount: messages.length + 1
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
        options: response.options
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionClick = (option: string) => {
    setInputMessage(option)
  }

  return (
    <ProtectedRoute allowedUserTypes={['patient', 'doctor']}>
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <div className="bg-[#1a2f1a] py-4 px-6">
            <h1 className="text-2xl font-semibold text-white">Mental Health Support Chat</h1>
            <p className="text-sm text-white/80">Welcome {userProfile?.name}, your safe space for conversation</p>
          </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#faf6f1]">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-[#1a2f1a] text-white'
                      : 'bg-[#e6dfd6] text-gray-800'
                  }`}
                >
                  <p className="text-base">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  
                  {/* Suggested Responses */}
                  {message.sender === 'ai' && message.options && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 
                            ${message.sender === 'user'
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-[#1a2f1a] text-white hover:bg-[#2a4f2a]'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a2f1a] focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a4f2a]'
                } bg-[#1a2f1a] text-white p-3 rounded-full transition-colors duration-200`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
} 