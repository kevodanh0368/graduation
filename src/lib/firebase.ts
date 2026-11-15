import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  DEFAULT_EVENT_SETTINGS,
  FIELD_LIMITS,
  type EventSettings,
  type Invitation,
  type PublicRsvp,
  type RsvpStatus,
} from '../types/invitation';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const PRIMARY_ADMIN_EMAIL = 'rt.cipher0368@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function checkIsAdminUser(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email === PRIMARY_ADMIN_EMAIL) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

function toDateOrNull(val: unknown): Date | null {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return null;
}

function clampString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function slugifyVietnameseId(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  const base = normalized || 'khach-moi';
  return `${base}-${suffix}`;
}

function mapInvitationDoc(id: string, data: Record<string, unknown>): Invitation {
  return {
    id,
    guestName: typeof data.guestName === 'string' ? data.guestName : '',
    salutation: typeof data.salutation === 'string' ? data.salutation : 'Thân mời bạn',
    groupLabel: typeof data.groupLabel === 'string' ? data.groupLabel : '',
    customTime: typeof data.customTime === 'string' ? data.customTime : DEFAULT_EVENT_SETTINGS.defaultTime,
    customVenue: typeof data.customVenue === 'string' ? data.customVenue : DEFAULT_EVENT_SETTINGS.defaultVenue,
    personalNote: typeof data.personalNote === 'string' ? data.personalNote : '',
    rsvpStatus:
      data.rsvpStatus === 'attending' || data.rsvpStatus === 'declined'
        ? data.rsvpStatus
        : 'pending',
    companionCount: typeof data.companionCount === 'number' ? data.companionCount : 0,
    guestMessage: typeof data.guestMessage === 'string' ? data.guestMessage : '',
    respondedAt: toDateOrNull(data.respondedAt),
    createdAt: toDateOrNull(data.createdAt),
    updatedAt: toDateOrNull(data.updatedAt),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
  };
}

function mapSettingsDoc(data: Record<string, unknown>): EventSettings {
  const rawSchedule = Array.isArray(data.scheduleItems) ? data.scheduleItems : [];
  const scheduleItems = rawSchedule
    .slice(0, FIELD_LIMITS.scheduleMaxItems)
    .map((item) => {
      const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        time: typeof obj.time === 'string' ? obj.time : '',
        title: typeof obj.title === 'string' ? obj.title : '',
        detail: typeof obj.detail === 'string' ? obj.detail : '',
      };
    })
    .filter((item) => item.time && item.title);

  return {
    eventTitle:
      typeof data.eventTitle === 'string' && data.eventTitle
        ? data.eventTitle
        : DEFAULT_EVENT_SETTINGS.eventTitle,
    classLabel:
      typeof data.classLabel === 'string' && data.classLabel
        ? data.classLabel
        : DEFAULT_EVENT_SETTINGS.classLabel,
    eventDate:
      typeof data.eventDate === 'string' && FIELD_LIMITS.eventDatePattern.test(data.eventDate)
        ? data.eventDate
        : DEFAULT_EVENT_SETTINGS.eventDate,
    defaultTime:
      typeof data.defaultTime === 'string' && data.defaultTime
        ? data.defaultTime
        : DEFAULT_EVENT_SETTINGS.defaultTime,
    defaultVenue:
      typeof data.defaultVenue === 'string' && data.defaultVenue
        ? data.defaultVenue
        : DEFAULT_EVENT_SETTINGS.defaultVenue,
    venueAddress:
      typeof data.venueAddress === 'string'
        ? data.venueAddress
        : DEFAULT_EVENT_SETTINGS.venueAddress,
    dressCode:
      typeof data.dressCode === 'string'
        ? data.dressCode
        : DEFAULT_EVENT_SETTINGS.dressCode,
    hostMessage:
      typeof data.hostMessage === 'string'
        ? data.hostMessage
        : DEFAULT_EVENT_SETTINGS.hostMessage,
    heroImageUrl: typeof data.heroImageUrl === 'string' ? data.heroImageUrl : '',
    secondaryImageUrl: typeof data.secondaryImageUrl === 'string' ? data.secondaryImageUrl : '',
    scheduleItems: scheduleItems.length > 0 ? scheduleItems : DEFAULT_EVENT_SETTINGS.scheduleItems,
  };
}

export function subscribeEventSettings(
  onData: (settings: EventSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = doc(db, 'eventSettings', 'main');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(mapSettingsDoc(snap.data()));
      } else {
        onData(DEFAULT_EVENT_SETTINGS);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function saveEventSettings(settings: EventSettings, uid: string): Promise<void> {
  const path = 'eventSettings/main';
  const sanitizedSchedule = settings.scheduleItems
    .slice(0, FIELD_LIMITS.scheduleMaxItems)
    .map((item) => ({
      time: clampString(item.time, FIELD_LIMITS.scheduleTime) || '08:00',
      title: clampString(item.title, FIELD_LIMITS.scheduleTitle) || 'Hoạt động',
      detail: clampString(item.detail, FIELD_LIMITS.scheduleDetail),
    }));

  const payload = {
    eventTitle: clampString(settings.eventTitle, FIELD_LIMITS.eventTitle) || DEFAULT_EVENT_SETTINGS.eventTitle,
    classLabel: clampString(settings.classLabel, FIELD_LIMITS.classLabel) || DEFAULT_EVENT_SETTINGS.classLabel,
    eventDate: FIELD_LIMITS.eventDatePattern.test(settings.eventDate)
      ? settings.eventDate
      : DEFAULT_EVENT_SETTINGS.eventDate,
    defaultTime: clampString(settings.defaultTime, FIELD_LIMITS.defaultTime) || DEFAULT_EVENT_SETTINGS.defaultTime,
    defaultVenue: clampString(settings.defaultVenue, FIELD_LIMITS.defaultVenue) || DEFAULT_EVENT_SETTINGS.defaultVenue,
    venueAddress: clampString(settings.venueAddress, FIELD_LIMITS.venueAddress),
    dressCode: clampString(settings.dressCode, FIELD_LIMITS.dressCode),
    hostMessage: clampString(settings.hostMessage, FIELD_LIMITS.hostMessage),
    heroImageUrl: clampString(settings.heroImageUrl || '', FIELD_LIMITS.imageUrl),
    secondaryImageUrl: clampString(settings.secondaryImageUrl || '', FIELD_LIMITS.imageUrl),
    scheduleItems: sanitizedSchedule,
    updatedAt: serverTimestamp(),
    updatedBy: uid.slice(0, 128),
  };

  try {
    await setDoc(doc(db, 'eventSettings', 'main'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeInvitationById(
  inviteId: string,
  onData: (invitation: Invitation | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!FIELD_LIMITS.idPattern.test(inviteId)) {
    onData(null);
    return () => {};
  }
  const path = `invitations/${inviteId}`;
  return onSnapshot(
    doc(db, 'invitations', inviteId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
      } else {
        onData(mapInvitationDoc(snap.id, snap.data()));
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export function subscribeAllInvitations(
  onData: (items: Invitation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'invitations';
  const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => mapInvitationDoc(d.id, d.data()));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export interface CreateInvitationInput {
  guestName: string;
  salutation: string;
  groupLabel: string;
  customTime: string;
  customVenue: string;
  personalNote: string;
}

export async function createInvitation(
  input: CreateInvitationInput,
  uid: string,
  customId?: string
): Promise<string> {
  const cleanCustomId = customId?.trim();
  if (cleanCustomId && !FIELD_LIMITS.idPattern.test(cleanCustomId)) {
    throw new Error('Đường dẫn riêng chỉ gồm chữ không dấu, số, dấu gạch ngang (-) hoặc gạch dưới (_).');
  }
  const id = cleanCustomId || slugifyVietnameseId(input.guestName);
  const path = `invitations/${id}`;

  const guestName = clampString(input.guestName, FIELD_LIMITS.guestName);
  if (!guestName) {
    throw new Error('Tên khách mời không được để trống.');
  }

  const payload = {
    guestName,
    salutation: clampString(input.salutation, FIELD_LIMITS.salutation) || 'Thân mời bạn',
    groupLabel: clampString(input.groupLabel, FIELD_LIMITS.groupLabel),
    customTime: clampString(input.customTime, FIELD_LIMITS.customTime) || DEFAULT_EVENT_SETTINGS.defaultTime,
    customVenue: clampString(input.customVenue, FIELD_LIMITS.customVenue),
    personalNote: clampString(input.personalNote, FIELD_LIMITS.personalNote),
    rsvpStatus: 'pending' as RsvpStatus,
    companionCount: 0,
    guestMessage: '',
    respondedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid.slice(0, 128),
  };

  try {
    if (cleanCustomId) {
      const existingSnap = await getDoc(doc(db, 'invitations', id));
      if (existingSnap.exists()) {
        throw new Error(`Đường dẫn /moi/${id} đã tồn tại. Vui lòng chọn tên đường dẫn khác.`);
      }
    }
    await setDoc(doc(db, 'invitations', id), payload);
    return id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('đã tồn tại')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export interface UpdateInvitationAdminInput {
  guestName: string;
  salutation: string;
  groupLabel: string;
  customTime: string;
  customVenue: string;
  personalNote: string;
  rsvpStatus: RsvpStatus;
  companionCount: number;
  guestMessage: string;
  preserveRespondedAt: boolean;
}

export async function updateInvitationAdmin(
  inviteId: string,
  input: UpdateInvitationAdminInput
): Promise<void> {
  const path = `invitations/${inviteId}`;
  const guestName = clampString(input.guestName, FIELD_LIMITS.guestName);
  if (!guestName) {
    throw new Error('Tên khách mời không được để trống.');
  }

  const boundedCompanions = Math.min(
    FIELD_LIMITS.companionMax,
    Math.max(FIELD_LIMITS.companionMin, Math.trunc(input.companionCount || 0))
  );

  const updates: Record<string, unknown> = {
    guestName,
    salutation: clampString(input.salutation, FIELD_LIMITS.salutation) || 'Thân mời bạn',
    groupLabel: clampString(input.groupLabel, FIELD_LIMITS.groupLabel),
    customTime: clampString(input.customTime, FIELD_LIMITS.customTime) || DEFAULT_EVENT_SETTINGS.defaultTime,
    customVenue: clampString(input.customVenue, FIELD_LIMITS.customVenue),
    personalNote: clampString(input.personalNote, FIELD_LIMITS.personalNote),
    rsvpStatus: input.rsvpStatus,
    companionCount: input.rsvpStatus === 'attending' ? boundedCompanions : 0,
    guestMessage: clampString(input.guestMessage, FIELD_LIMITS.guestMessage),
    updatedAt: serverTimestamp(),
  };

  if (input.rsvpStatus === 'pending') {
    updates.respondedAt = null;
  } else if (!input.preserveRespondedAt) {
    updates.respondedAt = serverTimestamp();
  }

  try {
    await updateDoc(doc(db, 'invitations', inviteId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInvitation(inviteId: string): Promise<void> {
  const path = `invitations/${inviteId}`;
  try {
    await deleteDoc(doc(db, 'invitations', inviteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitGuestRsvp(
  inviteId: string,
  rsvpStatus: 'attending' | 'declined',
  companionCount: number,
  guestMessage: string
): Promise<void> {
  const path = `invitations/${inviteId}`;
  const boundedCompanions =
    rsvpStatus === 'attending'
      ? Math.min(FIELD_LIMITS.companionMax, Math.max(FIELD_LIMITS.companionMin, Math.trunc(companionCount || 0)))
      : 0;

  try {
    await updateDoc(doc(db, 'invitations', inviteId), {
      rsvpStatus,
      companionCount: boundedCompanions,
      guestMessage: clampString(guestMessage, FIELD_LIMITS.guestMessage),
      respondedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitPublicRsvp(input: {
  guestName: string;
  groupLabel: string;
  rsvpStatus: 'attending' | 'declined';
  companionCount: number;
  guestMessage: string;
}): Promise<string> {
  const guestName = clampString(input.guestName, FIELD_LIMITS.guestName);
  if (!guestName) {
    throw new Error('Vui lòng nhập họ và tên của bạn.');
  }

  const id = slugifyVietnameseId(guestName);
  const path = `publicRsvps/${id}`;
  const boundedCompanions =
    input.rsvpStatus === 'attending'
      ? Math.min(
          FIELD_LIMITS.companionMax,
          Math.max(FIELD_LIMITS.companionMin, Math.trunc(input.companionCount || 0))
        )
      : 0;

  try {
    await setDoc(doc(db, 'publicRsvps', id), {
      guestName,
      groupLabel: clampString(input.groupLabel, FIELD_LIMITS.groupLabel) || 'Bạn bè',
      rsvpStatus: input.rsvpStatus,
      companionCount: boundedCompanions,
      guestMessage: clampString(input.guestMessage, FIELD_LIMITS.guestMessage),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribePublicRsvps(
  onData: (items: PublicRsvp[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'publicRsvps';
  const q = query(collection(db, 'publicRsvps'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          guestName: typeof data.guestName === 'string' ? data.guestName : '',
          groupLabel: typeof data.groupLabel === 'string' ? data.groupLabel : '',
          rsvpStatus: data.rsvpStatus === 'declined' ? 'declined' : 'attending',
          companionCount: typeof data.companionCount === 'number' ? data.companionCount : 0,
          guestMessage: typeof data.guestMessage === 'string' ? data.guestMessage : '',
          createdAt: toDateOrNull(data.createdAt),
        } satisfies PublicRsvp;
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function deletePublicRsvp(rsvpId: string): Promise<void> {
  const path = `publicRsvps/${rsvpId}`;
  try {
    await deleteDoc(doc(db, 'publicRsvps', rsvpId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
