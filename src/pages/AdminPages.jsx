import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const Card = ({ children }) => (
  <div style={{ background:'#fff', borderRadius:14, padding:20, border:'1px solid #f0f0f0', marginBottom:16 }}>{children}</div>
);
const H1 = ({ t }) => <h1 style={{ fontSize:24, fontWeight:800, margin:'0 0 16px' }}>{t}</h1>;
const Btn = ({ onClick, color='#2e7d32', children, sm, disabled, type='button' }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    style={{ padding:sm?'5px 12px':'10px 20px', background:disabled?'#ccc':color, color:'#fff', border:'none', borderRadius:8, cursor:disabled?'not-allowed':'pointer', fontSize:sm?12:14, fontWeight:700, opacity:disabled?.7:1 }}>
    {children}
  </button>
);
const badge = s => {
  const m={menunggu:{bg:'#fff8e1',c:'#f57f17'},dipanggil:{bg:'#ede7f6',c:'#4527a0'},dilayani:{bg:'#e3f2fd',c:'#0d47a1'},selesai:{bg:'#e8f5e9',c:'#1b5e20'},batal:{bg:'#ffebee',c:'#b71c1c'}};
  const x=m[s]||{bg:'#f5f5f5',c:'#555'};
  return <span style={{background:x.bg,color:x.c,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700}}>{s}</span>;
};
const LS  = { display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:4 };
const INP = { padding:'9px 12px', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:14, outline:'none' };

// ── Dashboard Admin ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stat, setStat] = useState({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/antrean.php?action=realtime&tanggal=${today}`)
      .then(r => setStat(r.data.data?.statistik || {}))
      .catch(console.error);
  }, [today]);

  return (
    <div>
      <H1 t="Dashboard Admin" />
      <p style={{ color:'#888', marginTop:-12, marginBottom:16 }}>
        {new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { l:'Total Antrean', v:stat.total??0,    i:'🎫', c:'#1565c0' },
          { l:'Menunggu',      v:stat.menunggu??0,  i:'⏳', c:'#e65100' },
          { l:'Dipanggil',     v:stat.dipanggil??0, i:'📢', c:'#4527a0' },
          { l:'Selesai',       v:stat.selesai??0,   i:'✅', c:'#2e7d32' },
          { l:'Dibatalkan',    v:stat.batal??0,     i:'❌', c:'#c62828' },
        ].map(x => (
          <Card key={x.l}>
            <div style={{ fontSize:28 }}>{x.i}</div>
            <div style={{ fontSize:30, fontWeight:900, color:x.c, margin:'4px 0 2px' }}>{x.v}</div>
            <div style={{ fontSize:12, color:'#888' }}>{x.l}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Kelola Antrean ────────────────────────────────────────────────────────────
export function AdminAntrean() {
  const [list, setList]     = useState([]);
  const [petugas, setPet]   = useState([]);
  const [tanggal, setTgl]   = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLd]    = useState(false);

  const load = useCallback(async () => {
    setLd(true);
    try {
      const r = await api.get(`/antrean.php?tanggal=${tanggal}`);
      setList(r.data.data || []);
    } catch(e) { console.error(e); }
    finally { setLd(false); }
  }, [tanggal]);

  useEffect(() => {
    api.get('/petugas.php').then(r => setPet(r.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const ubahStatus = async (id, status, id_petugas) => {
    try {
      await api.patch(`/antrean.php?id=${id}&action=status`, { status, id_petugas });
      load();
    } catch(e) { alert(e.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <H1 t="Kelola Antrean" />
      <Card>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', marginBottom:16, flexWrap:'wrap' }}>
          <div>
            <label style={LS}>Tanggal</label>
            <input type="date" value={tanggal} onChange={e => setTgl(e.target.value)} style={INP} />
          </div>
          <Btn onClick={load}>🔄 Refresh</Btn>
        </div>
        {loading ? <p>Memuat...</p> : list.length === 0 ? <p style={{ color:'#888' }}>Tidak ada antrean.</p> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:700 }}>
              <thead><tr style={{ background:'#f5f5f5' }}>
                {['No.','Nama','No.HP','Layanan','Status','Petugas','Ubah Status'].map(h =>
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, whiteSpace:'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id_antrean} style={{ borderBottom:'1px solid #f0f0f0', background: a.status==='dipanggil' ? '#f9fbe7' : 'white' }}>
                    <td style={{ padding:'10px 12px', fontWeight:900, fontSize:17, color:'#2e7d32' }}>{a.nomor_antrean}</td>
                    <td style={{ padding:'10px 12px' }}>{a.nama}</td>
                    <td style={{ padding:'10px 12px' }}>{a.no_hp}</td>
                    <td style={{ padding:'10px 12px' }}>{a.nama_layanan}</td>
                    <td style={{ padding:'10px 12px' }}>{badge(a.status)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <select defaultValue="" onChange={e => ubahStatus(a.id_antrean, a.status, e.target.value)}
                        style={{ padding:'4px 8px', border:'1px solid #ddd', borderRadius:6, fontSize:13 }}>
                        <option value="">— Pilih —</option>
                        {petugas.map(p => <option key={p.id_petugas} value={p.id_petugas}>{p.nama_petugas}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {['dipanggil','dilayani','selesai','batal'].map(s => (
                          <button key={s} onClick={() => ubahStatus(a.id_antrean, s, null)}
                            disabled={a.status === s}
                            style={{ padding:'3px 8px', fontSize:11, fontWeight:700, border:'none', borderRadius:6, cursor:'pointer',
                              opacity: a.status===s ? .4 : 1,
                              background: s==='selesai'?'#e8f5e9':s==='batal'?'#ffebee':s==='dipanggil'?'#ede7f6':'#e3f2fd',
                              color: s==='selesai'?'#1b5e20':s==='batal'?'#c62828':s==='dipanggil'?'#4527a0':'#0d47a1',
                            }}>{s}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Jadwal & Kuota ────────────────────────────────────────────────────────────
export function AdminJadwal() {
  const [list, setList]       = useState([]);
  const [layanan, setLay]     = useState([]);
  const [form, setForm]       = useState({ id_layanan:'', tanggal:'', kuota:'' });
  const [editId, setEditId]   = useState(null);
  const [editKuota, setEK]    = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const reload = useCallback(() => {
    api.get('/jadwal.php').then(r => setList(r.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    reload();
    api.get('/layanan.php').then(r => setLay(r.data.data || [])).catch(console.error);
  }, [reload]);

  const add = async e => {
    e.preventDefault();
    try {
      await api.post('/jadwal.php', { id_layanan: parseInt(form.id_layanan), tanggal: form.tanggal, kuota: parseInt(form.kuota) });
      reload();
      setForm({ id_layanan:'', tanggal:'', kuota:'' });
    } catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  const edit = async id => {
    try {
      await api.put(`/jadwal.php?id=${id}`, { kuota: parseInt(editKuota) });
      reload();
      setEditId(null);
    } catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  const del = async id => {
    if (!window.confirm('Hapus jadwal?')) return;
    try { await api.delete(`/jadwal.php?id=${id}`); reload(); }
    catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <H1 t="Jadwal & Kuota" />
      <Card>
        <h3 style={{ margin:'0 0 14px', fontWeight:700 }}>Tambah Jadwal</h3>
        <form onSubmit={add} style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <label style={LS}>Layanan</label>
            <select value={form.id_layanan} onChange={set('id_layanan')} style={INP} required>
              <option value="">Pilih Layanan</option>
              {layanan.map(l => <option key={l.id_layanan} value={l.id_layanan}>{l.nama_layanan}</option>)}
            </select>
          </div>
          <div>
            <label style={LS}>Tanggal</label>
            <input type="date" value={form.tanggal} onChange={set('tanggal')} style={INP} required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label style={LS}>Kuota</label>
            <input type="number" value={form.kuota} onChange={set('kuota')} style={{ ...INP, width:80 }} required min={1} placeholder="50" />
          </div>
          <Btn type="submit">+ Tambah</Btn>
        </form>
      </Card>
      <Card>
        <h3 style={{ margin:'0 0 14px', fontWeight:700 }}>Daftar Jadwal</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead><tr style={{ background:'#f5f5f5' }}>
              {['Layanan','Tanggal','Kuota','Sisa Kuota','Aksi'].map(h =>
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map(j => (
                <tr key={j.id_jadwal} style={{ borderBottom:'1px solid #f0f0f0' }}>
                  <td style={{ padding:'10px 12px' }}>{j.nama_layanan}</td>
                  <td style={{ padding:'10px 12px' }}>{j.tanggal}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {editId === j.id_jadwal
                      ? <input type="number" value={editKuota} onChange={e => setEK(e.target.value)} style={{ width:70, padding:'4px 8px', border:'1px solid #ddd', borderRadius:6 }} />
                      : j.kuota}
                  </td>
                  <td style={{ padding:'10px 12px', color: j.sisa_kuota>0?'#2e7d32':'#c62828', fontWeight:700 }}>{j.sisa_kuota}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {editId === j.id_jadwal
                      ? <div style={{ display:'flex', gap:4 }}>
                          <Btn sm onClick={() => edit(j.id_jadwal)}>💾 Simpan</Btn>
                          <Btn sm color="#888" onClick={() => setEditId(null)}>Batal</Btn>
                        </div>
                      : <div style={{ display:'flex', gap:4 }}>
                          <Btn sm onClick={() => { setEditId(j.id_jadwal); setEK(j.kuota); }}>✏️ Edit</Btn>
                          <Btn sm color="#c62828" onClick={() => del(j.id_jadwal)}>🗑️</Btn>
                        </div>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Manajemen Layanan ─────────────────────────────────────────────────────────
export function AdminLayanan() {
  const [list, setList]     = useState([]);
  const [form, setForm]     = useState({ nama_layanan:'', deskripsi:'' });
  const [editId, setEditId] = useState(null);
  const [loading, setLd]    = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const reload = useCallback(async () => {
    try {
      const r = await api.get('/layanan.php');
      setList(r.data.data || []);
    } catch(e) { console.error(e); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const save = async e => {
    e.preventDefault();
    setLd(true);
    try {
      if (editId) await api.put(`/layanan.php?id=${editId}`, form);
      else        await api.post('/layanan.php', form);
      await reload();
      setForm({ nama_layanan:'', deskripsi:'' });
      setEditId(null);
    } catch(err) { alert(err.response?.data?.message || 'Gagal menyimpan layanan'); }
    finally { setLd(false); }
  };

  const del = async id => {
    if (!window.confirm('Hapus layanan ini?')) return;
    try { await api.delete(`/layanan.php?id=${id}`); reload(); }
    catch(err) { alert(err.response?.data?.message || 'Gagal menghapus'); }
  };

  const startEdit = l => {
    setEditId(l.id_layanan);
    setForm({ nama_layanan: l.nama_layanan, deskripsi: l.deskripsi || '' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ nama_layanan:'', deskripsi:'' });
  };

  return (
    <div>
      <H1 t="Manajemen Layanan" />

      <Card>
        <h3 style={{ margin:'0 0 14px', fontWeight:700 }}>{editId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h3>
        <form onSubmit={save}>
          <div style={{ marginBottom:12 }}>
            <label style={LS}>Nama Layanan</label>
            <input value={form.nama_layanan} onChange={set('nama_layanan')} style={{ ...INP, width:'100%', boxSizing:'border-box' }}
              required placeholder="cth: Pembuatan KTP" />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={LS}>Deskripsi</label>
            <textarea value={form.deskripsi} onChange={set('deskripsi')} rows={2}
              style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e0e0e0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none', resize:'vertical' }}
              placeholder="Deskripsi singkat layanan" />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn type="submit" disabled={loading}>{loading ? 'Menyimpan...' : editId ? '💾 Simpan Perubahan' : '+ Tambah Layanan'}</Btn>
            {editId && <Btn color="#888" onClick={cancelEdit}>Batal</Btn>}
          </div>
        </form>
      </Card>

      <Card>
        <h3 style={{ margin:'0 0 14px', fontWeight:700 }}>Daftar Layanan ({list.length})</h3>
        {list.length === 0 ? (
          <p style={{ color:'#888', fontSize:14 }}>Belum ada layanan. Tambahkan layanan di atas.</p>
        ) : list.map(l => (
          <div key={l.id_layanan} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #f5f5f5' }}>
            <div style={{ width:36, height:36, background:'#e8f5e9', color:'#2e7d32', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0 }}>
              {l.id_layanan}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{l.nama_layanan}</div>
              <div style={{ fontSize:13, color:'#888', marginTop:2 }}>{l.deskripsi || '-'}</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <Btn sm onClick={() => startEdit(l)}>✏️ Edit</Btn>
              <Btn sm color="#c62828" onClick={() => del(l.id_layanan)}>🗑️ Hapus</Btn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Manajemen Petugas ─────────────────────────────────────────────────────────
export function AdminPetugas() {
  const [list, setList]     = useState([]);
  const [form, setForm]     = useState({ nama_petugas:'', jabatan:'' });
  const [editId, setEditId] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const reload = useCallback(async () => {
    try { const r = await api.get('/petugas.php'); setList(r.data.data || []); }
    catch(e) { console.error(e); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const save = async e => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/petugas.php?id=${editId}`, form);
      else        await api.post('/petugas.php', form);
      await reload();
      setForm({ nama_petugas:'', jabatan:'' });
      setEditId(null);
    } catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  const del = async id => {
    if (!window.confirm('Hapus petugas?')) return;
    try { await api.delete(`/petugas.php?id=${id}`); reload(); }
    catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <H1 t="Manajemen Petugas" />
      <Card>
        <h3 style={{ margin:'0 0 14px', fontWeight:700 }}>{editId ? 'Edit Petugas' : 'Tambah Petugas'}</h3>
        <form onSubmit={save} style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <label style={LS}>Nama Petugas</label>
            <input value={form.nama_petugas} onChange={set('nama_petugas')} style={INP} required placeholder="Nama lengkap" />
          </div>
          <div>
            <label style={LS}>Jabatan</label>
            <input value={form.jabatan} onChange={set('jabatan')} style={INP} required placeholder="Operator" />
          </div>
          <Btn type="submit">{editId ? '💾 Simpan' : '+ Tambah'}</Btn>
          {editId && <Btn color="#888" onClick={() => { setEditId(null); setForm({ nama_petugas:'', jabatan:'' }); }}>Batal</Btn>}
        </form>
      </Card>
      <Card>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead><tr style={{ background:'#f5f5f5' }}>
            {['ID','Nama Petugas','Jabatan','Aksi'].map(h =>
              <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id_petugas} style={{ borderBottom:'1px solid #f0f0f0' }}>
                <td style={{ padding:'10px 12px', color:'#888' }}>{p.id_petugas}</td>
                <td style={{ padding:'10px 12px', fontWeight:700 }}>{p.nama_petugas}</td>
                <td style={{ padding:'10px 12px' }}>{p.jabatan}</td>
                <td style={{ padding:'10px 12px' }}>
                  <div style={{ display:'flex', gap:4 }}>
                    <Btn sm onClick={() => { setEditId(p.id_petugas); setForm({ nama_petugas:p.nama_petugas, jabatan:p.jabatan }); }}>✏️</Btn>
                    <Btn sm color="#c62828" onClick={() => del(p.id_petugas)}>🗑️</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Data Users ────────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/users.php').then(r => setList(r.data.data || [])).catch(console.error);
  }, []);

  const del = async id => {
    if (!window.confirm('Hapus user ini?')) return;
    try {
      await api.delete(`/users.php?id=${id}`);
      setList(l => l.filter(u => u.id_user != id));
    } catch(err) { alert(err.response?.data?.message || 'Gagal'); }
  };

  return (
    <div>
      <H1 t="Data Users" />
      <Card>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:600 }}>
            <thead><tr style={{ background:'#f5f5f5' }}>
              {['ID','Nama','NIK','No.HP','Email','Role','Aksi'].map(h =>
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, whiteSpace:'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id_user} style={{ borderBottom:'1px solid #f0f0f0' }}>
                  <td style={{ padding:'10px 12px', color:'#888' }}>{u.id_user}</td>
                  <td style={{ padding:'10px 12px', fontWeight:700 }}>{u.nama}</td>
                  <td style={{ padding:'10px 12px', fontSize:12, color:'#888' }}>{u.nik}</td>
                  <td style={{ padding:'10px 12px' }}>{u.no_hp}</td>
                  <td style={{ padding:'10px 12px' }}>{u.email}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ background:u.role==='admin'?'#ede7f6':'#e8f5e9', color:u.role==='admin'?'#4527a0':'#1b5e20', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    {u.role !== 'admin' && <Btn sm color="#c62828" onClick={() => del(u.id_user)}>🗑️ Hapus</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
