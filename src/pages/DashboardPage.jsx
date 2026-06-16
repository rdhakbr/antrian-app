import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();

  const [riwayat, setRiwayat] = useState([]);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    fetchAll();

    const iv = setInterval(fetchRT, 10000);

    return () => clearInterval(iv);
  }, []);

  const fetchAll = async () => {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/antrean.php?action=saya'),
        api.get(`/antrean.php?action=realtime&tanggal=${today}`),
      ]);

      setRiwayat(r1.data.data);
      setRealtime(r2.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRT = async () => {
    try {
      const r = await api.get(
        `/antrean.php?action=realtime&tanggal=${today}`
      );

      setRealtime(r.data.data);
    } catch (_) {}
  };

  const aktif = riwayat.find(
    (a) =>
      a.tanggal === today &&
      !['selesai', 'batal'].includes(a.status)
  );

  const stat = realtime?.statistik ?? {};
  const sedang = realtime?.sedang_dilayani;

  const badge = (s) => {
    const m = {
      menunggu: {
        bg: '#fff8e1',
        c: '#f57f17',
      },
      dipanggil: {
        bg: '#ede7f6',
        c: '#4527a0',
      },
      dilayani: {
        bg: '#e3f2fd',
        c: '#0d47a1',
      },
      selesai: {
        bg: '#e8f5e9',
        c: '#1b5e20',
      },
      batal: {
        bg: '#ffebee',
        c: '#b71c1c',
      },
    };

    const x = m[s] || {
      bg: '#f5f5f5',
      c: '#555',
    };

    return (
      <span
        style={{
          background: x.bg,
          color: x.c,
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {s}
      </span>
    );
  };

  return (
    <div
      className="fade-in"
    style={{
      maxWidth: 700,
      width: '100%',
      margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          margin: '0 0 4px',
        }}
      >
        Selamat datang, {user?.nama?.split(' ')[0]}! 👋
      </h1>

      <p
        style={{
          color: '#888',
          margin: '0 0 20px',
          fontSize: 13,
        }}
      >
        {new Date().toLocaleDateString(
          'id-ID',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )}
      </p>

    {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
            }}
          >
            <div className="spinner"></div>
          </div>
        ) : (
        <>
          {aktif ? (
            <div
              style={{
                background:
                  'linear-gradient(135deg,#1b5e20,#2e7d32)',
                borderRadius: 16,
                padding: isMobile
                  ? 18
                  : '24px 28px',
                marginBottom: 16,
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      'rgba(255,255,255,.7)',
                    marginBottom: 4,
                  }}
                >
                  Nomor Antrean Anda
                </div>

                <div
                  style={{
                    fontSize: isMobile
                      ? 42
                      : 64,
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1,
                  }}
                >
                  {aktif.nomor_antrean}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color:
                      'rgba(255,255,255,.85)',
                    marginTop: 6,
                  }}
                >
                  {aktif.nama_layanan}
                </div>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  {badge(aktif.status)}
                </div>
              </div>

              {sedang && (
                <div
                  style={{
                    borderLeft: isMobile
                      ? 'none'
                      : '1px solid rgba(255,255,255,.25)',
                    paddingLeft: isMobile
                      ? 0
                      : 24,
                    paddingTop: isMobile
                      ? 12
                      : 0,
                    width: isMobile
                      ? '100%'
                      : 'auto',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        'rgba(255,255,255,.7)',
                    }}
                  >
                    Sedang Dipanggil
                  </div>

                  <div
                    style={{
                      fontSize: isMobile
                        ? 28
                        : 40,
                      fontWeight: 900,
                      color: '#fff',
                    }}
                  >
                    {sedang.nomor_antrean}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#777',
                      fontWeight: 500,
                      marginTop: 4,
                    }}
                  >
                    {sedang.nama_layanan}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: '#f9f9f9',
                border:
                  '1px dashed #ccc',
                borderRadius: 16,
                padding: 28,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                }}
              >
                🎫
              </div>

              <p
                style={{
                  fontWeight: 700,
                  margin:
                    '8px 0 6px',
                }}
              >
                Tidak ada antrean aktif
                hari ini
              </p>

              <Link
                to="/booking"
                style={{
                  color: '#2e7d32',
                  fontWeight: 700,
                  textDecoration:
                    'none',
                  fontSize: 14,
                }}
              >
                → Ambil Nomor Antrean
              </Link>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                isMobile
                  ? 'repeat(2,1fr)'
                  : 'repeat(auto-fit,minmax(130px,1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              {
                l: 'Total',
                v: stat.total ?? 0,
                i: '🎫',
                c: '#1565c0',
              },
              {
                l: 'Menunggu',
                v: stat.menunggu ?? 0,
                i: '⏳',
                c: '#e65100',
              },
              {
                l: 'Selesai',
                v: stat.selesai ?? 0,
                i: '✅',
                c: '#2e7d32',
              },
              {
                l: 'Dibatalkan',
                v: stat.batal ?? 0,
                i: '❌',
                c: '#c62828',
              },
            ].map((x) => (
              <div
                key={x.l}
                className="card-hover slide-up"
                style={{
                  background: 'linear-gradient(180deg,#ffffff,#fafafa)',
                  borderRadius: 16,
                  padding: 18,
                  textAlign: 'center',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'all .25s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                }}
>
                <div
                  style={{
                    fontSize: 28,
                    marginBottom: 4,
                  }}
                >
                  {x.i}
                </div>

                <div
                  style={{
                    fontSize: isMobile ? 24 : 28,
                    fontWeight: 800,
                    color: x.c,
                    margin:
                      '4px 0 2px',
                  }}
                >
                  {x.v}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#888',
                  }}
                >
                  {x.l}
                </div>
              </div>
            ))}
          </div>

          {riwayat.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 16,
                border:
                  '1px solid #f0f0f0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  Riwayat Terakhir
                </h3>

                <Link
                  to="/riwayat"
                  style={{
                    fontSize: 13,
                    color: '#2e7d32',
                    textDecoration:
                      'none',
                    fontWeight: 600,
                  }}
                >
                  Lihat Semua →
                </Link>
              </div>

              {riwayat
                .slice(0, 4)
                .map((a) => (
                  <div
                    key={
                      a.id_antreanclassName="card-hover"
                      
                    }
                    style={{
                      display:
                        'flex',
                      flexWrap:
                        'wrap',
                      alignItems:
                        'center',
                      gap: 12,
                      padding:
                        '10px 0',
                      borderBottom:
                        '1px solid #f5f5f5',
                    }}
                  >
                    <div
                      style={{
                        background:
                          '#e8f5e9',
                        color:
                          '#1b5e20',
                        fontWeight: 800,
                        fontSize: 16,
                        padding:
                          '4px 10px',
                        borderRadius: 8,
                        minWidth: 70,
                        textAlign:
                          'center',
                      }}
                    >
                      #
                      {
                        a.nomor_antrean
                      }
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {
                          a.nama_layanan
                        }
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color:
                            '#888',
                        }}
                      >
                        {a.tanggal}
                      </div>
                    </div>

                    {badge(
                      a.status
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
