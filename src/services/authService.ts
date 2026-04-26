import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export const authService = {
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, if not create it
      const profile = await this.getUserProfile(user.uid);
      if (!profile) {
        await this.createUserProfile(user);
      }
      return user;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  },

  async logout() {
    return signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
      return null;
    }
  },

  async createUserProfile(user: User) {
    const profile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      xp: 0,
      level: 1,
      streakCount: 0,
    };
    try {
      await setDoc(doc(db, USERS_COLLECTION, user.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, USERS_COLLECTION);
    }
  },

  async updateProfile(uid: string, data: Partial<UserProfile>) {
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
  },

  async addXp(uid: string, amount: number) {
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(docRef, {
        xp: increment(amount)
      });
      
      // Level up logic could be client side or server side
      // For this demo, let's just keep it simple
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
  }
};
