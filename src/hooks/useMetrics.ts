import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { User } from "firebase/auth";

export interface Metric {
  id: string;
  userId: string;
  weight: number;
  waist?: number;
  height?: number;
  bmi?: number;
  note?: string;
  date: string;
  timestamp: any;
}

export interface UserProfile {
  userId: string;
  height?: number;
  targetWeight?: number;
  nickname?: string;
  slogan?: string;
  targetDate?: string;
  targetEvent?: string;
  updatedAt: any;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage Keys
const LS_PROFILE_KEY = "betteryou_profile";
const LS_METRICS_KEY = "betteryou_metrics";

export function useMetrics(user: User | null, isGuest: boolean) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state when working locally
  const saveLocalProfile = (p: Partial<UserProfile>) => {
    const newProfile = {
      ...profile,
      ...p,
      userId: "local",
      updatedAt: new Date().toISOString(),
    } as UserProfile;
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const saveLocalMetrics = (m: Metric[]) => {
    localStorage.setItem(LS_METRICS_KEY, JSON.stringify(m));
    setMetrics(m);
  };

  useEffect(() => {
    if (isGuest && !user) {
      // Local Storage Mode
      const storedProfile = localStorage.getItem(LS_PROFILE_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        const initialProfile: UserProfile = {
          userId: "local",
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(initialProfile));
        setProfile(initialProfile);
      }

      const storedMetrics = localStorage.getItem(LS_METRICS_KEY);
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      }
      setLoading(false);
      return;
    }

    if (!user && !isGuest) {
      setMetrics([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(true);
      const profilePath = `users/${user.uid}`;

      // Subscribe to profile
      const unsubProfile = onSnapshot(
        doc(db, "users", user.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile if missing
            setDoc(doc(db, "users", user.uid), {
              userId: user.uid,
              updatedAt: serverTimestamp(),
            }).catch((err) =>
              handleFirestoreError(err, OperationType.CREATE, profilePath),
            );
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, profilePath);
        },
      );

      const metricsPath = `users/${user.uid}/metrics`;
      const q = query(collection(db, metricsPath), orderBy("date", "asc"));

      const unsubMetrics = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Metric,
          );
          setMetrics(data);
          setLoading(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, metricsPath);
        },
      );

      return () => {
        unsubProfile();
        unsubMetrics();
      };
    }
  }, [user, isGuest]);

  const addMetric = async (
    weight: number,
    height?: number,
    waist?: number,
    dateStr?: string,
    note?: string,
  ) => {
    const date = dateStr || new Date().toISOString().split("T")[0];
    const metricId = date.replace(/-/g, ""); // unique ID per date

    let bmi;
    const finalHeight = height || profile?.height;
    if (finalHeight) {
      const heightInMeters = finalHeight / 100;
      bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    if (isGuest && !user) {
      const newMetric: Metric = {
        id: metricId,
        userId: "local",
        weight,
        date,
        waist,
        height: finalHeight,
        bmi,
        note,
        timestamp: new Date().toISOString(),
      };

      const updatedMetrics = [
        ...metrics.filter((m) => m.id !== metricId),
        newMetric,
      ].sort((a, b) => a.date.localeCompare(b.date));

      saveLocalMetrics(updatedMetrics);
      return;
    }

    if (user) {
      const data: any = {
        userId: user.uid,
        weight,
        date,
        timestamp: serverTimestamp(),
      };
      if (waist) data.waist = waist;
      if (finalHeight) data.height = finalHeight;
      if (bmi) data.bmi = bmi;
      if (note) data.note = note;

      const pathForWrite = `users/${user.uid}/metrics/${metricId}`;
      try {
        await setDoc(doc(db, "users", user.uid, "metrics", metricId), data);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }
  };

  const deleteMetric = async (metricId: string) => {
    if (isGuest && !user) {
      saveLocalMetrics(metrics.filter((m) => m.id !== metricId));
      return;
    }

    if (user) {
      const path = `users/${user.uid}/metrics/${metricId}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "metrics", metricId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isGuest && !user) {
      saveLocalProfile(updates);
      return;
    }

    if (user) {
      const pathForWrite = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            ...updates,
            userId: user.uid,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }
  };

  const importLocalData = (importedMetrics: Metric[], importedProfile: UserProfile) => {
    if (isGuest && !user) {
      if (importedMetrics) saveLocalMetrics(importedMetrics);
      if (importedProfile) saveLocalProfile(importedProfile);
    }
  };

  const clearData = async () => {
    if (isGuest && !user) {
      localStorage.removeItem(LS_METRICS_KEY);
      localStorage.removeItem(LS_PROFILE_KEY);
      setMetrics([]);
      setProfile(null);
      return;
    }

    if (user) {
      try {
        const metricsRef = collection(db, `users/${user.uid}/metrics`);
        const q = query(metricsRef);
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((document) =>
          deleteDoc(doc(db, `users/${user.uid}/metrics`, document.id)),
        );
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, "users", user.uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}`);
      }
    }
  };

  return {
    metrics,
    profile,
    loading,
    addMetric,
    deleteMetric,
    updateProfile,
    clearData,
    importLocalData,
  };
}
