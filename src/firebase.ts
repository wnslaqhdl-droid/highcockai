import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'ai-studio-b7b91e32-3fac-43d0-834c-624d5a061174',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
