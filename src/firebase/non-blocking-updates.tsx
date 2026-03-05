'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  const operation = options && ('merge' in options || 'mergeFields' in options) ? 'update' : 'create';

  setDoc(docRef, data, options || {}).catch(async (error) => {
    if (error.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: operation as SecurityRuleContext['operation'],
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    } else {
      errorEmitter.emit('firestore-error', error);
    }
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  addDoc(colRef, data)
    .catch(async (error) => {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        errorEmitter.emit('firestore-error', error);
      }
    });
}

/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(async (error) => {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        errorEmitter.emit('firestore-error', error);
      }
    });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(async (error) => {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        errorEmitter.emit('firestore-error', error);
      }
    });
}
