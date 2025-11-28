
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Conversation } from './chatService';
import { createMessageNotification } from '@/ai/flows/ai-create-message-notification';

/**
 * Fetches all chat conversations for a specific doctor.
 */
export async function getConversationsForDoctor(doctorId: string): Promise<Conversation[]> {
  if (!doctorId) {
    console.error('Doctor ID is required.');
    return [];
  }
  try {
    const chatsCol = collection(db, 'chats');
    // Query without server-side ordering to avoid needing a composite index
    const q = query(chatsCol, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);

    const conversations = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const lastMessageTimestamp = data.lastMessageTimestamp as Timestamp | undefined;
      
      return {
        id: docSnap.id,
        ...data,
        patientAvatar: `https://picsum.photos/seed/${data.patientId}/100/100`,
        lastMessageTimestamp: lastMessageTimestamp ? lastMessageTimestamp.toDate() : new Date(0), // Use epoch for unsent
      } as Conversation;
    });

    // Sort the conversations in the application code
    conversations.sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
    
    return conversations;

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

/**
 * Sends a new message in a conversation.
 */
export async function sendMessage(chatId: string, message: { text: string; senderId: string }) {
  if (!chatId || !message.text || !message.senderId) {
    console.error('Chat ID, message text, and sender ID are required.');
    return;
  }
  try {
    const chatDocRef = doc(db, 'chats', chatId);
    const chatDocSnap = await getDoc(chatDocRef);
    if (!chatDocSnap.exists()) {
        console.error('Chat document not found');
        return;
    }
    const chatData = chatDocSnap.data();

    // 1. Add the new message to the 'messages' subcollection
    const messagesCol = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCol, {
      ...message,
      timestamp: serverTimestamp(),
    });

    // 2. Update the last message info in the parent chat document
    await updateDoc(chatDocRef, {
      lastMessageText: message.text,
      lastMessageTimestamp: serverTimestamp(),
    });

    // NOTE: The notification for patient messages is now handled by a Firebase Function.
    // This ensures notifications are sent even if the message comes from outside this app.
    // A notification for a doctor's own message might be redundant, so we don't send one here.

  } catch (error) {
    console.error('Error sending message:', error);
  }
}
