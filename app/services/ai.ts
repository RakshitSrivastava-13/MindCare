import OpenAI from 'openai'

// Fallback responses when API is not configured
const fallbackResponses = {
  anxiety: {
    text: "I understand that anxiety can be challenging. Let's explore some ways to help you feel more at ease.",
    options: [
      'Tell me about what triggers your anxiety',
      'Would you like to try a breathing exercise?',
      'Let\'s discuss coping strategies',
      'How long have you been feeling this way?'
    ]
  },
  depression: {
    text: "Thank you for sharing. It takes courage to talk about these feelings. I'm here to listen and support you.",
    options: [
      'Would you like to talk about what you\'re feeling?',
      'Let\'s explore activities that might help',
      'Have you considered professional support?',
      'What helps you feel better usually?'
    ]
  },
  sleep: {
    text: "Sleep difficulties can really affect our well-being. Let's work together to improve your sleep quality.",
    options: [
      'Would you like some relaxation techniques?',
      'Let\'s discuss your bedtime routine',
      'What keeps you awake at night?',
      'Have you tried sleep meditation?'
    ]
  },
  stress: {
    text: "I hear that you're feeling stressed. Let's break this down together and find ways to manage it.",
    options: [
      'What\'s causing you the most stress right now?',
      'Would you like to try a quick stress-relief exercise?',
      'Let\'s create a stress management plan',
      'How does this stress affect your daily life?'
    ]
  },
  general: {
    text: "I'm here to support you in whatever you'd like to discuss. Your well-being is important.",
    options: [
      'What\'s on your mind today?',
      'Would you like to explore specific concerns?',
      'How are you feeling right now?',
      'Let\'s talk about what brought you here'
    ]
  },
  greeting: {
    text: "Hello! I'm your mental health support companion. I'm here to listen and support you in a safe, confidential space.",
    options: [
      'I\'d like to discuss my feelings',
      'I need help with stress',
      'I\'m having trouble sleeping',
      'I\'m feeling anxious'
    ]
  },
  crisis: {
    text: "I hear that you're going through a really difficult time. Your safety and well-being are the top priority right now.",
    options: [
      'Would you like the number for a crisis helpline?',
      'Let\'s focus on immediate coping strategies',
      'Have you talked to a mental health professional?',
      'What support do you have available right now?'
    ]
  }
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are MindCare Assistant, an empathetic and professional mental health support chatbot. Your role is to:

1. Provide supportive, non-judgmental responses that show genuine understanding
2. Use evidence-based techniques from CBT, DBT, and mindfulness
3. Recognize signs of distress and respond appropriately
4. Maintain a warm, professional tone
5. Focus on emotional support and practical coping strategies

Response Guidelines:
- Keep responses concise (2-3 sentences max)
- Always provide 2-4 relevant follow-up options
- Use simple, clear language
- Validate emotions before offering suggestions
- Be specific in your responses to what the user shares

Crisis Detection:
If you detect any of these crisis indicators:
- Thoughts of self-harm or suicide
- Severe distress
- Feeling hopeless or trapped
- Violence or abuse

Immediately:
1. Express serious concern
2. Provide crisis hotline information
3. Encourage professional help
4. Focus on immediate safety

Example Response Format:
"[Empathetic acknowledgment of their situation]

Options:
1. [Relevant follow-up question]
2. [Coping strategy suggestion]
3. [Resource or support option]"

Remember: You're not providing medical advice or diagnosis, but rather emotional support and coping strategies.`

export class AIService {
  private openai: OpenAI | null = null
  private conversationHistory: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ]
  private isConfigured: boolean = false

  constructor() {
    // Try to initialize OpenAI if API key is available
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
    if (apiKey.length > 0) {
      this.openai = new OpenAI({ apiKey })
      this.isConfigured = true
    }
  }

  private async getChatCompletion(messages: Message[]) {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI API not configured')
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error getting chat completion:', error)
      throw error
    }
  }

  private getFallbackResponse(text: string): { text: string; category: string; options: string[] } {
    const lowercase = text.toLowerCase()
    
    // Check for crisis keywords first
    if (lowercase.includes('suicide') || 
        lowercase.includes('kill myself') || 
        lowercase.includes('end it all') ||
        lowercase.includes('self harm')) {
      return { ...fallbackResponses.crisis, category: 'crisis' }
    }
    
    // Check for greetings
    if (lowercase.includes('hi') || 
        lowercase.includes('hello') || 
        lowercase.includes('hey') ||
        text.length < 10) {
      return { ...fallbackResponses.greeting, category: 'greeting' }
    }
    
    if (lowercase.includes('anxiety') || 
        lowercase.includes('anxious') || 
        lowercase.includes('panic') ||
        lowercase.includes('worried')) {
      return { ...fallbackResponses.anxiety, category: 'anxiety' }
    }
    
    if (lowercase.includes('depress') || 
        lowercase.includes('sad') || 
        lowercase.includes('down') ||
        lowercase.includes('hopeless')) {
      return { ...fallbackResponses.depression, category: 'depression' }
    }
    
    if (lowercase.includes('sleep') || 
        lowercase.includes('insomnia') || 
        lowercase.includes('tired') ||
        lowercase.includes('rest')) {
      return { ...fallbackResponses.sleep, category: 'sleep' }
    }
    
    if (lowercase.includes('stress') || 
        lowercase.includes('overwhelm') || 
        lowercase.includes('pressure') ||
        lowercase.includes('too much')) {
      return { ...fallbackResponses.stress, category: 'stress' }
    }
    
    return { ...fallbackResponses.general, category: 'general' }
  }

  async getResponse(userMessage: string, context?: {
    category?: string
    assessmentScore?: number
    messageCount?: number
  }) {
    // Add context to the conversation
    if (context) {
      const contextPrompt = `Current conversation context:
- Topic: ${context.category || 'general'}
- Assessment level: ${context.assessmentScore ? this.getAssessmentLevel(context.assessmentScore) : 'initial'}
- Conversation depth: ${context.messageCount || 1} messages`

      this.conversationHistory.push({
        role: 'system',
        content: contextPrompt
      })
    }

    // Add user message
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    })

    try {
      if (!this.isConfigured) {
        // Use fallback responses when API is not configured
        const fallback = this.getFallbackResponse(userMessage)
        return fallback
      }

      // Get AI response
      const response = await this.getChatCompletion(this.conversationHistory)

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      })

      // Keep conversation history manageable
      if (this.conversationHistory.length > 20) {
        // Keep system prompt and last 10 messages
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-10)
        ]
      }

      return this.parseResponse(response)
    } catch (error) {
      console.error('Error in getResponse:', error)
      // Use fallback responses on error
      return this.getFallbackResponse(userMessage)
    }
  }

  private parseResponse(response: string) {
    // Default structure if parsing fails
    const defaultResult = {
      text: response,
      category: 'general' as const,
      options: ['Tell me more', 'Try something else', 'Get help']
    }

    try {
      // Try to extract options if response contains them
      const optionsMatch = response.match(/Options?:|Suggestions?:|Would you like to:?([\s\S]*?)(?=\n\n|$)/)
      
      if (optionsMatch) {
        const [fullMatch, optionsText] = optionsMatch
        const options = optionsText
          .split(/\d+\.|[-•*]/)
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0)

        const mainText = response.replace(fullMatch, '').trim()

        return {
          text: mainText,
          category: this.detectCategory(response),
          options: options.length > 0 ? options : defaultResult.options
        }
      }

      return defaultResult
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return defaultResult
    }
  }

  private detectCategory(text: string): 'general' | 'anxiety' | 'depression' | 'sleep' | 'stress' {
    const lowercase = text.toLowerCase()
    
    if (lowercase.includes('anxiety') || lowercase.includes('anxious') || lowercase.includes('panic')) {
      return 'anxiety'
    }
    if (lowercase.includes('depression') || lowercase.includes('depressed') || lowercase.includes('mood')) {
      return 'depression'
    }
    if (lowercase.includes('sleep') || lowercase.includes('insomnia') || lowercase.includes('rest')) {
      return 'sleep'
    }
    if (lowercase.includes('stress') || lowercase.includes('overwhelm') || lowercase.includes('pressure')) {
      return 'stress'
    }
    
    return 'general'
  }

  private getAssessmentLevel(score: number) {
    if (score > 8) return 'high concern'
    if (score > 4) return 'moderate concern'
    return 'low concern'
  }

  clearHistory() {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]
  }
}

export const aiService = new AIService() 