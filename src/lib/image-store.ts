"use client";

import { GeneratedImage } from "@/types";

const DB_NAME = "criativos-ai-db";
const DB_VERSION = 1;
const STORE_NAME = "creatives";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCreatives(images: GeneratedImage[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  for (const img of images) {
    store.put(img);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadCreatives(): Promise<GeneratedImage[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateCreative(image: GeneratedImage): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(image);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCreatives(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Migrate from localStorage to IndexedDB (one-time)
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem("criativos-ai-generated");
  if (!raw) return;
  try {
    const images: GeneratedImage[] = JSON.parse(raw);
    if (images.length > 0) {
      await saveCreatives(images);
      localStorage.removeItem("criativos-ai-generated");
    }
  } catch {
    localStorage.removeItem("criativos-ai-generated");
  }
}
