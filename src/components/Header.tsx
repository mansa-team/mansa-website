'use client';
import Image from 'next/image';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/chrome.css';
import Arrow from './Arrow';
import LoadingMark from './motion/LoadingMark';

type Theme = 'auto' | 'light' | 'dark';
type DataConnection = Partial<EventTarget> & { saveData?: boolean };
const links = [
  ['proposta', 'Nossa proposta'],
  ['pesquisa', 'Em construção'],
  ['origem', 'A Mansa'],
];

function ContactLinkHint({ saveData }: { saveData: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span className="header-route-hint" data-pending={pending || undefined} aria-hidden="true">
        <Arrow />
        <span className="header-route-marks">
          <i />
          <i />
          <i />
        </span>
      </span>
      {pending &&
        createPortal(
          <aside className="route-pending-panel" data-static-motion={saveData || undefined}>
            <LoadingMark staticMotion={saveData} />
          </aside>,
          document.body,
        )}
    </>
  );
}

export default function Header() {
  const path = usePathname();
  const [theme, setTheme] = useState<Theme>('auto');
  const [saveData, setSaveData] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const menuAnimation = useRef<Animation | null>(null);
  const setMenuOpen = useCallback((open: boolean, immediate = false) => {
    const details = menu.current;
    const nav = details?.querySelector('nav');
    if (!details || !nav) return;
    const wasOpen = details.open;
    const current = getComputedStyle(nav);
    const from = { opacity: current.opacity, transform: current.transform };
    menuAnimation.current?.cancel();
    menuAnimation.current = null;
    nav.inert = !open;
    if (
      immediate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (navigator as Navigator & { connection?: DataConnection }).connection?.saveData ||
      !nav.animate
    ) {
      details.open = open;
      delete details.dataset.menuState;
      return;
    }
    if (!wasOpen && !open) return;
    details.open = true;
    details.dataset.menuState = open ? 'opening' : 'closing';
    const animation = nav.animate(
      [
        wasOpen ? from : { opacity: 0, transform: 'translateY(-8px)' },
        open
          ? { opacity: 1, transform: 'translateY(0)' }
          : { opacity: 0, transform: 'translateY(-5px)' },
      ],
      { duration: open ? 240 : 160, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both' },
    );
    menuAnimation.current = animation;
    animation.onfinish = () => {
      if (menuAnimation.current !== animation) return;
      details.open = open;
      delete details.dataset.menuState;
      animation.cancel();
      menuAnimation.current = null;
    };
  }, []);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: DataConnection }).connection;
    const preferences = () => {
      setSaveData(Boolean(connection?.saveData));
      const state = menu.current?.dataset.menuState;
      if ((reduced.matches || connection?.saveData) && state) {
        setMenuOpen(state === 'opening', true);
      }
    };
    preferences();
    reduced.addEventListener('change', preferences);
    connection?.addEventListener?.('change', preferences);
    return () => {
      reduced.removeEventListener('change', preferences);
      connection?.removeEventListener?.('change', preferences);
    };
  }, [setMenuOpen]);
  useEffect(() => {
    let preference: Theme = (document.documentElement.dataset.themePreference || 'auto') as Theme;
    const apply = () => {
      const h = new Date().getHours();
      document.documentElement.dataset.theme =
        preference === 'auto' ? (h >= 18 || h < 6 ? 'dark' : 'light') : preference;
      document.documentElement.dataset.themePreference = preference;
      setTheme(preference);
    };
    const change = () => {
      preference = (document.documentElement.dataset.themePreference || 'auto') as Theme;
      apply();
    };
    const storage = (e: StorageEvent) => {
      if (e.key !== 'mansa-theme') return;
      preference = ['auto', 'light', 'dark'].includes(e.newValue || '')
        ? (e.newValue as Theme)
        : 'auto';
      apply();
    };
    const visibility = () => {
      if (!document.hidden) apply();
    };
    apply();
    const interval = setInterval(apply, 60000);
    window.addEventListener('mansa:theme', change);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mansa:theme', change);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const close = () => setMenuOpen(false, true);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu.current?.open) {
        close();
        menu.current.querySelector('summary')?.focus();
      }
    };
    const outside = (e: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(e.target as Node)) {
        if (menu.current.contains(document.activeElement))
          menu.current.querySelector('summary')?.focus({ preventScroll: true });
        setMenuOpen(false);
      }
    };
    const focusOutside = (e: FocusEvent) => {
      if (
        menu.current?.open &&
        menu.current.dataset.menuState !== 'closing' &&
        !menu.current.contains(e.target as Node)
      )
        close();
    };
    const desktop = window.matchMedia('(min-width: 1080px)');
    const resize = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener('change', resize);
    document.addEventListener('focusin', focusOutside);
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    close();
    return () => {
      desktop.removeEventListener('change', resize);
      document.removeEventListener('focusin', focusOutside);
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
      menuAnimation.current?.cancel();
      menuAnimation.current = null;
    };
  }, [path, setMenuOpen]);
  const anchor = (id: string) => (path === '/' ? `#${id}` : `/#${id}`);
  const closeMenu = (id?: string) => {
    setMenuOpen(false, true);
    if (id && path === '/') {
      const destination = document.getElementById(id);
      if (destination) {
        if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
      }
    }
  };
  return (
    <header className="site-header" data-save-data={saveData || undefined}>
      <Link className="brand" href="/" aria-label="Mansa — início">
        <Image src="/mansa-logo.png" alt="" width={42} height={42} sizes="42px" />
        <span className="wordmark">
          mansa<span className="wordmark-period">.</span>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Navegação principal">
        {links.map(([id, label]) => (
          <Link key={id} href={anchor(id)}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <label className="theme-control">
          <span className="sr-only">Aparência do site</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="6.5" stroke="currentColor" />
            <path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
          </svg>
          <select
            data-theme-select
            aria-label="Aparência do site"
            value={theme}
            onChange={(e) => {
              const value = e.target.value as Theme;
              document.documentElement.dataset.themePreference = value;
              try {
                localStorage.setItem('mansa-theme', value);
              } catch {}
              window.dispatchEvent(new Event('mansa:theme'));
            }}
          >
            <option value="auto">Auto</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </label>
        <Link className="header-contact" href="/contato/">
          <span>Vamos conversar</span> <ContactLinkHint saveData={saveData} />
        </Link>
        <details className="mobile-menu" ref={menu}>
          <summary
            aria-label="Abrir navegação"
            onClick={(event) => {
              event.preventDefault();
              const details = menu.current;
              if (details)
                setMenuOpen(
                  !details.open || details.dataset.menuState === 'closing',
                  event.detail === 0,
                );
            }}
          >
            <span className="menu-label">Menu</span>
            <span className="menu-glyph" aria-hidden="true">
              <span />
              <span />
            </span>
          </summary>
          <nav aria-label="Navegação móvel">
            {links.map(([id, label], index) => (
              <Link key={id} href={anchor(id)} onClick={() => closeMenu(id)}>
                <span className="mobile-nav-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span>{label}</span>
                <Arrow />
              </Link>
            ))}
            <Link href="/contato/" onClick={() => closeMenu()} className="mobile-contact">
              <span>Vamos conversar</span> <ContactLinkHint saveData={saveData} />
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
