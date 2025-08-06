'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Image from 'next/image'
import {
  Search,
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile
} from 'lucide-react'
import { useMessages, usePatients } from '@/hooks/useApi'

export default function Messages() {
  const { user, userProfile } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { patients } = usePatients(user?.uid)
  const { messages: chatMessages, sendMessage } = useMessages(user?.uid || '', selectedConversation || undefined)

  // Get conversations from patients
  const conversations = patients.map(patient => ({
    id: patient.id,
    patient: {
      id: patient.id,
      name: patient.name,
      avatar: `https://ui-avatars.com/api/?name=${patient.name}`,
      lastSeen: 'Active'
    },
    lastMessage: {
      content: 'Start a conversation',
      timestamp: '',
      isRead: true
    },
    unread: 0
  }))

  const selectedPatient = patients.find(p => p.id === selectedConversation)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    try {
      await sendMessage({
        senderId: user.uid,
        receiverId: selectedConversation,
        senderName: userProfile?.name || 'Doctor',
        senderType: 'doctor',
        content: newMessage.trim(),
        type: 'text'
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute allowedUserTypes={['doctor']}>
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-0 md:pl-56 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 divide-x divide-gray-200 h-[calc(100vh-120px)]">
              {/* Conversations List */}
              <div className="col-span-4 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a]"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 flex items-start gap-4 hover:bg-gray-50 ${
                        selectedConversation === conv.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <Image
                          src={conv.patient.avatar}
                          alt={conv.patient.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conv.patient.name}</h3>
                          <span className="text-xs text-gray-500">
                            {conv.lastMessage.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="px-2 py-1 text-xs bg-[#1a2f1a] text-white rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-8 flex flex-col">
                {selectedPatient ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image
                          src={`https://ui-avatars.com/api/?name=${selectedPatient.name}`}
                          alt={selectedPatient.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <h2 className="font-medium">
                            {selectedPatient.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Active
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === 'doctor' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderType === 'doctor'
                                ? 'bg-[#1a2f1a] text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderType === 'doctor'
                                  ? 'text-gray-300'
                                  : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-end gap-4">
                        <div className="flex-1 bg-gray-100 rounded-lg p-2">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-transparent resize-none focus:outline-none"
                            rows={1}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                            <Paperclip className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                            <Smile className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleSendMessage}
                            className="p-2 bg-[#1a2f1a] text-white rounded-full hover:bg-[#2a4f2a]"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Select a conversation
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose a patient to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}