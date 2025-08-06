import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ChatSession } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')

    let q = query(collection(db, 'chatSessions'), orderBy('updatedAt', 'desc'))

    if (patientId) {
      q = query(
        collection(db, 'chatSessions'),
        where('patientId', '==', patientId),
        orderBy('updatedAt', 'desc')
      )
    }

    if (doctorId) {
      q = query(
        collection(db, 'chatSessions'),
        where('doctorId', '==', doctorId),
        orderBy('updatedAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    const chatSessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ChatSession & { id: string })[]

    return NextResponse.json({ success: true, chatSessions })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    
    const chatSession: Omit<ChatSession, 'id'> = {
      ...sessionData,
      messages: sessionData.messages || [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'chatSessions'), chatSession)
    
    return NextResponse.json({ 
      success: true, 
      sessionId: docRef.id,
      chatSession: { id: docRef.id, ...chatSession }
    })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
