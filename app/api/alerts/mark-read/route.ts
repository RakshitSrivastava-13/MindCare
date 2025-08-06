import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { doctorId, patientId, appointmentId } = await request.json()

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Find alerts related to this appointment
    let q = query(
      collection(db, 'alerts'),
      where('doctorId', '==', doctorId),
      where('type', '==', 'appointment'),
      where('isRead', '==', false)
    )

    if (patientId) {
      q = query(
        collection(db, 'alerts'),
        where('doctorId', '==', doctorId),
        where('patientId', '==', patientId),
        where('type', '==', 'appointment'),
        where('isRead', '==', false)
      )
    }

    const querySnapshot = await getDocs(q)
    
    // Update all matching alerts to mark as read
    const updatePromises = querySnapshot.docs.map(alertDoc => {
      const alertRef = doc(db, 'alerts', alertDoc.id)
      return updateDoc(alertRef, { isRead: true })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      success: true, 
      message: `Marked ${querySnapshot.docs.length} alerts as read` 
    })
  } catch (error) {
    console.error('Error marking alerts as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark alerts as read' },
      { status: 500 }
    )
  }
}
