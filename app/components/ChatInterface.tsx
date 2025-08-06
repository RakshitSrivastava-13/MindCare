'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Heart, Shield, Brain, Download, Trash2, ArrowLeft, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Navigation from './Navigation'
import { aiService } from '../services/ai'

// Prevent hydration issues by disabling SSR for the chat interface
const ChatInterface = dynamic(() => Promise.resolve(ChatInterfaceComponent), {
  ssr: false
})

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  liked?: boolean
  category?: 'general' | 'anxiety' | 'depression' | 'sleep' | 'stress'
  options?: string[]
  isFollowUp?: boolean
}

interface ChatContext {
  currentCategory?: Message['category']
  lastUserIntent?: string
  assessmentScore: number
  messageCount: number
  topicHistory: string[]
}

interface ChatInterfaceProps {
  onAssessmentComplete?: (result: any) => void
}

const initialMessages: Message[] = [
  { 
    id: '1', 
    sender: 'bot', 
    text: 'Hello! I am your MindCare assistant. I\'m here to provide a safe space for you to share your thoughts and feelings. How are you feeling today?', 
    timestamp: new Date(),
    category: 'general',
    options: [
      'I feel anxious and overwhelmed',
      'I\'m having trouble sleeping',
      'I feel sad most of the time',
      'I want to talk about stress',
      'I need help with my mental health',
      'I\'m looking for coping strategies'
    ]
  }
]

function ChatInterfaceComponent({ onAssessmentComplete }: ChatInterfaceProps) {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [context, setContext] = useState<ChatContext>({
    assessmentScore: 0,
    messageCount: 0,
    topicHistory: []
  })
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, mounted])

  const handleLikeMessage = (messageId: string) => {
    setMessages(msgs => msgs.map(msg => 
      msg.id === messageId ? { ...msg, liked: !msg.liked } : msg
    ))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || !mounted) return

    const userMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      sender: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages(msgs => [...msgs, userMsg])
    setInput('')
    setIsTyping(true)

    // Update context
    setContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1
    }))

    try {
      // Get AI response
      const aiResponse = await aiService.getResponse(text, {
        category: context.currentCategory,
        assessmentScore: context.assessmentScore,
        messageCount: context.messageCount
      })

      // Update context based on response
      const newAssessmentScore = context.assessmentScore + 
        (aiResponse.category === 'anxiety' || aiResponse.category === 'depression' ? 2 : 1)

      setContext(prev => ({
        ...prev,
        currentCategory: aiResponse.category as Message['category'],
        lastUserIntent: text,
        assessmentScore: newAssessmentScore,
        topicHistory: [...prev.topicHistory, text]
      }))

      const botMsg: Message = {
        id: (Date.now() + 1).toString() + Math.random().toString(36).slice(2),
        sender: 'bot',
        text: aiResponse.text,
        timestamp: new Date(),
        category: aiResponse.category as Message['category'],
        options: aiResponse.options
      }
      setMessages(msgs => [...msgs, botMsg])

      // Enhanced assessment logic
      if (context.messageCount >= 5) {
        const severity = context.assessmentScore > 8 ? 'high' : 
                        context.assessmentScore > 4 ? 'moderate' : 'low'
        
        const recommendations = [
          severity === 'high' ? 'Consider speaking with a mental health professional' : null,
          'Practice daily mindfulness or meditation',
          'Maintain a regular sleep schedule',
          'Engage in physical activity',
          context.currentCategory === 'anxiety' ? 'Try breathing exercises' : null,
          context.currentCategory === 'depression' ? 'Set small, achievable daily goals' : null
        ].filter(Boolean) as string[]

        onAssessmentComplete?.({
          severity,
          recommendations,
          urgency: severity === 'high' ? 'high' : 'medium',
          topicsDiscussed: context.topicHistory
        })
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString() + Math.random().toString(36).slice(2),
        sender: 'bot',
        text: 'I apologize, but I\'m having trouble processing your message right now. Could you please try again?',
        timestamp: new Date(),
        category: 'general',
        options: ['Try again', 'Start over', 'Get help']
      }
      setMessages(msgs => [...msgs, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const downloadChat = () => {
    if (!mounted) return
    const chatText = messages
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.sender === 'user' ? 'You' : 'Bot'}: ${msg.text}`)
      .join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindcare-chat-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    if (!mounted) return
    if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      setMessages(initialMessages)
      setContext({
        assessmentScore: 0,
        messageCount: 0,
        topicHistory: []
      })
      aiService.clearHistory()
    }
  }

  if (!mounted) {
    return null // Return null on server-side
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2f1a]">
      <Navigation />
      <div className="flex-1 flex flex-col pt-16">
        {/* Chat Container */}
        <div className="flex-1 flex justify-center px-6 pb-6">
          <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-16rem)]">
            {/* Chat Header */}
            <div className="bg-[#2d4a2d] rounded-t-lg p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1a2f1a] rounded-full p-2">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">MindCare Assistant</h2>
                    <p className="text-sm text-white/80">Your safe space for support and guidance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={downloadChat}
                    className="p-2 hover:bg-[#1a2f1a] rounded-lg transition-colors duration-200"
                    title="Download chat"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    onClick={clearChat}
                    className="p-2 hover:bg-[#1a2f1a] rounded-lg transition-colors duration-200"
                    title="Clear chat"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#1a2f1a] border-x border-[#2d4a2d]/20">
              <div className="p-6 space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                    >
                      {message.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-[#2d4a2d] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <div 
                          className={`max-w-[80%] ${
                            message.sender === 'user' 
                              ? 'bg-[#2d4a2d] text-white' 
                              : 'bg-[#2b362b] text-gray-100'
                          } rounded-2xl px-6 py-4 shadow-lg`}
                        >
                          <p className="text-base whitespace-pre-wrap">{message.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {message.sender === 'bot' && (
                              <button
                                onClick={() => handleLikeMessage(message.id)}
                                className={`p-1 rounded-full transition-colors duration-200 ${
                                  message.liked ? 'text-red-400' : 'text-gray-400 hover:text-gray-300'
                                }`}
                                aria-label={message.liked ? 'Unlike message' : 'Like message'}
                              >
                                <Heart className="w-4 h-4" fill={message.liked ? 'currentColor' : 'none'} />
                              </button>
                            )}
                          </div>
                        </div>
                        {message.sender === 'bot' && message.options && (
                          <div className="grid grid-cols-2 gap-2 max-w-[80%]">
                            {message.options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => sendMessage(option)}
                                className="text-sm bg-[#2b362b] text-gray-200 hover:bg-[#324632] 
                                         rounded-full px-4 py-2 transition-colors duration-200
                                         border border-[#2d4a2d]/20 hover:border-[#2d4a2d]/40
                                         text-left"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-[#2d4a2d] flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start items-end space-x-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#2d4a2d] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-[#2b362b] rounded-2xl px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#4a724a] rounded-full animate-bounce" 
                               style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-[#4a724a] rounded-full animate-bounce" 
                               style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-[#4a724a] rounded-full animate-bounce" 
                               style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-[#2d4a2d]/20 p-4 bg-[#1a2f1a] rounded-b-lg flex-shrink-0">
              <div className="relative max-w-full mx-auto">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full bg-[#2b362b] text-white placeholder-gray-400 
                           rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none 
                           focus:ring-2 focus:ring-[#4a724a] border border-[#2d4a2d]/20"
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white 
                           hover:bg-[#2d4a2d] rounded-lg transition-colors duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface 