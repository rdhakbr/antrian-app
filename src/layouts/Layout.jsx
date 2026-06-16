import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userMenu = [
  { path: '/dashboard', label: 'Beranda', icon: '🏠' },
  { path: '/booking', label: 'Ambil Antrean', icon: '🎫' },
  { path: '/realtime', label: 'Pantau Antrean', icon: '📡' },
  { path: '/riwayat', label: 'Riwayat', icon: '📋' },
  { path: '/profil', label: 'Profil', icon: '👤' },
];

const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/antrean', label: 'Kelola Antrean', icon: '🗂️' },
  { path: '/admin/jadwal', label: 'Jadwal & Kuota', icon: '📅' },
  { path: '/admin/layanan', label: 'Layanan', icon: '⚙️' },
  { path: '/admin/petugas', label: 'Petugas', icon: '👥' },
  { path: '/admin/users', label: 'Data Users', icon: '🗃️' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  const menu = user?.role === 'admin' ? adminMenu : userMenu;
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f4f6f9',
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      {/* Overlay Mobile */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.4)',
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: isMobile ? 'fixed' : 'relative',
          left: open ? 0 : -260,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          width: isMobile ? 260 : 230,
          minWidth: isMobile ? 260 : 230,
          background: 'linear-gradient(180deg,#1b5e20,#2e7d32)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all .25s ease',
          flexShrink: 0,
          boxShadow: isMobile
            ? '0 0 20px rgba(0,0,0,.25)'
            : 'none',
        }}
      >
        <div
          style={{
            padding: '20px 16px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 26 }}>🏛️</span>

          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: '#fff',
              }}
            >
              Antrean Online
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.6)',
              }}
            >
              Kependudukan
            </div>
          </div>
        </div>

        <div
          style={{
            margin: '0 12px 12px',
            padding: '4px 12px',
            background: 'rgba(255,255,255,.15)',
            color: '#fff',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {isAdmin ? '🔑 Admin Panel' : '👤 Masyarakat'}
        </div>

        <nav style={{ flex: 1 }}>
          {menu.map((m) => {
            const active =
              location.pathname === m.path ||
              location.pathname.startsWith(m.path + '/');

            return (
              <Link
                key={m.path}
                to={m.path}
                onClick={() => isMobile && setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 16px',
                  color: active
                    ? '#fff'
                    : 'rgba(255,255,255,.75)',
                  textDecoration: 'none',
                  fontSize: 14,
                  background: active
                    ? 'rgba(255,255,255,.18)'
                    : 'transparent',
                  borderLeft: active
                    ? '3px solid #a5d6a7'
                    : '3px solid transparent',
                  fontWeight: active ? 700 : 400,
                }}
              >
                <span>{m.icon}</span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {m.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            margin: '8px 12px 16px',
            padding: '10px',
            background: 'rgba(255,255,255,.12)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          🚪 Keluar
        </button>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <header
          style={{
            minHeight: 60,
            background: 'rgba(255,255,255,.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,.3)',
                    display: 'flex',
            alignItems: 'center',
            padding: isMobile ? '10px 12px' : '0 20px',
            gap: 12,
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          }}
        >
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#555',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            ☰
          </button>

          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#333',
            }}
          >
            {[...menu].find((m) =>
              location.pathname.startsWith(m.path)
            )?.label ?? 'Beranda'}
          </span>

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#2e7d32',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              {user?.nama?.[0] ?? 'U'}
            </div>

            <div
              style={{
                lineHeight: 1.3,
                display: isMobile ? 'none' : 'block',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#333',
                }}
              >
                {user?.nama}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#888',
                }}
              >
                {user?.role}
              </div>
            </div>
          </div>
        </header>

        <main
          style={{
            padding: isMobile ? 12 : 24,
            flex: 1,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}