'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'How does the chatbot work?',
    answer: 'Our AI-powered chatbot uses advanced natural language processing to understand your needs and provide relevant support and guidance. It\'s available 24/7 and can help with various mental health concerns.'
  },
  {
    question: 'Is my data confidential?',
    answer: 'Yes, we take privacy very seriously. All conversations are encrypted and stored securely. Your personal information is never shared without your explicit consent.'
  },
  {
    question: 'What if I need help?',
    answer: 'If you need immediate assistance, our support team is available 24/7. For emergencies, please contact your local emergency services or crisis hotline.'
  },
  {
    question: 'Can I use insurance?',
    answer: 'Yes, we accept most major insurance providers. Contact our support team to verify your coverage and learn about payment options.'
  },
  {
    question: 'How do I schedule an appointment?',
    answer: 'You can easily schedule an appointment through our platform. Simply navigate to the appointments page, select your preferred therapist, and choose an available time slot that works for you.'
  }
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif mb-12">FAQs</h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span className="text-lg font-medium">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {openIndex === index && (
              <div className="faq-answer animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ 