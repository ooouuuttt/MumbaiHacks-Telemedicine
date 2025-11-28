
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Marks all unread notifications for a doctor as read.
 * @param doctorId The UID of the doctor.
 * @returns An object indicating success or failure.
 */
export async function markAllNotificationsAsRead(doctorId: string): Promise<{ success: boolean; error?: string }> {
  if (!doctorId) {
    return { success: false, error: 'Doctor ID is required.' };
  }

  try {
    const notificationsCol = collection(db, 'notifications');
    const q = query(
      notificationsCol,
      where('doctorId', '==', doctorId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: true }; // No unread notifications to mark
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log(`Marked ${querySnapshot.size} notifications as read for doctor ${doctorId}`);
    return { success: true };

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
