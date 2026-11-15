export type RsvpStatus = 'pending' | 'attending' | 'declined';

export interface ScheduleItem {
  time: string;
  title: string;
  detail: string;
}

export interface EventSettings {
  eventTitle: string;
  classLabel: string;
  eventDate: string; // YYYY-MM-DD (2026-11-29)
  defaultTime: string;
  defaultVenue: string;
  venueAddress: string;
  dressCode: string;
  hostMessage: string;
  heroImageUrl: string;
  secondaryImageUrl: string;
  scheduleItems: ScheduleItem[];
  updatedAt?: unknown;
  updatedBy?: string;
}

export interface Invitation {
  id: string;
  guestName: string;
  salutation: string;
  groupLabel: string;
  customTime: string;
  customVenue: string;
  personalNote: string;
  rsvpStatus: RsvpStatus;
  companionCount: number;
  guestMessage: string;
  respondedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
}

export interface PublicRsvp {
  id: string;
  guestName: string;
  groupLabel: string;
  rsvpStatus: 'attending' | 'declined';
  companionCount: number;
  guestMessage: string;
  createdAt: Date | null;
}

export const FIELD_LIMITS = {
  eventTitle: 100,
  classLabel: 100,
  eventDatePattern: /^\d{4}-\d{2}-\d{2}$/,
  defaultTime: 100,
  defaultVenue: 160,
  venueAddress: 200,
  dressCode: 140,
  hostMessage: 500,
  imageUrl: 500,
  scheduleMaxItems: 8,
  scheduleTime: 40,
  scheduleTitle: 80,
  scheduleDetail: 200,
  guestName: 80,
  salutation: 50,
  groupLabel: 60,
  customTime: 100,
  customVenue: 160,
  personalNote: 400,
  guestMessage: 400,
  companionMin: 0,
  companionMax: 5,
  idPattern: /^[a-zA-Z0-9_-]{1,128}$/,
} as const;

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  eventTitle: 'Thiệp Mời Kỷ Yếu · Mai Trung Tú',
  classLabel: 'Mai Trung Tú · Kỷ yếu 2026',
  eventDate: '2026-11-29',
  defaultTime: '14:00 – 17:00',
  defaultVenue: 'Sân trường THPT Quang Trung Đống Đa',
  venueAddress: 'Đống Đa, Hà Nội',
  dressCode: 'Áo dài trắng / Vest tối màu hoặc trang phục thanh lịch',
  hostMessage:
    'Cùng nhau, hãy lưu giữ những khoảnh khắc cuối cùng trên hành trình thanh xuân này nhé!',
  heroImageUrl: '',
  secondaryImageUrl: '',
  scheduleItems: [
    {
      time: '14:00 – 14:30',
      title: 'Đón khách & Check-in tại sân trường',
      detail: 'Đón bạn bè, thầy cô, người thân tại cổng chính và chuẩn bị chụp ảnh.',
    },
    {
      time: '14:30 – 15:45',
      title: 'Chụp ảnh cùng Bạn bè & Hội nhóm',
      detail: 'Lưu giữ những khung hình kỷ yếu tại sân trường THPT Quang Trung Đống Đa.',
    },
    {
      time: '15:45 – 16:30',
      title: 'Chụp ảnh cùng Thầy Cô & Gia đình',
      detail: 'Tri ân thầy cô và chụp ảnh kỷ niệm cùng người thân, bạn bè.',
    },
    {
      time: '16:30 – 17:00',
      title: 'Chụp ảnh tự do & Lưu bút cuối ngày',
      detail: 'Ghi lại những lời chúc và khoảnh khắc đẹp nhất trước khi khép lại buổi chiều.',
    },
  ],
};

export const SALUTATION_PRESETS = [
  'Trân trọng kính mời',
  'Thân mời bạn',
  'Kính mời Cô/Thầy',
  'Thân mời gia đình',
] as const;

export const GROUP_PRESETS = [
  'Bạn bè',
  'Bạn cấp 3',
  'Thầy Cô',
  'Gia đình & Người thân',
  'Khách mời đặc biệt',
] as const;
