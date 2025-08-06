import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

export function useFirestore<T = DocumentData>(collectionName: string) {
  const [documents, setDocuments] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const addDocument = async (data: Omit<T, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        userId: user?.uid
      })
      return docRef.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document')
      throw err
    }
  }

  const updateDocument = async (id: string, data: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document')
      throw err
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      throw err
    }
  }

  const getDocuments = async (constraints: QueryConstraint[] = []) => {
    try {
      setLoading(true)
      const q = query(collection(db, collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]
      setDocuments(docs)
      return docs
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const subscribeToDocuments = (constraints: QueryConstraint[] = []) => {
    try {
      setLoading(true)
      const q = query(collection(db, collectionName), ...constraints)
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[]
        setDocuments(docs)
        setLoading(false)
      })

      return unsubscribe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to documents')
      setLoading(false)
      throw err
    }
  }

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToDocuments
  }
}
