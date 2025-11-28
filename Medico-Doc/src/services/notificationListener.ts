
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';
import { collection, query, where, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore';

/**
 * Listens for real-time notifications for a specific doctor from Firestore.
 * This function is intended for client-side use.
 * @param doctorId The UID of the doctor.
 * @param callback The function to call with the new list of notifications.
 * @returns An unsubscribe function to stop listening to changes.
 */
export function listenToNotifications(doctorId: string, callback: (notifications: Notification[]) => void) {
  if (!doctorId) {
    console.error('Doctor ID is required to listen to notifications.');
    return () => {}; // Return a no-op unsubscribe function
  }

  const notificationsCol = collection(db, 'notifications');
  const q = query(
      notificationsCol, 
      where('doctorId', '==', doctorId), 
      orderBy('createdAt', 'desc'),
      limit(20) // Get the 20 most recent notifications
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        doctorId: data.doctorId,
        title: data.title,
        message: data.message,
        createdAt: (data.createdAt as Timestamp).toDate(),
        read: data.read,
      } as Notification;
    });
    callback(notifications);
  }, (error) => {
      console.error('Error listening to notifications:', error);
  });

  return unsubscribe;
}
