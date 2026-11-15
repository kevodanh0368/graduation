import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AdminPortal } from './components/AdminPortal';
import { CountdownHud } from './components/CountdownHud';
import { FooterHud } from './components/FooterHud';
import { HeroTitleSection } from './components/HeroTitleSection';
import { InfoCardsGrid } from './components/InfoCardsGrid';
import { InvitationBox } from './components/InvitationBox';
import { NavbarHud } from './components/NavbarHud';
import { RsvpActionBlock } from './components/RsvpActionBlock';
import { SpaceHudBackdrop } from './components/SpaceHudBackdrop';
import {
  auth,
  subscribeEventSettings,
  subscribeInvitationById,
} from './lib/firebase';
import {
  DEFAULT_EVENT_SETTINGS,
  type EventSettings,
  type Invitation,
} from './types/invitation';

function readGuestIdFromUrl(): string | null {
  const path = window.location.pathname.replace(/\/+$/, '');
  const pathMatch = path.match(/^\/(?:moi|guest|invite)\/([a-zA-Z0-9_-]{1,128})$/);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]);
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('guest') || params.get('invite');
  return id && id.trim() ? id.trim() : null;
}

function readModeFromUrl(): 'guest' | 'admin' {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/admin' || params.get('view') === 'admin') {
    return 'admin';
  }
  return 'guest';
}

export default function App() {
  const [mode, setMode] = useState<'guest' | 'admin'>(() => readModeFromUrl());
  const [activeSection, setActiveSection] = useState<string>('trang-chu');
  const [inviteId, setInviteId] = useState<string | null>(() => readGuestIdFromUrl());

  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loadingInvite, setLoadingInvite] = useState<boolean>(Boolean(inviteId));

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubSettings = subscribeEventSettings((data) => {
      setSettings(data);
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    if (!inviteId) {
      setInvitation(null);
      setLoadingInvite(false);
      return;
    }

    setLoadingInvite(true);
    const unsubInvite = subscribeInvitationById(
      inviteId,
      (data) => {
        setInvitation(data);
        setLoadingInvite(false);
      },
      () => {
        setInvitation(null);
        setLoadingInvite(false);
      }
    );
    return () => unsubInvite();
  }, [inviteId]);

  useEffect(() => {
    const onPopState = () => {
      setInviteId(readGuestIdFromUrl());
      setMode(readModeFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const updateUrl = useCallback((nextInviteId: string | null, nextMode: 'guest' | 'admin') => {
    const url = new URL(window.location.href);
    url.searchParams.delete('guest');
    url.searchParams.delete('invite');
    url.searchParams.delete('view');

    if (nextMode === 'admin') {
      url.pathname = '/admin';
    } else if (nextInviteId) {
      url.pathname = `/moi/${encodeURIComponent(nextInviteId)}`;
    } else {
      url.pathname = '/';
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleSwitchMode = useCallback(
    (nextMode: 'guest' | 'admin') => {
      setMode(nextMode);
      updateUrl(inviteId, nextMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [inviteId, updateUrl]
  );

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      setActiveSection(sectionId);
      if (mode !== 'guest') {
        setMode('guest');
        updateUrl(inviteId, 'guest');
        window.setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [mode, inviteId, updateUrl]
  );

  const handlePreviewInvitation = useCallback(
    (targetInviteId: string) => {
      setInviteId(targetInviteId);
      setMode('guest');
      setActiveSection('thu-moi');
      updateUrl(targetInviteId, 'guest');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateUrl]
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-[#03091B] text-slate-100">
      {/* Nền không gian, quỹ đạo sáng & máy bay bay ngang */}
      <SpaceHudBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Thanh điều hướng trên cùng */}
        <NavbarHud
          mode={mode}
          activeSection={activeSection}
          onSwitchMode={handleSwitchMode}
          onNavigateSection={handleNavigateSection}
        />

        {mode === 'admin' ? (
          <div className="flex-1">
            <AdminPortal
              user={user}
              authReady={authReady}
              settings={settings}
              onPreviewInvitation={handlePreviewInvitation}
            />
          </div>
        ) : (
          <main className="flex-1">
            {/* Phần 1: Tiêu đề THIỆP MỜI KỶ YẾU & 2 câu trích dẫn viết tay */}
            <HeroTitleSection />

            {/* Phần 2: Khung THƯ MỜI bát giác hiển thị tên người được mời */}
            <InvitationBox
              settings={settings}
              invitation={invitation}
              loadingInvite={loadingInvite}
            />

            {/* Phần 3: 3 ô thông tin Thời gian · Địa điểm · Lịch trình dự kiến */}
            <InfoCardsGrid settings={settings} invitation={invitation} />

            {/* Phần 4: Đồng hồ đếm ngược đến ngày kỷ yếu */}
            <CountdownHud settings={settings} invitation={invitation} />

            {/* Phần 5: Nút Xác nhận tham dự + Form RSVP + Dòng chữ góc dưới trái */}
            <RsvpActionBlock invitation={invitation} />
          </main>
        )}

        {/* Phần 5: Chân trang */}
        <FooterHud
          mode={mode}
          hasGuestParam={Boolean(inviteId)}
          onResetGuestParam={() => {
            setInviteId(null);
            setMode('guest');
            updateUrl(null, 'guest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSwitchMode={handleSwitchMode}
        />
      </div>
    </div>
  );
}
