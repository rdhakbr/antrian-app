import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    nik: '',
    no_hp: '',
    email: '',
    password: '',
  });

  const isMobile = window.innerWidth <= 768;

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      navigate(
        user.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login gagal. Periksa email dan password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth.php?action=register', form);

      alert('✅ Registrasi berhasil! Silakan login.');
      setTab('login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registrasi gagal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 32,
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 450,
          background: '#fff',
          borderRadius: isMobile ? 16 : 24,
          padding: isMobile ? 24 : 36,
          boxShadow: '0 10px 40px rgba(0,0,0,.12)',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: isMobile ? 48 : 58 }}>
            🏛️
          </div>

          <h1
            style={{
              margin: '10px 0 6px',
              color: '#1b5e20',
              fontSize: isMobile ? 22 : 26,
              fontWeight: 800,
            }}
          >
            Antrean Online
          </h1>

          <p
            style={{
              margin: 0,
              color: '#777',
              fontSize: 13,
            }}
          >
            Dinas Kependudukan & Pencatatan Sipil
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f5f5f5',
            borderRadius: 12,
            padding: 4,
            gap: 4,
            marginBottom: 20,
          }}
        >
          {['login', 'register'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setError('');
                setTab(t);
              }}
              style={{
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 10,
                padding: '11px',
                fontSize: 14,
                fontWeight:
                  tab === t ? 700 : 500,
                background:
                  tab === t
                    ? '#fff'
                    : 'transparent',
                color:
                  tab === t
                    ? '#2e7d32'
                    : '#666',
                boxShadow:
                  tab === t
                    ? '0 2px 8px rgba(0,0,0,.08)'
                    : 'none',
              }}
            >
              {t === 'login'
                ? 'Masuk'
                : 'Daftar'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: '#ffebee',
              color: '#c62828',
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Login */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <F
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="nama@email.com"
            />

            <F
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
            />

            <Btn loading={loading}>
              Masuk
            </Btn>

            <div
              style={{
                marginTop: 16,
                background: '#f7f7f7',
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: '#666',
              }}
            >
              <div>
                <b>Demo User:</b><br />
                ridho@email.com / 123456
              </div>

              <div
                style={{ marginTop: 8 }}
              >
                <b>Demo Admin:</b><br />
                admin@dukcapil.go.id /
                admin123
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <F
              label="Nama Lengkap"
              value={form.nama}
              onChange={set('nama')}
              placeholder="Nama sesuai KTP"
            />

            <F
              label="NIK"
              value={form.nik}
              onChange={set('nik')}
              placeholder="Nomor Induk Kependudukan"
            />

            <F
              label="No. HP"
              value={form.no_hp}
              onChange={set('no_hp')}
              placeholder="08xxxxxxxxxx"
            />

            <F
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="nama@email.com"
            />

            <F
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Minimal 6 karakter"
            />

            <Btn loading={loading}>
              Daftar Sekarang
            </Btn>
          </form>
        )}
      </div>
    </div>
  );
}

function F({ label, ...rest }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 700,
          color: '#555',
        }}
      >
        {label}
      </label>

      <input
        {...rest}
        required
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '1.5px solid #ddd',
          borderRadius: 10,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function Btn({ loading, children }) {
  return (
    <button
      className="btn-animate"
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: 14,
        border: 'none',
        borderRadius: 10,
        background: loading
          ? '#66bb6a'
          : '#2e7d32',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        marginTop: 4,
        transition: 'all .25s ease',
      }}
    >
      {loading
        ? '⏳ Memproses...'
        : children}
    </button>
  );
}