import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const badge = s => {
  const m={menunggu:{bg:'#fff8e1',c:'#f57f17'},dipanggil:{bg:'#ede7f6',c:'#4527a0'},dilayani:{bg:'#e3f2fd',c:'#0d47a1'},selesai:{bg:'#e8f5e9',c:'#1b5e20'},batal:{bg:'#ffebee',c:'#b71c1c'}};
  const x=m[s]||{bg:'#f5f5f5',c:'#555'};
  return <span style={{background:x.bg,color:x.c,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700}}>{s}</span>;
};

// ── Realtime ─────────────────────────────────────────────────────────────────
export function RealtimePage() {
  const [data,setData] = useState(null);
  const [time,setTime] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const fetch = useCallback(async () => {
    try {
      const r = await api.get(`/antrean.php?action=realtime&tanggal=${today}`);
      setData(r.data.data); setTime(new Date().toLocaleTimeString('id-ID'));
    } catch(e){ console.error(e); }
  },[today]);

  useEffect(()=>{ fetch(); const iv=setInterval(fetch,8000); return ()=>clearInterval(iv); },[fetch]);

  const sedang = data?.sedang_dilayani;
  const stat   = data?.statistik??{};

  return (
    <div style={{maxWidth:660}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
        <div><h1 style={{fontSize:24,fontWeight:800,margin:'0 0 4px'}}>Pantau Antrean</h1><p style={{color:'#888',margin:0,fontSize:13}}>Auto-refresh 8 detik</p></div>
        <div style={{textAlign:'right'}}>
          <span style={{background:'#ffebee',color:'#c62828',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700}}>● LIVE</span>
          <div style={{fontSize:11,color:'#888',marginTop:4}}>{time}</div>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#1b5e20,#2e7d32)',borderRadius:16,padding:'24px 28px',marginBottom:16}}>
        <div style={{fontSize:13,color:'rgba(255,255,255,.7)',marginBottom:8}}>🔊 Nomor Sedang Dipanggil</div>
        <div style={{fontSize:80,fontWeight:900,color:'#fff',lineHeight:1}}>{sedang?sedang.nomor_antrean:'—'}</div>
        {sedang&&<div style={{fontSize:14,color:'rgba(255,255,255,.8)',marginTop:8}}>{sedang.nama_layanan}</div>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10,marginBottom:16}}>
        {[{l:'Total',v:stat.total??0,c:'#1565c0'},{l:'Menunggu',v:stat.menunggu??0,c:'#e65100'},{l:'Selesai',v:stat.selesai??0,c:'#2e7d32'},{l:'Dibatalkan',v:stat.batal??0,c:'#c62828'}]
          .map(x=><div key={x.l} style={{background:'#fff',borderRadius:12,padding:14,textAlign:'center',border:'1px solid #f0f0f0'}}>
            <div style={{fontSize:24,fontWeight:800,color:x.c}}>{x.v}</div>
            <div style={{fontSize:12,color:'#888',marginTop:3}}>{x.l}</div>
          </div>)}
      </div>

      <div style={{background:'#fff',borderRadius:14,padding:16,border:'1px solid #f0f0f0'}}>
        <h3 style={{margin:'0 0 12px',fontWeight:700,fontSize:15}}>Daftar Antrean Hari Ini</h3>
        {!data||data.antrean.length===0?<p style={{color:'#888',fontSize:13}}>Belum ada antrean.</p>
          :data.antrean.map(a=>(
          <div key={a.id_antrean} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f5f5f5',background:a.status==='dipanggil'?'#e8f5e9':'transparent',borderRadius:6,paddingLeft:a.status==='dipanggil'?8:0}}>
            <div style={{width:44,height:44,background:a.status==='dipanggil'?'#2e7d32':a.status==='selesai'?'#c8e6c9':'#f5f5f5',color:a.status==='dipanggil'?'#fff':a.status==='selesai'?'#2e7d32':'#555',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,fontWeight:800,fontSize:15,flexShrink:0}}>{a.nomor_antrean}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{a.nama_layanan}</div></div>
            {badge(a.status)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Riwayat ──────────────────────────────────────────────────────────────────
export function RiwayatPage() {
  const [list,setList]   = useState([]);
  const [loading,setLd]  = useState(true);

  useEffect(()=>{ api.get('/antrean.php?action=saya').then(r=>setList(r.data.data)).catch(console.error).finally(()=>setLd(false)); },[]);

  const batal = async id => {
    if (!window.confirm('Batalkan antrean ini?')) return;
    try { await api.delete(`/antrean.php?id=${id}`); setList(l=>l.map(a=>a.id_antrean==id?{...a,status:'batal'}:a)); }
    catch(e){ alert(e.response?.data?.message||'Gagal'); }
  };

  return (
    <div style={{maxWidth:600}}>
      <h1 style={{fontSize:24,fontWeight:800,margin:'0 0 16px'}}>Riwayat Antrean</h1>
      {loading?<p>Memuat...</p>:list.length===0?(
        <div style={{textAlign:'center',padding:40,background:'#f9f9f9',borderRadius:16,border:'1px dashed #ccc'}}>
          <div style={{fontSize:40}}>📭</div><p style={{fontWeight:700}}>Belum ada riwayat</p>
        </div>
      ):list.map(a=>(
        <div key={a.id_antrean} style={{background:'#fff',borderRadius:12,padding:16,border:'1px solid #f0f0f0',marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontSize:28,fontWeight:900,color:'#2e7d32'}}>#{a.nomor_antrean}</div>
            <div>{badge(a.status)}</div>
          </div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{a.nama_layanan}</div>
          <div style={{fontSize:13,color:'#888'}}>📅 {a.tanggal}</div>
          {a.nama_petugas&&<div style={{fontSize:13,color:'#888'}}>👤 Dilayani: {a.nama_petugas}</div>}
          {['menunggu','dipanggil'].includes(a.status)&&(
            <button onClick={()=>batal(a.id_antrean)} style={{marginTop:10,padding:'6px 14px',background:'#ffebee',color:'#c62828',border:'1px solid #ef9a9a',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:700}}>Batalkan</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Profil ────────────────────────────────────────────────────────────────────
export function ProfilPage() {
  const [form,setForm] = useState({nama:'',nik:'',no_hp:'',email:''});
  const [msg,setMsg]   = useState('');
  const [loading,setLd]= useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{ api.get('/auth.php?action=me').then(r=>setForm(r.data.data)).catch(console.error); },[]);

  const save = async e => {
    e.preventDefault(); setMsg(''); setLd(true);
    try { await api.put('/auth.php?action=profile', form); setMsg('✅ Profil berhasil diperbarui'); }
    catch(err){ setMsg('❌ '+(err.response?.data?.message||'Gagal')); }
    finally { setLd(false); }
  };

  return (
    <div style={{maxWidth:500}}>
      <h1 style={{fontSize:24,fontWeight:800,margin:'0 0 16px'}}>Profil Saya</h1>
      <div style={{background:'#fff',borderRadius:16,padding:24,border:'1px solid #f0f0f0'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,paddingBottom:20,borderBottom:'1px solid #f0f0f0'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'#2e7d32',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800}}>{form.nama?.[0]??'U'}</div>
          <div><div style={{fontWeight:800,fontSize:18}}>{form.nama}</div><div style={{fontSize:13,color:'#888'}}>NIK: {form.nik}</div></div>
        </div>
        {msg&&<div style={{padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:16,background:msg.startsWith('✅')?'#e8f5e9':'#ffebee',color:msg.startsWith('✅')?'#1b5e20':'#c62828'}}>{msg}</div>}
        <form onSubmit={save}>
          {[['Nama Lengkap','nama','text'],['Nomor HP','no_hp','text'],['Email','email','email']].map(([l,k,t])=>(
            <div key={k} style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:'#555',marginBottom:5}}>{l}</label>
              <input type={t} value={form[k]||''} onChange={set(k)} required style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box'}}/>
            </div>
          ))}
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:700,color:'#555',marginBottom:5}}>NIK (tidak dapat diubah)</label>
            <input value={form.nik||''} readOnly style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:14,boxSizing:'border-box',background:'#fafafa'}}/>
          </div>
          <button type="submit" disabled={loading} style={{padding:'10px 24px',background:'#2e7d32',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
            {loading?'Menyimpan...':'💾 Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
