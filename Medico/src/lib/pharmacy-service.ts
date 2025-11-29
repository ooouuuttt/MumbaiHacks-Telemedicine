
'use client';

import {
  collection,
  query,
  getDocs,
  DocumentData,
  collectionGroup,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Medicine extends DocumentData {
    id: string;
    name: string;
    manufacturer: string;
    price: number;
    requiresPrescription: boolean;
    description: string;
    expiryDate: string;
    lowStockThreshold: number;
    quantity: number;
}

export interface Pharmacy extends DocumentData {
  id: string;
  pharmacyName: string;
  location: string;
  isOpen: boolean;
  timings: string;
  email: string;
  contactNumber?: string;
  kycUrl: string;
  licenseCertificateUrl: string;
  ownerName: string;
  stock?: Medicine[];
}

// Function to get all pharmacies with their stock
export const getPharmaciesWithStock = async (): Promise<Pharmacy[]> => {
  try {
    const pharmaciesQuery = query(collection(db, 'pharmacies'));
    const pharmacySnapshots = await getDocs(pharmaciesQuery);
    const pharmacies: Pharmacy[] = [];

    for (const doc of pharmacySnapshots.docs) {
      const pharmacyData = { id: doc.id, ...doc.data() } as Pharmacy;
      
      const stockQuery = query(collection(db, 'pharmacies', doc.id, 'stock'));
      const stockSnapshots = await getDocs(stockQuery);
      
      const stock: Medicine[] = [];
      stockSnapshots.forEach(stockDoc => {
          stock.push({ id: stockDoc.id, ...stockDoc.data() } as Medicine);
      });
      
      pharmacyData.stock = stock;
      pharmacies.push(pharmacyData);
    }
    
    return pharmacies;
  } catch (error) {
    console.error('Error fetching pharmacies with stock:', error);
    return [];
  }
};
