import { useEffect, useState } from 'react';
import api from '../api/axios';

const ICON = { 'Pembuatan KTP':'🪪', 'Perpanjangan SIM':'🚗', 'Kartu Keluarga':'👨‍👩‍👧' };

export default function BookingPage() {
  const [step, setStep]       = useState(1);
  const [layanan, setLayanan] = useState([]);
  const [jadwal, setJadwal]   = useState([]);
  const [selLay, setSelLay]   = useState(null);
  const [selJad, setSelJad]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/layanan.php').then(r => setLayanan(r.data.data)).catch(console.error);
  }, []);

  const loadJadwal = async (l) => {
    setSelLay(l); setSelJad(null); setJadwal([]);
    try {
      const r = await api.get(`/jadwal.php?id_layanan=${l.id_layanan}`);
      setJadwal(r.data.data);
    } catch (e) { console.error(e); }
    setStep(2);
  };

  const handleBook = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.post('/antrean.php', { id_layanan: selLay.id_layanan, id_jadwal: selJad.id_jadwal });
      setResult(r.data.data); setStep(4);
    } catch (e) { setError(e.response?.data?.message || 'Gagal mengambil antrean'); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(1); setSelLay(null); setSelJad(null); setJadwal([]); setResult(null); setError(''); };

  const steps = ['Pilih Layanan','Pilih Jadwal','Konfirmasi','Selesai'];

  return (
    <div style={{ maxWidth:580 }}>
      <h1 style={{ fontSize:24,fontWeight:800,margin:'0 0 16px' }}>Ambil Nomor Antrean</h1>

      {/* Step bar */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:20, flexWrap:'wrap' }}>
        {steps.map((s,i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:step>i+1?'#2e7d32':step===i+1?'#2e7d32':'#e0e0e0',color:step>=i+1?'#fff':'#aaa',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800 }}>
              {step>i+1?'✓':i+1}
            </div>
            <span style={{ fontSize:12,color:step===i+1?'#2e7d32':'#aaa',fontWeight:step===i+1?700:400 }}>{s}</span>
            {i<3&&<div style={{width:16,height:1,background:'#e0e0e0'}}/>}
          </div>
        ))}
      </div>

      {error && <div style={{ background:'#ffebee',color:'#c62828',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:14 }}>{error}</div>}

      <div style={{ background:'#fff',borderRadius:16,padding:20,boxShadow:'0 1px 8px rgba(0,0,0,.06)',border:'1px solid #f0f0f0' }}>

        {/* Step 1 */}
        {step===1 && <>
          <h2 style={{ fontSize:17,fontWeight:800,margin:'0 0 16px' }}>Pilih Jenis Layanan</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:12 }}>
            {layanan.map(l => (
              <div key={l.id_layanan} onClick={() => loadJadwal(l)} style={{ border:'2px solid #e8ecef',borderRadius:12,padding:16,cursor:'pointer',textAlign:'center',transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#2e7d32'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#e8ecef'}>
                <div style={{ fontSize:32 }}>{ICON[l.nama_layanan]||'📄'}</div>
                <div style={{ fontWeight:700,fontSize:14,marginTop:8 }}>{l.nama_layanan}</div>
                <div style={{ fontSize:12,color:'#777',marginTop:4 }}>{l.deskripsi}</div>
              </div>
            ))}
          </div>
        </>}

        {/* Step 2 */}
        {step===2 && <>
          <Back onClick={()=>setStep(1)}/>
          <h2 style={{ fontSize:17,fontWeight:800,margin:'0 0 6px' }}>Pilih Jadwal</h2>
          <p style={{ fontSize:13,color:'#666',margin:'0 0 16px' }}>Layanan: <b>{selLay.nama_layanan}</b></p>
          {jadwal.length===0 ? <p style={{ color:'#888',textAlign:'center',padding:20 }}>Belum ada jadwal tersedia.</p>
            : jadwal.map(j => {
              const sisa  = j.sisa_kuota;
              const habis = sisa <= 0;
              const aktif = selJad?.id_jadwal === j.id_jadwal;
              return (
                <div key={j.id_jadwal} onClick={() => !habis && setSelJad(j)}
                  style={{ border: aktif?'2px solid #2e7d32':'1.5px solid #e8ecef', background: aktif?'#e8f5e9':'#fff', borderRadius:10,padding:'14px 16px',marginBottom:8,cursor:habis?'not-allowed':'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',opacity:habis?.5:1 }}>
                  <div>
                    <div style={{ fontWeight:700 }}>📅 {j.tanggal}</div>
                    <div style={{ fontSize:12,color:habis?'#c62828':'#2e7d32',marginTop:4 }}>{habis?'🔴 Kuota Penuh':`🟢 ${sisa} kuota tersisa`}</div>
                  </div>
                  <div style={{ fontSize:13,color:'#888' }}>Kuota: {j.kuota}</div>
                </div>
              );
            })
          }
          <button style={{ width:'100%',padding:13,background:selJad?'#2e7d32':'#ccc',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:800,cursor:selJad?'pointer':'not-allowed',marginTop:12 }} disabled={!selJad} onClick={()=>setStep(3)}>Lanjut →</button>
        </>}

        {/* Step 3 */}
        {step===3 && <>
          <Back onClick={()=>setStep(2)}/>
          <h2 style={{ fontSize:17,fontWeight:800,margin:'0 0 16px' }}>Konfirmasi Antrean</h2>
          <div style={{ border:'1px solid #f0f0f0',borderRadius:10,padding:'4px 16px',marginBottom:16 }}>
            {[['Layanan',selLay.nama_layanan],['Tanggal',selJad.tanggal],['Sisa Kuota',`${selJad.sisa_kuota} tempat`]].map(([l,v])=>(
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid #f8f8f8' }}>
                <span style={{ fontSize:13,color:'#888' }}>{l}</span>
                <span style={{ fontSize:13,fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'#e3f2fd',color:'#1565c0',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16 }}>ℹ️ Hadir tepat waktu dan bawa dokumen asli.</div>
          <button style={{ width:'100%',padding:13,background:'#2e7d32',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer',opacity:loading?.7:1 }} disabled={loading} onClick={handleBook}>
            {loading?'⏳ Memproses...':'✅ Ambil Nomor Antrean'}
          </button>
        </>}

        {/* Step 4 */}
        {step===4&&result&&(
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56 }}>🎉</div>
            <h2 style={{ color:'#2e7d32',margin:'8px 0' }}>Berhasil!</h2>
            <div style={{ background:'linear-gradient(135deg,#1b5e20,#2e7d32)',borderRadius:16,padding:28,margin:'16px 0' }}>
              <div style={{ fontSize:12,color:'rgba(255,255,255,.75)',marginBottom:4 }}>Nomor Antrean Anda</div>
              <div style={{ fontSize:80,fontWeight:900,color:'#fff',lineHeight:1 }}>{result.nomor_antrean}</div>
              <div style={{ fontSize:14,color:'rgba(255,255,255,.85)',marginTop:10 }}>{result.nama_layanan}</div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,.7)',marginTop:4 }}>📅 {result.tanggal}</div>
            </div>
            <button onClick={reset} style={{ width:'100%',padding:13,background:'#2e7d32',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:800,cursor:'pointer' }}>Ambil Antrean Lain</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Back({ onClick }) {
  return <button onClick={onClick} style={{ background:'none',border:'none',color:'#2e7d32',cursor:'pointer',fontSize:13,fontWeight:700,padding:'0 0 12px',display:'block' }}>← Kembali</button>;
}
