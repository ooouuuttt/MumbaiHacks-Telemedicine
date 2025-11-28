
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export type Conversation = {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  lastMessageText: string;
  lastMessageTimestamp: Date;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
};

/**
 * Listens for real-time messages in a conversation.
 */
export function listenToMessages(chatId: string, callback: (messages: Message[]) => void) {
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: (data.timestamp as Timestamp)?.toDate(),
      } as Message;
    });
    callback(messages);
  });

  return unsubscribe; // Return the unsubscribe function for cleanup
}
