import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Appointment } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const date = searchParams.get('date')

    let q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'))

    if (doctorId) {
      q = query(collection(db, 'appointments'), where('doctorId', '==', doctorId))
    }
    
    if (patientId) {
      q = query(collection(db, 'appointments'), where('patientId', '==', patientId))
    }

    if (date) {
      q = query(collection(db, 'appointments'), where('date', '==', date))
    }

    const querySnapshot = await getDocs(q)
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ success: true, appointments })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()
    
    const appointment: Omit<Appointment, 'id'> = {
      ...appointmentData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'appointments'), appointment)
    
    // Create alert for the doctor
    const alert = {
      doctorId: appointment.doctorId,
      message: `New appointment request from ${appointment.patientName}`,
      type: 'appointment',
      appointmentId: docRef.id,
      isRead: false,
      createdAt: new Date()
    }

    await addDoc(collection(db, 'alerts'), alert)
    
    return NextResponse.json({ 
      success: true, 
      appointmentId: docRef.id,
      appointment: { id: docRef.id, ...appointment }
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
