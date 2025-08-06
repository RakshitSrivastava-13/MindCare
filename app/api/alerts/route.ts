import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Alert } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const isRead = searchParams.get('isRead')

    // Require either doctorId or patientId to prevent fetching all alerts
    if (!doctorId && !patientId) {
      return NextResponse.json({ 
        success: true, 
        alerts: [] 
      })
    }

    let q = query(collection(db, 'alerts'))

    if (doctorId) {
      q = query(collection(db, 'alerts'), where('doctorId', '==', doctorId))
    }

    if (patientId) {
      q = query(collection(db, 'alerts'), where('patientId', '==', patientId))
    }

    const querySnapshot = await getDocs(q)
    let alerts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Alert & { id: string })[]

    // Sort in memory instead of using orderBy in query
    alerts = alerts.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
      return bTime - aTime // descending order
    })

    if (isRead !== null && isRead !== undefined) {
      alerts = alerts.filter(alert => alert.isRead === (isRead === 'true'))
    }

    return NextResponse.json({ success: true, alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json()
    
    const alert: Omit<Alert, 'id'> = {
      ...alertData,
      isRead: false,
      createdAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'alerts'), alert)
    
    return NextResponse.json({ 
      success: true, 
      alertId: docRef.id,
      alert: { id: docRef.id, ...alert }
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
