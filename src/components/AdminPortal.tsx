import { useEffect, useMemo, useState } from 'react';
import { type User } from 'firebase/auth';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  ListPlus,
  LogIn,
  LogOut,
  MessageSquareQuote,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import {
  checkIsAdminUser,
  createInvitation,
  deleteInvitation,
  deletePublicRsvp,
  PRIMARY_ADMIN_EMAIL,
  saveEventSettings,
  signInWithGoogle,
  signOutUser,
  subscribeAllInvitations,
  subscribePublicRsvps,
  updateInvitationAdmin,
} from '../lib/firebase';
import { parseCountdownTarget } from '../lib/scheduleParser';
import {
  FIELD_LIMITS,
  GROUP_PRESETS,
  SALUTATION_PRESETS,
  type EventSettings,
  type Invitation,
  type PublicRsvp,
  type RsvpStatus,
} from '../types/invitation';

interface AdminPortalProps {
  user: User | null;
  authReady: boolean;
  settings: EventSettings;
  onPreviewInvitation: (inviteId: string) => void;
}

type AdminTab = 'guests' | 'wishes' | 'settings';
type StatusFilter = 'all' | RsvpStatus;

const STATUS_DISPLAY: Record<RsvpStatus, string> = {
  pending: 'Chờ phản hồi',
  attending: 'Tham gia',
  declined: 'Từ chối',
};

export function AdminPortal({
  user,
  authReady,
  settings,
  onPreviewInvitation,
}: AdminPortalProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [publicRsvps, setPublicRsvps] = useState<PublicRsvp[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('guests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Invitation | null>(null);
  const [guestName, setGuestName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [salutation, setSalutation] = useState<string>('Thân mời bạn');
  const [groupLabel, setGroupLabel] = useState<string>('Bạn bè cấp 3');
  const [customTime, setCustomTime] = useState<string>(settings.defaultTime);
  const [customVenue, setCustomVenue] = useState<string>(settings.defaultVenue);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [editRsvpStatus, setEditRsvpStatus] = useState<RsvpStatus>('pending');
  const [editCompanions, setEditCompanions] = useState<number>(0);
  const [savingGuest, setSavingGuest] = useState(false);
  const [latestCreatedUrl, setLatestCreatedUrl] = useState<string | null>(null);

  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSalutation, setBulkSalutation] = useState<string>('Thân mời bạn');
  const [bulkGroup, setBulkGroup] = useState<string>('Bạn bè cấp 3');
  const [bulkTime, setBulkTime] = useState<string>(settings.defaultTime);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [settingsDraft, setSettingsDraft] = useState<EventSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!authReady) return;
      setCheckingRole(true);
      const ok = await checkIsAdminUser(user);
      if (active) {
        setIsAdmin(ok);
        setCheckingRole(false);
      }
    }
    void verify();
    return () => {
      active = false;
    };
  }, [user, authReady]);

  useEffect(() => {
    if (!isAdmin) {
      setInvitations([]);
      setPublicRsvps([]);
      return;
    }
    setLoadingData(true);
    setDataError(null);
    const unsubInvites = subscribeAllInvitations(
      (items) => {
        setInvitations(items);
        setLoadingData(false);
      },
      (err) => {
        setDataError(err.message);
        setLoadingData(false);
      }
    );
    const unsubPublic = subscribePublicRsvps(
      (items) => {
        setPublicRsvps(items);
      },
      () => {}
    );
    return () => {
      unsubInvites();
      unsubPublic();
    };
  }, [isAdmin]);

  async function handleSignIn() {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError('Đăng nhập chưa hoàn tất. Vui lòng thử lại.');
    }
  }

  function buildGuestUrl(inviteId: string): string {
    return `${window.location.origin}/moi/${encodeURIComponent(inviteId)}`;
  }

  function openNewGuestForm() {
    setEditingGuest(null);
    setGuestName('');
    setCustomSlug('');
    setSalutation('Thân mời bạn');
    setGroupLabel('Bạn bè cấp 3');
    setCustomTime(settings.defaultTime);
    setCustomVenue(settings.defaultVenue);
    setPersonalNote('');
    setEditRsvpStatus('pending');
    setEditCompanions(0);
    setShowBulkForm(false);
    setShowGuestForm(true);
  }

  function openEditGuestForm(inv: Invitation) {
    setEditingGuest(inv);
    setGuestName(inv.guestName);
    setSalutation(inv.salutation);
    setGroupLabel(inv.groupLabel || 'Bạn bè cấp 3');
    setCustomTime(inv.customTime);
    setCustomVenue(inv.customVenue || settings.defaultVenue);
    setPersonalNote(inv.personalNote);
    setEditRsvpStatus(inv.rsvpStatus);
    setEditCompanions(inv.companionCount);
    setShowBulkForm(false);
    setShowGuestForm(true);
  }

  async function handleSaveGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !guestName.trim()) return;
    setSavingGuest(true);
    setDataError(null);
    setLatestCreatedUrl(null);
    try {
      if (editingGuest) {
        await updateInvitationAdmin(editingGuest.id, {
          guestName,
          salutation,
          groupLabel,
          customTime,
          customVenue,
          personalNote,
          rsvpStatus: editRsvpStatus,
          companionCount: editCompanions,
          guestMessage: editingGuest.guestMessage,
          preserveRespondedAt:
            editingGuest.rsvpStatus === editRsvpStatus && editRsvpStatus !== 'pending',
        });
      } else {
        const newId = await createInvitation(
          {
            guestName,
            salutation,
            groupLabel,
            customTime,
            customVenue,
            personalNote,
          },
          user.uid,
          customSlug || undefined
        );
        setLatestCreatedUrl(buildGuestUrl(newId));
      }
      setShowGuestForm(false);
      setEditingGuest(null);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Không thể lưu thiệp mời.');
    } finally {
      setSavingGuest(false);
    }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const lines = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return;
    setBulkBusy(true);
    setBulkFeedback(null);
    setDataError(null);

    try {
      let created = 0;
      for (const line of lines.slice(0, 50)) {
        const parts = line.split('|').map((p) => p.trim());
        const namePart = parts[0];
        if (!namePart) continue;
        const timePart = parts[1] || bulkTime || settings.defaultTime;
        const salutationPart = parts[2] || bulkSalutation || 'Thân mời bạn';

        await createInvitation(
          {
            guestName: namePart,
            salutation: salutationPart,
            groupLabel: bulkGroup,
            customTime: timePart,
            customVenue: settings.defaultVenue,
            personalNote: '',
          },
          user.uid
        );
        created += 1;
      }
      setBulkText('');
      setBulkFeedback(`Đã tạo thành công ${created} thiệp mời cá nhân với link riêng.`);
      setShowBulkForm(false);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Không thể thêm danh sách.');
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleCopyInviteLink(inviteId: string) {
    const url = buildGuestUrl(inviteId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(inviteId);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === inviteId ? null : prev));
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }

  async function handleDeleteGuest(inviteId: string) {
    try {
      await deleteInvitation(inviteId);
      setConfirmDeleteId(null);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Không thể xóa thiệp.');
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);
    setSettingsSavedMsg(null);
    try {
      await saveEventSettings(settingsDraft, user.uid);
      setSettingsSavedMsg('Đã cập nhật nội dung sự kiện.');
      window.setTimeout(() => setSettingsSavedMsg(null), 3000);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Không thể lưu cài đặt.');
    } finally {
      setSavingSettings(false);
    }
  }

  function exportGuestsCsv() {
    const headers = [
      'Mã khách',
      'Danh xưng',
      'Tên khách mời',
      'Nhóm',
      'Thời gian mời trên thiệp',
      'Trạng thái',
      'Người đi cùng',
      'Lời chúc',
      'Link thiệp riêng',
    ];
    const rows = invitations.map((inv) => [
      inv.id,
      inv.salutation,
      inv.guestName,
      inv.groupLabel,
      inv.customTime,
      STATUS_DISPLAY[inv.rsvpStatus],
      String(inv.companionCount),
      inv.guestMessage.replace(/\r?\n/g, ' '),
      buildGuestUrl(inv.id),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-ky-yeu-29-11-2026.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => {
    const attending = invitations.filter((i) => i.rsvpStatus === 'attending');
    const declined = invitations.filter((i) => i.rsvpStatus === 'declined');
    const pending = invitations.filter((i) => i.rsvpStatus === 'pending');
    const totalPeople = attending.reduce((sum, i) => sum + 1 + i.companionCount, 0);
    const publicAttending = publicRsvps.filter((r) => r.rsvpStatus === 'attending');
    const publicPeople = publicAttending.reduce((sum, r) => sum + 1 + r.companionCount, 0);
    return {
      totalInvites: invitations.length,
      attendingInvites: attending.length + publicAttending.length,
      declinedInvites: declined.length + publicRsvps.filter((r) => r.rsvpStatus === 'declined').length,
      pendingInvites: pending.length,
      totalAttendees: totalPeople + publicPeople,
    };
  }, [invitations, publicRsvps]);

  const combinedWishes = useMemo(() => {
    const fromInvites = invitations
      .filter((i) => i.guestMessage.trim().length > 0 || i.rsvpStatus !== 'pending')
      .map((i) => ({
        id: `inv-${i.id}`,
        rawId: i.id,
        source: 'Thiệp riêng' as const,
        name: i.guestName,
        group: i.groupLabel,
        status: i.rsvpStatus,
        companions: i.companionCount,
        message: i.guestMessage,
      }));
    const fromPublic = publicRsvps.map((r) => ({
      id: `pub-${r.id}`,
      rawId: r.id,
      source: 'Trang chung' as const,
      name: r.guestName,
      group: r.groupLabel,
      status: r.rsvpStatus as RsvpStatus,
      companions: r.companionCount,
      message: r.guestMessage,
    }));
    return [...fromInvites, ...fromPublic];
  }, [invitations, publicRsvps]);

  const filteredInvitations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invitations.filter((inv) => {
      if (statusFilter !== 'all' && inv.rsvpStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        inv.guestName.toLowerCase().includes(q) ||
        inv.groupLabel.toLowerCase().includes(q) ||
        inv.customTime.toLowerCase().includes(q)
      );
    });
  }, [invitations, searchQuery, statusFilter]);

  if (!authReady || checkingRole) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-16 text-center font-mono text-sm text-slate-400">
        Đang kiểm tra phiên đăng nhập quản trị...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-16 sm:py-24">
        <div className="border border-cyan-500/30 bg-[#070D19]/95 p-8 sm:p-10 text-center rounded-md">
          <p className="font-mono text-xs font-medium tracking-wide text-emerald-400">
            /admin · Khu vực quản trị
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
            Đăng nhập quyền Admin
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Đăng nhập bằng tài khoản Google quản trị để thêm khách mời, tạo đường dẫn thiệp riêng theo tên và giờ mời, theo dõi xác nhận tham dự và lời chúc theo thời gian thực.
          </p>

          {authError && (
            <p role="alert" className="mt-4 text-sm text-rose-400">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-6 min-h-[44px] inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập với Google
          </button>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-16 sm:py-24">
        <div className="border border-rose-500/30 bg-[#070D19]/95 p-8 text-center rounded-md">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
            Tài khoản chưa được cấp quyền Admin
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Bạn đang đăng nhập với email <span className="font-medium text-slate-200">{user.email}</span>. Chỉ tài khoản quản trị (<span className="font-mono text-xs text-cyan-300">{PRIMARY_ADMIN_EMAIL}</span>) mới có quyền chỉnh sửa danh sách thiệp mời.
          </p>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="mt-6 min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-200 border border-slate-700 bg-[#0B1324] hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất để đổi tài khoản
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-cyan-500/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-medium text-emerald-400">
            /admin · {user.email}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Bảng Điều Khiển Thiệp Mời
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNewGuestForm}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Thêm khách mời
          </button>
          <button
            type="button"
            onClick={() => {
              setShowGuestForm(false);
              setBulkTime(settings.defaultTime);
              setShowBulkForm((v) => !v);
            }}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-cyan-300 border border-cyan-500/30 bg-[#070D19] hover:bg-cyan-950/50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <ListPlus className="h-4 w-4" />
            Thêm nhanh danh sách
          </button>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-100 border border-transparent hover:border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* 4-Column Real-time Stats */}
      <div className="mt-6 grid grid-cols-2 divide-y divide-cyan-500/15 border border-cyan-500/25 bg-[#070D19]/90 sm:grid-cols-4 sm:divide-x sm:divide-y-0 rounded-md overflow-hidden">
        <div className="p-5">
          <p className="font-mono text-xs text-slate-400">Thiệp đã tạo</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
            {stats.totalInvites}
          </p>
        </div>
        <div className="p-5 border-l border-cyan-500/15 sm:border-l-0">
          <p className="font-mono text-xs text-slate-400">Xác nhận tham gia</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-emerald-400 tabular-nums">
            {stats.attendingInvites}
          </p>
        </div>
        <div className="p-5">
          <p className="font-mono text-xs text-slate-400">Không thể tham dự</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-slate-300 tabular-nums">
            {stats.declinedInvites}
          </p>
        </div>
        <div className="p-5 border-l border-cyan-500/15 sm:border-l-0">
          <p className="font-mono text-xs text-slate-400">Tổng khách dự kiến</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-cyan-300 tabular-nums">
            {stats.totalAttendees}
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-1 p-1 bg-[#070D19] border border-cyan-500/20 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'guests'
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Khách mời & Link riêng ({invitations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishes')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'wishes'
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Lời chúc & Phản hồi ({combinedWishes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-cyan-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Nội dung thiệp mời
          </button>
        </div>

        {activeTab === 'guests' && invitations.length > 0 && (
          <button
            type="button"
            onClick={exportGuestsCsv}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-cyan-300 border border-cyan-500/30 bg-[#070D19] hover:bg-cyan-950/50 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất file CSV
          </button>
        )}
      </div>

      {dataError && (
        <div role="alert" className="mt-4 border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200 rounded-md">
          {dataError}
        </div>
      )}

      {latestCreatedUrl && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-emerald-500/40 bg-emerald-950/30 p-4 rounded-md">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-300">
              Đã tạo thiệp mời thành công. Đường dẫn gửi riêng cho khách:
            </p>
            <p className="mt-1 truncate font-mono text-xs text-slate-200">
              {latestCreatedUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(latestCreatedUrl);
              setLatestCreatedUrl(null);
            }}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md whitespace-nowrap shrink-0"
          >
            <Copy className="h-3.5 w-3.5" />
            Sao chép link
          </button>
        </div>
      )}

      {bulkFeedback && (
        <div className="mt-4 border border-emerald-500/40 bg-emerald-950/30 p-4 text-sm text-emerald-200 rounded-md">
          {bulkFeedback}
        </div>
      )}

      {/* Single Guest Create/Edit Form */}
      {showGuestForm && (
        <form
          onSubmit={handleSaveGuest}
          className="mt-6 border border-cyan-500/30 bg-[#070D19] p-6 rounded-md space-y-5"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
              {editingGuest
                ? `Chỉnh sửa thiệp mời: ${editingGuest.guestName}`
                : 'Tạo thiệp mời cá nhân mới'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowGuestForm(false);
                setEditingGuest(null);
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-100"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Danh xưng trên thiệp *
              </label>
              <input
                type="text"
                required
                list="salutation-options"
                maxLength={FIELD_LIMITS.salutation}
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                placeholder="Thân mời bạn"
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              <datalist id="salutation-options">
                {SALUTATION_PRESETS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Tên khách mời *
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.guestName}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Nhóm khách mời
              </label>
              <input
                type="text"
                list="group-options"
                maxLength={FIELD_LIMITS.groupLabel}
                value={groupLabel}
                onChange={(e) => setGroupLabel(e.target.value)}
                placeholder="Bạn bè cấp 3"
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
              <datalist id="group-options">
                {GROUP_PRESETS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          {!editingGuest && (
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Đường dẫn riêng (tùy chọn — bỏ trống sẽ tự tạo từ tên)
              </label>
              <div className="mt-1.5 flex items-center rounded-md border border-slate-700 bg-[#030712] focus-within:border-cyan-400">
                <span className="pl-3 pr-1 font-mono text-xs text-slate-400 select-none">
                  /moi/
                </span>
                <input
                  type="text"
                  maxLength={80}
                  value={customSlug}
                  onChange={(e) =>
                    setCustomSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]+/g, '-')
                        .replace(/^-+/, '')
                    )
                  }
                  placeholder="nguyen-minh-anh (tự động nếu để trống)"
                  className="w-full min-h-[42px] bg-transparent pr-3 py-2 font-mono text-sm text-cyan-300 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Thời gian mời riêng ghi trên thiệp *
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.customTime}
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="08:00 — 09:30 · Chủ Nhật, 29/11/2026"
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 font-mono text-sm text-emerald-300 focus:border-cyan-400 focus:outline-none"
              />
              {(() => {
                const preview = parseCountdownTarget(customTime, settings);
                return (
                  <p className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                    Mốc đếm ngược: <span className="text-cyan-300">{preview.time24} · {preview.formattedDate}</span>
                  </p>
                );
              })()}
            </div>
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Địa điểm ghi trên thiệp
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.customVenue}
                value={customVenue}
                onChange={(e) => setCustomVenue(e.target.value)}
                placeholder={settings.defaultVenue}
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              Lời mời riêng (tùy chọn — hiển thị hiệu ứng gõ terminal)
            </label>
            <textarea
              rows={2}
              maxLength={FIELD_LIMITS.personalNote}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Để trống nếu muốn dùng thông điệp mời chung..."
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {editingGuest && (
            <div className="grid grid-cols-1 gap-4 border-t border-cyan-500/15 pt-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs font-medium text-slate-300">
                  Cập nhật trạng thái xác nhận
                </label>
                <select
                  value={editRsvpStatus}
                  onChange={(e) => setEditRsvpStatus(e.target.value as RsvpStatus)}
                  className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="pending">Chờ phản hồi</option>
                  <option value="attending">Tham gia</option>
                  <option value="declined">Từ chối</option>
                </select>
              </div>
              {editRsvpStatus === 'attending' && (
                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    Số người đi cùng (0 – 5)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={editCompanions}
                    onChange={(e) => setEditCompanions(Number(e.target.value))}
                    className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 font-mono text-sm text-slate-100 tabular-nums focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowGuestForm(false);
                setEditingGuest(null);
              }}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savingGuest}
              className="min-h-[40px] px-5 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 rounded-md transition-colors"
            >
              {savingGuest
                ? 'Đang lưu...'
                : editingGuest
                  ? 'Lưu thay đổi'
                  : 'Tạo thiệp & Sinh link'}
            </button>
          </div>
        </form>
      )}

      {/* Bulk Import Form */}
      {showBulkForm && (
        <form
          onSubmit={handleBulkImport}
          className="mt-6 border border-cyan-500/30 bg-[#070D19] p-6 rounded-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Thêm nhanh danh sách khách mời
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Mỗi dòng một tên khách mời, hoặc dùng định dạng: Tên | Thời gian mời | Danh xưng
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBulkForm(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-100"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Danh xưng mặc định
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.salutation}
                value={bulkSalutation}
                onChange={(e) => setBulkSalutation(e.target.value)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Nhóm mặc định
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.groupLabel}
                value={bulkGroup}
                onChange={(e) => setBulkGroup(e.target.value)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                Thời gian mời mặc định
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.customTime}
                value={bulkTime}
                onChange={(e) => setBulkTime(e.target.value)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 font-mono text-sm text-emerald-300"
              />
            </div>
          </div>

          <div>
            <textarea
              rows={5}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Nguyễn Thảo Vy | 08:00 · Đón khách sân trường | Thân mời bạn\nLê Hoàng Nam | 09:00 · Chụp ảnh nhóm bạn thân | Thân mời bạn\nCô Phạm Lan Hương | 08:30 · Tri ân Thầy Cô | Kính mời Cô`}
              className="w-full rounded-md border border-slate-700 bg-[#030712] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBulkForm(false)}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-slate-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={bulkBusy}
              className="min-h-[40px] px-5 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 rounded-md transition-colors"
            >
              {bulkBusy ? 'Đang tạo thiệp...' : 'Tạo hàng loạt thiệp mời'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 1: Guest List */}
      {activeTab === 'guests' && (
        <section className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên khách mời, nhóm hoặc giờ hẹn..."
                className="w-full min-h-[40px] rounded-md border border-slate-700 bg-[#070D19] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#070D19] border border-cyan-500/20 rounded-lg overflow-x-auto">
              {(
                [
                  ['all', 'Tất cả'],
                  ['attending', 'Tham gia'],
                  ['pending', 'Chờ phản hồi'],
                  ['declined', 'Từ chối'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === key
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loadingData ? (
            <div className="mt-6 border border-cyan-500/20 bg-[#070D19] p-10 text-center font-mono text-sm text-slate-400 rounded-md">
              Đang tải danh sách thiệp mời...
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="mt-6 border border-cyan-500/20 bg-[#070D19] p-10 text-center rounded-md">
              <p className="font-[family-name:var(--font-display)] text-xl font-medium text-white">
                {invitations.length === 0
                  ? 'Chưa có thiệp mời cá nhân nào'
                  : 'Không tìm thấy khách mời phù hợp bộ lọc'}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {invitations.length === 0
                  ? 'Nhấn "Thêm khách mời" ở trên để nhập tên, thời gian mời riêng và tạo link gửi bạn bè.'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn trạng thái khác.'}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto border border-cyan-500/25 bg-[#070D19]/95 rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-[#0B1324] font-mono text-xs font-medium text-slate-400">
                    <th className="py-3.5 px-4">Khách mời</th>
                    <th className="py-3.5 px-4">Thời gian trên thiệp</th>
                    <th className="py-3.5 px-4">Trạng thái RSVP</th>
                    <th className="py-3.5 px-4">Lời chúc / Ghi chú</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-semibold text-white">{inv.guestName}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {inv.salutation}
                          {inv.groupLabel && (
                            <>
                              <span aria-hidden="true" className="mx-1.5">·</span>
                              <span>{inv.groupLabel}</span>
                            </>
                          )}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-cyan-300/85">
                          /moi/{inv.id}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 align-top font-mono text-xs text-emerald-300 tabular-nums">
                        <p>{inv.customTime}</p>
                        {(() => {
                          const target = parseCountdownTarget(inv.customTime, settings);
                          return (
                            <p className="mt-1 text-[11px] text-slate-400">
                              Đếm ngược: {target.time24} · {target.formattedDate}
                            </p>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            inv.rsvpStatus === 'attending'
                              ? 'text-emerald-400'
                              : inv.rsvpStatus === 'declined'
                                ? 'text-slate-400'
                                : 'text-amber-300'
                          }`}
                        >
                          {inv.rsvpStatus === 'attending' && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {inv.rsvpStatus === 'declined' && (
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {inv.rsvpStatus === 'pending' && (
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span>{STATUS_DISPLAY[inv.rsvpStatus]}</span>
                          {inv.rsvpStatus === 'attending' && inv.companionCount > 0 && (
                            <span className="font-mono tabular-nums text-cyan-300">
                              (+{inv.companionCount})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top max-w-[240px]">
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {inv.guestMessage || inv.personalNote || '—'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => void handleCopyInviteLink(inv.id)}
                            title={`Sao chép link /moi/${inv.id}`}
                            className="inline-flex h-9 items-center gap-1 px-2.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy link</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onPreviewInvitation(inv.id)}
                            title="Mở xem thiệp của khách này"
                            className="inline-flex h-9 w-9 items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditGuestForm(inv)}
                            title="Chỉnh sửa tên, giờ mời và trạng thái"
                            className="inline-flex h-9 w-9 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {confirmDeleteId === inv.id ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteGuest(inv.id)}
                              className="inline-flex h-9 items-center px-2.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded transition-colors"
                            >
                              Xác nhận xóa
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(inv.id)}
                              title="Xóa thiệp"
                              className="inline-flex h-9 w-9 items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Wishes & Public RSVPs */}
      {activeTab === 'wishes' && (
        <section className="mt-6">
          {combinedWishes.length === 0 ? (
            <div className="border border-cyan-500/20 bg-[#070D19] p-10 text-center rounded-md">
              <MessageSquareQuote className="mx-auto h-7 w-7 text-cyan-400 opacity-75" />
              <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-medium text-white">
                Chưa có lời chúc hay phản hồi nào
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Khi bạn bè và người thân xác nhận tham gia hoặc gửi lời chúc, toàn bộ danh sách sẽ hiển thị tự động tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {combinedWishes.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between border border-cyan-500/20 bg-[#070D19]/95 p-5 rounded-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="mt-0.5 font-mono text-xs text-slate-400">
                          {item.source} · {item.group || 'Khách mời'}
                        </p>
                      </div>
                      <span
                        className={`font-mono text-xs font-medium ${
                          item.status === 'attending'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.status === 'attending'
                          ? `Tham gia${item.companions > 0 ? ` (+${item.companions})` : ''}`
                          : 'Không tham dự'}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-200">
                      {item.message ? `“${item.message}”` : 'Không kèm lời nhắn.'}
                    </p>
                  </div>

                  {item.source === 'Trang chung' && (
                    <div className="mt-4 flex justify-end border-t border-slate-800 pt-3">
                      <button
                        type="button"
                        onClick={() => void deletePublicRsvp(item.rawId)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa phản hồi này
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Event Settings */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="mt-6 border border-cyan-500/25 bg-[#070D19]/95 p-6 sm:p-8 rounded-md space-y-6"
        >
          <div className="border-b border-cyan-500/20 pb-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
              Cấu hình nội dung thiệp mời cá nhân
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Cập nhật tên sự kiện, địa điểm, thời gian mặc định và thông điệp mời của Mai Trung Tú.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Tên sự kiện]
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.eventTitle}
                value={settingsDraft.eventTitle}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, eventTitle: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Tên chủ nhân / Tagline]
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.classLabel}
                value={settingsDraft.classLabel}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, classLabel: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Thời gian mời mặc định]
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.defaultTime}
                value={settingsDraft.defaultTime}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, defaultTime: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 font-mono text-sm text-emerald-300"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Trang phục gợi ý]
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.dressCode}
                value={settingsDraft.dressCode}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, dressCode: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Địa điểm tổ chức]
              </label>
              <input
                type="text"
                required
                maxLength={FIELD_LIMITS.defaultVenue}
                value={settingsDraft.defaultVenue}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, defaultVenue: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-medium text-slate-300">
                [Địa chỉ chi tiết]
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.venueAddress}
                value={settingsDraft.venueAddress}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, venueAddress: e.target.value })
                }
                className="mt-1.5 w-full min-h-[42px] rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-slate-300">
              [Thông điệp mời mặc định]
            </label>
            <textarea
              rows={3}
              maxLength={FIELD_LIMITS.hostMessage}
              value={settingsDraft.hostMessage}
              onChange={(e) =>
                setSettingsDraft({ ...settingsDraft, hostMessage: e.target.value })
              }
              className="mt-1.5 w-full rounded-md border border-slate-700 bg-[#030712] px-3 py-2 text-sm text-slate-100"
            />
          </div>

          {/* Schedule Items Editor */}
          <div className="border-t border-cyan-500/20 pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                [Lịch trình ngày 29/11/2026] (tối đa {FIELD_LIMITS.scheduleMaxItems} mốc)
              </h3>
              {settingsDraft.scheduleItems.length < FIELD_LIMITS.scheduleMaxItems && (
                <button
                  type="button"
                  onClick={() =>
                    setSettingsDraft({
                      ...settingsDraft,
                      scheduleItems: [
                        ...settingsDraft.scheduleItems,
                        { time: '11:30 – 12:00', title: 'Hoạt động mới', detail: '' },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm mốc giờ
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {settingsDraft.scheduleItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 border border-slate-800 bg-[#030712] p-3.5 rounded-md sm:grid-cols-12"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      required
                      maxLength={FIELD_LIMITS.scheduleTime}
                      value={item.time}
                      onChange={(e) => {
                        const next = [...settingsDraft.scheduleItems];
                        next[idx] = { ...next[idx], time: e.target.value };
                        setSettingsDraft({ ...settingsDraft, scheduleItems: next });
                      }}
                      placeholder="08:00 – 09:00"
                      className="w-full rounded border border-slate-700 bg-[#070D19] px-2.5 py-1.5 font-mono text-xs text-cyan-300 tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      maxLength={FIELD_LIMITS.scheduleTitle}
                      value={item.title}
                      onChange={(e) => {
                        const next = [...settingsDraft.scheduleItems];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setSettingsDraft({ ...settingsDraft, scheduleItems: next });
                      }}
                      placeholder="Tên hoạt động"
                      className="w-full rounded border border-slate-700 bg-[#070D19] px-2.5 py-1.5 text-xs font-medium text-slate-100"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      maxLength={FIELD_LIMITS.scheduleDetail}
                      value={item.detail}
                      onChange={(e) => {
                        const next = [...settingsDraft.scheduleItems];
                        next[idx] = { ...next[idx], detail: e.target.value };
                        setSettingsDraft({ ...settingsDraft, scheduleItems: next });
                      }}
                      placeholder="Mô tả ngắn"
                      className="w-full rounded border border-slate-700 bg-[#070D19] px-2.5 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const next = settingsDraft.scheduleItems.filter((_, i) => i !== idx);
                        setSettingsDraft({ ...settingsDraft, scheduleItems: next });
                      }}
                      aria-label="Xóa mốc lịch trình"
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cyan-500/20 pt-4">
            <div>
              {settingsSavedMsg && (
                <p className="text-sm font-medium text-emerald-400">{settingsSavedMsg}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={savingSettings}
              className="min-h-[44px] px-6 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 rounded-md transition-colors"
            >
              {savingSettings ? 'Đang lưu cài đặt...' : 'Lưu cài đặt thiệp mời'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
