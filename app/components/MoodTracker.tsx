'use client'

import React, { useState } from 'react'
import { useMoodEntries } from '@/hooks/useApi'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Smile, Frown, Meh } from 'lucide-react'

interface MoodTrackerProps {
  onMoodSubmit?: () => void
}

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
  { value: 2, emoji: '😟', label: 'Sad', color: 'text-red-400' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-400' },
  { value: 5, emoji: '😊', label: 'Great', color: 'text-green-500' },
  { value: 6, emoji: '😄', label: 'Very Good', color: 'text-green-600' },
  { value: 7, emoji: '😁', label: 'Excellent', color: 'text-green-700' },
  { value: 8, emoji: '🤗', label: 'Amazing', color: 'text-blue-500' },
  { value: 9, emoji: '🥰', label: 'Fantastic', color: 'text-purple-500' },
  { value: 10, emoji: '🤩', label: 'Perfect', color: 'text-purple-600' }
]

export default function MoodTracker({ onMoodSubmit }: MoodTrackerProps) {
  const { user } = useAuth()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [factors, setFactors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { addMoodEntry } = useMoodEntries(user?.uid || '')

  const handleFactorToggle = (factor: string) => {
    setFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  const handleSubmit = async () => {
    if (!selectedMood || !user) return

    try {
      setIsSubmitting(true)
      await addMoodEntry({
        patientId: user.uid,
        date: new Date().toISOString().split('T')[0],
        value: selectedMood,
        notes: notes.trim() || undefined,
        factors: factors.length > 0 ? factors : undefined
      })

      // Reset form
      setSelectedMood(null)
      setNotes('')
      setFactors([])
      
      if (onMoodSubmit) {
        onMoodSubmit()
      }
    } catch (error) {
      console.error('Error submitting mood entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const commonFactors = [
    'Sleep', 'Exercise', 'Work', 'Relationships', 'Weather', 
    'Medication', 'Social Media', 'News', 'Family', 'Health'
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-[#1a2f1a]" />
        <h2 className="text-xl font-semibold">Daily Mood Check-in</h2>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">How are you feeling today?</h3>
        <div className="grid grid-cols-5 gap-3">
          {moodEmojis.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMood === mood.value
                  ? 'border-[#1a2f1a] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className="text-xs text-gray-600">{mood.label}</div>
              <div className="text-xs font-medium">{mood.value}/10</div>
            </button>
          ))}
        </div>
      </div>

      {/* Factors */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">What influenced your mood?</h3>
        <div className="flex flex-wrap gap-2">
          {commonFactors.map((factor) => (
            <button
              key={factor}
              onClick={() => handleFactorToggle(factor)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                factors.includes(factor)
                  ? 'bg-[#1a2f1a] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {factor}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Additional notes (optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us more about your day..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a2f1a] focus:border-[#1a2f1a] resize-none"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedMood || isSubmitting}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          selectedMood && !isSubmitting
            ? 'bg-[#1a2f1a] text-white hover:bg-[#2a4f2a]'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Mood Entry'}
      </button>
    </div>
  )
}
