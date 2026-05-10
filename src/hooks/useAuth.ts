import { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { INITIAL_BALANCE } from '../constants';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const today = new Date();
            let newStreak = data.streak || 0;
            let newStreakStartDate = data.streakStartDate || today.toISOString();
            
            if (data.lastSignIn) {
              const lastSignIn = new Date(data.lastSignIn);
              const lastDate = new Date(lastSignIn.getFullYear(), lastSignIn.getMonth(), lastSignIn.getDate());
              const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              const diffTime = currentDate.getTime() - lastDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
                newStreakStartDate = today.toISOString();
              }
            } else {
              newStreak = 1;
              newStreakStartDate = today.toISOString();
            }

            const updatedUser = {
              ...data,
              uid: firebaseUser.uid,
              email: firebaseUser.email || data.email || '',
              displayName: firebaseUser.displayName || data.displayName || 'Investor',
              streak: newStreak,
              streakStartDate: newStreakStartDate,
              lastSignIn: today.toISOString(),
              balance: data.balance ?? INITIAL_BALANCE,
              xp: data.xp ?? 0,
              completedLessons: data.completedLessons || [],
              unlockedGames: data.unlockedGames || [],
              petType: data.petType || 'bull',
              botType: data.botType || 'bear',
              photoURL: firebaseUser.photoURL || data.photoURL || '',
              level: data.level || 'beginner'
            };
            
            try {
              await updateDoc(userRef, { 
                uid: firebaseUser.uid,
                email: firebaseUser.email || data.email || '',
                displayName: firebaseUser.displayName || data.displayName || 'Investor',
                streak: newStreak, 
                streakStartDate: newStreakStartDate,
                lastSignIn: today.toISOString(),
                balance: data.balance ?? INITIAL_BALANCE,
                xp: data.xp ?? 0,
                completedLessons: data.completedLessons || [],
                unlockedGames: data.unlockedGames || [],
                petType: data.petType || 'bull',
                botType: data.botType || 'bear',
                photoURL: firebaseUser.photoURL || data.photoURL || '',
                level: data.level || 'beginner'
              });
            } catch (e) {
              console.warn("Silent failure updating user profile on login:", e);
            }
            setUser(updatedUser);
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Investor',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              streak: 1,
              streakStartDate: new Date().toISOString(),
              lastSignIn: new Date().toISOString(),
              balance: INITIAL_BALANCE,
              xp: 0,
              completedLessons: [],
              unlockedGames: [],
              petType: 'bull',
              botType: 'bear',
              level: 'beginner'
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (e) {
          console.error("Auth init error:", e);
          try {
            handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
          } catch (err) {
             // If handleFirestoreError throws, we still want to continue to onSnapshot if possible
             // or at least not crash the listener
          }
        }

        // Subscribe to real-time updates
        unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
          }
        }, (e) => {
          handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return { user, loading };
}
