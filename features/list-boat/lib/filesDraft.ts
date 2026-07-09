/**
 * Persistance des fichiers (photos + documents) via IndexedDB.
 * localStorage ne supporte pas les données binaires ; IndexedDB stocke
 * les ArrayBuffer nativement et peut gérer plusieurs Mo sans problème.
 */

const DB_NAME    = "sailingloc_draft_files";
const DB_VERSION = 1;
const STORE      = "files_v2";

interface StorableFile {
  name: string;
  type: string;
  data: ArrayBuffer;
}

interface StoredFiles {
  photos:      StorableFile[];
  carteGrise:  StorableFile | null;
  assurance:   StorableFile | null;
  certificat:  StorableFile | null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess       = () => resolve(req.result);
    req.onerror         = () => reject(req.error);
  });
}

async function toStorable(file: File): Promise<StorableFile> {
  return { name: file.name, type: file.type, data: await file.arrayBuffer() };
}

function fromStorable(s: StorableFile): File {
  return new File([s.data], s.name, { type: s.type });
}

/** Sauvegarde les fichiers dans IndexedDB (appelé au clic "Sauvegarder"). */
export async function saveFilesToDraft(params: {
  photos:     { file: File }[];
  carteGrise: File | null;
  assurance:  File | null;
  certificat: File | null;
}): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDB();
    const stored: StoredFiles = {
      photos:     await Promise.all(params.photos.map((p) => toStorable(p.file))),
      carteGrise: params.carteGrise ? await toStorable(params.carteGrise) : null,
      assurance:  params.assurance  ? await toStorable(params.assurance)  : null,
      certificat: params.certificat ? await toStorable(params.certificat) : null,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(stored, "draft");
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Quota dépassé ou IndexedDB non disponible → échec silencieux
  }
}

/** Restaure les fichiers depuis IndexedDB au chargement du formulaire. */
export async function loadFilesFromDraft(): Promise<{
  photos:     File[];
  carteGrise: File | null;
  assurance:  File | null;
  certificat: File | null;
} | null> {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  try {
    const db = await openDB();
    const stored = await new Promise<StoredFiles | undefined>((resolve, reject) => {
      const tx  = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get("draft");
      req.onsuccess = () => resolve(req.result as StoredFiles | undefined);
      req.onerror   = () => reject(req.error);
    });
    db.close();
    if (!stored) return null;
    return {
      photos:     stored.photos.map(fromStorable),
      carteGrise: stored.carteGrise ? fromStorable(stored.carteGrise) : null,
      assurance:  stored.assurance  ? fromStorable(stored.assurance)  : null,
      certificat: stored.certificat ? fromStorable(stored.certificat) : null,
    };
  } catch {
    return null;
  }
}

/** Supprime les fichiers du brouillon (après envoi ou effacement). */
export async function clearFilesDraft(): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete("draft");
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
    db.close();
  } catch {}
}
