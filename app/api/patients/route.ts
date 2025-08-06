import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Patient } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    if (doctorId) {
      // Get patients for this doctor based on confirmed appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('status', '==', 'confirmed')
      )
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery)
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      // Get unique patients from confirmed appointments
      const uniquePatients = new Map()
      
      for (const appointment of appointments) {
        if (!uniquePatients.has(appointment.patientId)) {
          // Try to get patient details from patients collection
          let patientDetails: any = null
          try {
            const patientQuery = query(
              collection(db, 'patients'),
              where('id', '==', appointment.patientId)
            )
            const patientSnapshot = await getDocs(patientQuery)
            if (!patientSnapshot.empty) {
              patientDetails = { id: patientSnapshot.docs[0].id, ...patientSnapshot.docs[0].data() }
            }
          } catch (error) {
            console.log('Patient details not found in patients collection for:', appointment.patientId)
          }

          // Create patient object from appointment data and any found patient details
          const patient = {
            id: appointment.patientId,
            name: patientDetails?.name || appointment.patientName,
            email: patientDetails?.email || appointment.patientName,
            age: patientDetails?.age || 25,
            gender: patientDetails?.gender || 'Not specified',
            doctorId: appointment.doctorId,
            primaryDiagnosis: patientDetails?.primaryDiagnosis || 'Not specified',
            emergencyContact: patientDetails?.emergencyContact || {
              name: '',
              phone: '',
              relationship: ''
            },
            lastAppointment: appointment.date,
            appointmentType: appointment.type,
            createdAt: appointment.createdAt || new Date(),
            totalAppointments: appointments.filter(apt => apt.patientId === appointment.patientId).length,
            status: 'stable' // Default status, can be updated based on logic
          }
          
          uniquePatients.set(appointment.patientId, patient)
        }
      }

      let patients = Array.from(uniquePatients.values())

      // Client-side filtering for search and status
      if (search) {
        patients = patients.filter(patient => 
          patient.name?.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (status && status !== 'all') {
        patients = patients.filter(patient => 
          patient.status?.toLowerCase() === status.toLowerCase()
        )
      }

      return NextResponse.json({ success: true, patients })
    } else {
      // Original logic for getting all patients
      let q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      let patients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (Patient & { id: string })[]

      // Client-side filtering for search and status
      if (search) {
        patients = patients.filter(patient => 
          patient.name?.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (status && status !== 'all') {
        patients = patients.filter(patient => 
          (patient as any).status?.toLowerCase() === status.toLowerCase()
        )
      }

      return NextResponse.json({ success: true, patients })
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const patientData = await request.json()
    
    const patient: Omit<Patient, 'id'> = {
      ...patientData,
      userType: 'patient',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'patients'), patient)
    
    return NextResponse.json({ 
      success: true, 
      patientId: docRef.id,
      patient: { id: docRef.id, ...patient }
    })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}
