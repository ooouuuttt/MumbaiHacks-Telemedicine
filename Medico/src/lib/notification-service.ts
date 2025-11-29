'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  DocumentData,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification extends DocumentData {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'appointment' | 'medicine' | 'alert' | 'news' | 'trends';
  createdAt: Timestamp;
  isRead: boolean;
  url?: string;
}

// Function to create a new notification
export const createNotification = async (userId: string, data: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'userId'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...data,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};


export const getNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const notifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      callback(notifications);
    },
    (error) => {
      console.error('Error fetching notifications:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
