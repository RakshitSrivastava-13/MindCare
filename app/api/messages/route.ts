import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Message } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const conversationWith = searchParams.get('conversationWith')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let q: any

    if (conversationWith) {
      // Get messages between two specific users
      q = query(
        collection(db, 'messages'),
        where('senderId', 'in', [userId, conversationWith]),
        where('receiverId', 'in', [userId, conversationWith]),
        orderBy('createdAt', 'asc')
      )
    } else {
      // Get all messages for a user
      q = query(
        collection(db, 'messages'),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    const messages = querySnapshot.docs
      .map(doc => {
        const data = doc.data()
        if (!data) return null
        return {
          id: doc.id,
          ...data
        }
      })
      .filter(message => message !== null) as (Message & { id: string })[]

    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json()
    
    const message: Omit<Message, 'id'> = {
      ...messageData,
      isRead: false,
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'messages'), message)
    
    return NextResponse.json({ 
      success: true, 
      messageId: docRef.id,
      message: { id: docRef.id, ...message }
    })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
