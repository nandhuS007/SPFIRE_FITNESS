import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  limit
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Activity } from '../types';

const ACTIVITIES_COLLECTION = 'activities';

export const activityService = {
  async addActivity(activity: Activity): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), activity);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, ACTIVITIES_COLLECTION);
      return '';
    }
  },

  async getActivities(userId: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ACTIVITIES_COLLECTION);
      return [];
    }
  },

  async getActivity(activityId: string): Promise<Activity | null> {
    try {
      const docRef = doc(db, ACTIVITIES_COLLECTION, activityId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Activity;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ACTIVITIES_COLLECTION}/${activityId}`);
      return null;
    }
  },

  async getRecentActivities(userId: string, count: number = 5): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ACTIVITIES_COLLECTION);
      return [];
    }
  }
};
