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
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notification-service';
import { getPatientName } from './user-service';
import { formatDoctorName } from './utils';

export interface Chat extends DocumentData {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  lastMessageText: string;
  lastMessageTimestamp: Timestamp;
  doctorAvatar?: string;
}

export interface Message extends DocumentData {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

// Function to get all chat conversations for a patient
export const getChats = (
  userId: string,
  callback: (chats: Chat[]) => void
): (() => void) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'chats'),
    where('patientId', '==', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      callback(chats);
    },
    (error) => {
      console.error('Error fetching chats:', error);
      callback([]);
    }
  );

  return unsubscribe;
};

// Function to get all chat conversations for a doctor
export const getChatsForDoctor = (
  doctorId: string,
  callback: (chats: Chat[]) => void
): (() => void) => {
  if (!doctorId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'chats'),
    where('doctorId', '==', doctorId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      callback(chats);
    },
    (error) => {
      console.error('Error fetching chats for doctor:', error);
      callback([]);
    }
  );

  return unsubscribe;
};


// Function to get messages for a specific chat
export const getMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    },
    (error) => {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      callback([]);
    }
  );

  return unsubscribe;
};

// Function to send a message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
): Promise<void> => {
  // Add message to subcollection
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });

  // Update the last message on the parent chat document
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);
  
  if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      await updateDoc(chatRef, {
        lastMessageText: text,
        lastMessageTimestamp: serverTimestamp(),
      });

      // If the sender is a doctor, notify the patient
      if (senderId === chatData.doctorId) {
          await createNotification(chatData.patientId, {
              title: `New message from ${formatDoctorName(chatData.doctorName)}`,
              description: text,
              type: 'appointment' // Re-using appointment icon
          })
      }
  }
};

// Function to create a new chat or get the ID if it exists
export const createOrGetChat = async (
    patientId: string,
    doctorId: string,
    patientName: string,
    doctorName: string,
    doctorAvatar?: string
): Promise<string> => {
    const chatId = `${patientId}_${doctorId}`;
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        // Create a new chat document
        await setDoc(chatRef, {
            patientId,
            doctorId,
            patientName,
            doctorName,
            lastMessageText: `Chat with ${formatDoctorName(doctorName)} started.`,
            lastMessageTimestamp: serverTimestamp(),
            doctorAvatar: doctorAvatar || '',
        });
    }

    return chatId;
};

export { updateDoc, doc };
