import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  where,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "./firebase";

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
  likes?: number;
}

/** Add a new entry */
export async function addGuestbookEntry(name: string, message: string): Promise<GuestbookEntry> {
  const docRef = await addDoc(collection(db, "guestbook"), {
    name: name.trim(),
    message: message.trim(),
    timestamp: Timestamp.now(),
    likes: 0
  });
  
  return {
    id: docRef.id,
    name: name.trim(),
    message: message.trim(),
    timestamp: new Date(),
    likes: 0
  };
}

/** Fetch entries, newest first */
export async function getGuestbookEntries(limitCount = 100): Promise<GuestbookEntry[]> {
  const q = query(
    collection(db, "guestbook"),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date()
  })) as GuestbookEntry[];
}

/** Get today's entries count */
export async function getTodaysEntriesCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const q = query(
    collection(db, "guestbook"),
    where("timestamp", ">=", Timestamp.fromDate(today)),
    where("timestamp", "<", Timestamp.fromDate(tomorrow))
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/** Get total entries count */
export async function getTotalEntriesCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, "guestbook"));
  return snapshot.size;
}

/** Get total characters across all messages */
export async function getTotalCharactersCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, "guestbook"));
  return snapshot.docs.reduce((acc, doc) => acc + (doc.data().message?.length || 0), 0);
}

/** Delete an entry (admin only) */
export async function deleteGuestbookEntry(entryId: string, adminKey: string): Promise<boolean> {
  const VALID_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_DELETE_KEY || "alu-admin-2026";
  
  if (adminKey !== VALID_ADMIN_KEY) {
    throw new Error("Unauthorized: Invalid admin key");
  }
  
  await deleteDoc(doc(db, "guestbook", entryId));
  return true;
}
