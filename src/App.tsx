/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1YvkYGynLeXFkk9ITB5RV5Xq4LFmOmvls";

interface Peserta {
  nama: string;
  nip: string;
  pangkat: string;
  jabatan: string;
  unitKerja: string;
  keterangan: string;
}

function buildFileName(formData: any, kepadaMode: string, pesertaList: Peserta[]) {
  const nomorRaw = formData.nomor ? formData.nomor.replace(/\//g, '-') : 'XXX';
  const kode = `ST-B-${nomorRaw}-15000-KP311-2026`;
  let subjek = '';
  if (kepadaMode === 'personal') {
    subjek = formData.nama ? formData.nama.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').substring(0, 40) : 'Pegawai';
  } else {
    const first = pesertaList[0]?.nama;
    const slug = first ? first.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').substring(0, 30) : 'Peserta';
    const more = pesertaList.length > 1 ? `+${pesertaList.length - 1}` : '';
    subjek = slug + more;
  }
  return `${kode}_${subjek}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'hal1' | 'hal2'>('hal1');
  const [kepadaMode, setKepadaMode] = useState<'personal' | 'lampiran'>('personal');
  const [showKeterangan, setShowKeterangan] = useState(false);
  
  const [formData, setFormData] = useState({
    nomor: '',
    menimbang: '',
    nama: '',
    nip: '',
    pangkat: '',
    jabatan: '',
    unitKerja: '',
    untuk: '',
    waktu: '',
    tempat: 'Jambi',
    tanggal: '',
    pejabat: 'Aidil Adha', // Default without titles as requested
    lampiranJudul: 'Daftar Nama Peserta Pelatihan',
    lampiranSubjudul: '',
  });

  const [pesertaList, setPesertaList] = useState<Peserta[]>([
    { nama: '', nip: '', pangkat: '', jabatan: '', unitKerja: '', keterangan: '' }
  ]);

  // Auto-numbering logic
  useEffect(() => {
    const lastNum = localStorage.getItem('last_st_number');
    const lastYear = localStorage.getItem('last_st_year');
    const currentYear = new Date().getFullYear().toString();
    
    if (lastYear !== currentYear) {
      setFormData(prev => ({ ...prev, nomor: '001' }));
      localStorage.setItem('last_st_year', currentYear);
      localStorage.setItem('last_st_number', '001');
    } else if (lastNum && !formData.nomor) {
      setFormData(prev => ({ ...prev, nomor: lastNum }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'nomor') {
      localStorage.setItem('last_st_number', value);
    }
  };

  const updatePeserta = (idx: number, field: keyof Peserta, value: string) => {
    const newList = [...pesertaList];
    newList[idx][field] = value;
    setPesertaList(newList);
  };

  const tambahPeserta = () => {
    setPesertaList([...pesertaList, { nama: '', nip: '', pangkat: '', jabatan: '', unitKerja: '', keterangan: '' }]);
  };

  const hapusPeserta = (idx: number) => {
    if (pesertaList.length === 1) {
      alert('Minimal harus ada 1 peserta.');
      return;
    }
    const newList = pesertaList.filter((_, i) => i !== idx);
    setPesertaList(newList);
  };

  const handlePrint = () => {
    const prevTitle = document.title;
    document.title = buildFileName(formData, kepadaMode, pesertaList);
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 1000);
  };

  const sendWA = () => {
    const nomor = `B-${formData.nomor}`;
    const nama = kepadaMode === 'personal' ? formData.nama : 'Daftar Terlampir';
    const phone = "6285123174464";
    const text = `*SURAT TUGAS BARU*\n\nNomor: ${nomor}/15000/KP.311/2026\nKepada: ${nama}\n\nMohon dicek.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const incrementNomor = () => {
    const current = formData.nomor;
    // Handle sisipan like 101.1
    if (current.includes('.')) {
      const parts = current.split('.');
      const lastPart = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastPart)) {
        parts[parts.length - 1] = (lastPart + 1).toString();
        const next = parts.join('.');
        setFormData(prev => ({ ...prev, nomor: next }));
        localStorage.setItem('last_st_number', next);
        return;
      }
    }
    
    const num = parseInt(current);
    if (!isNaN(num)) {
      const next = (num + 1).toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, nomor: next }));
      localStorage.setItem('last_st_number', next);
    } else {
      setFormData(prev => ({ ...prev, nomor: '001' }));
      localStorage.setItem('last_st_number', '001');
    }
  };

  const nomorFull = formData.nomor ? `B-${formData.nomor}/15000/KP.311/2026` : '...';

  return (
    <div className="flex flex-col md:flex-row gap-5 w-full max-w-7xl mx-auto p-4 justify-center items-start">
      {/* ======== PANEL INPUT ======== */}
      <div className="no-print container-panel">
        <div className="form-section">
          <div className="header-form">
            <h3>Surat Tugas</h3>
            <p>Isi data di bawah ini, preview akan otomatis berubah.</p>
          </div>

          {/* TAB NAVIGATION */}
          <div className="tab-nav">
            <button 
              className={`tab-btn ${activeTab === 'hal1' ? 'active' : ''}`} 
              onClick={() => setActiveTab('hal1')}
            >
              📄 Halaman 1
            </button>
            <button 
              className={`tab-btn ${activeTab === 'hal2' ? 'active' : ''}`} 
              onClick={() => setActiveTab('hal2')}
            >
              📋 Lampiran
            </button>
          </div>

          {/* TAB HALAMAN 1 */}
          <div className={`tab-content ${activeTab === 'hal1' ? 'active' : ''}`}>
            <div className="form-group">
              <label>Nomor Surat (Bagian Depan)</label>
              <div className="flex gap-2">
                <div className="flex items-center bg-gray-100 px-2 border border-r-0 rounded-l text-sm font-bold">B-</div>
                <input type="text" id="nomor" value={formData.nomor} onChange={handleInputChange} className="!rounded-l-none !rounded-r-none" placeholder="001" />
                <button onClick={incrementNomor} className="bg-blue-500 text-white px-3 rounded-r text-sm font-bold" title="Nomor Berikutnya">+</button>
              </div>
              <small>Format: B-[Input]/15000/KP.311/2026</small>
            </div>
            <div className="form-group">
              <label>Menimbang</label>
              <textarea id="menimbang" rows={5} value={formData.menimbang} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
              <label>Kepada</label>
              <select id="kepada-mode" value={kepadaMode} onChange={(e) => setKepadaMode(e.target.value as any)}>
                <option value="personal">Satu Orang (Nama Pegawai)</option>
                <option value="lampiran">Daftar Terlampir</option>
              </select>
            </div>
            
            {kepadaMode === 'personal' && (
              <div id="kepada-personal">
                <div className="form-group">
                  <label>Nama Pegawai</label>
                  <input type="text" id="nama" value={formData.nama} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>NIP</label>
                  <input type="text" id="nip" value={formData.nip} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Pangkat / Golongan</label>
                  <input type="text" id="pangkat" value={formData.pangkat} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Jabatan</label>
                  <input type="text" id="jabatan" value={formData.jabatan} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Unit Kerja</label>
                  <input type="text" id="unitKerja" value={formData.unitKerja} onChange={handleInputChange} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Untuk (Tugas)</label>
              <textarea id="untuk" rows={3} value={formData.untuk} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
              <label>Waktu Pelaksanaan</label>
              <textarea id="waktu" rows={3} value={formData.waktu} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
              <label>Tempat Penetapan</label>
              <input type="text" id="tempat" value={formData.tempat} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Tanggal Penetapan</label>
              <input type="text" id="tanggal" value={formData.tanggal} onChange={handleInputChange} placeholder="cth: 1 Januari 2026" />
            </div>
            <div className="form-group">
              <label>Nama Kepala (Penanda Tangan)</label>
              <input type="text" id="pejabat" value={formData.pejabat} onChange={handleInputChange} />
            </div>
          </div>

          {/* TAB LAMPIRAN */}
          <div className={`tab-content ${activeTab === 'hal2' ? 'active' : ''}`}>
            <div className="form-group">
              <label>Judul Lampiran</label>
              <input type="text" id="lampiranJudul" value={formData.lampiranJudul} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Sub Judul (opsional)</label>
              <input type="text" id="lampiranSubjudul" value={formData.lampiranSubjudul} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showKeterangan} onChange={(e) => setShowKeterangan(e.target.checked)} />
                <span className="text-xs">Tampilkan Kolom <b>Keterangan</b></span>
              </label>
            </div>

            <div id="peserta-list">
              {pesertaList.map((p, i) => (
                <div key={i} className="peserta-row">
                  <div className="row-num">Peserta {i + 1}</div>
                  <button className="btn-hapus" onClick={() => hapusPeserta(i)}>✕ Hapus</button>
                  <label className="lbl-field">Nama</label>
                  <input type="text" value={p.nama} placeholder="Nama lengkap" onChange={(e) => updatePeserta(i, 'nama', e.target.value)} />
                  <label className="lbl-field">NIP</label>
                  <input type="text" value={p.nip} placeholder="NIP" onChange={(e) => updatePeserta(i, 'nip', e.target.value)} />
                  <label className="lbl-field">Pangkat / Golongan</label>
                  <input type="text" value={p.pangkat} placeholder="cth: Penata Muda (III/a)" onChange={(e) => updatePeserta(i, 'pangkat', e.target.value)} />
                  <label className="lbl-field">Jabatan</label>
                  <input type="text" value={p.jabatan} placeholder="Jabatan" onChange={(e) => updatePeserta(i, 'jabatan', e.target.value)} />
                  <label className="lbl-field">Unit Kerja</label>
                  <input type="text" value={p.unitKerja} placeholder="Unit Kerja" onChange={(e) => updatePeserta(i, 'unitKerja', e.target.value)} />
                  {showKeterangan && (
                    <div>
                      <label className="lbl-field">Keterangan</label>
                      <textarea
                        rows={2}
                        value={p.keterangan}
                        placeholder="Keterangan"
                        onChange={(e) => updatePeserta(i, 'keterangan', e.target.value)}
                        className="w-full border p-1.5 text-xs resize-none rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={tambahPeserta} className="btn-add">➕ Tambah Peserta</button>
          </div>

          <div className="btn-area">
            <button onClick={handlePrint} className="btn-print">🖨️ Cetak / Simpan PDF</button>
            <button onClick={sendWA} className="btn-wa">📱 Kirim WA</button>
            <button onClick={() => window.open(DRIVE_FOLDER_URL, '_blank')} className="btn-arsip">📁 Kirim Arsip</button>
          </div>
        </div>
      </div>

      {/* ============================ PREVIEW AREA ============================= */}
      <div className="flex flex-col gap-5 preview-container">
        {/* HALAMAN 1 - SURAT TUGAS */}
        <div className="paper" id="halaman1">
          <div className="kop">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/Lambang_Badan_Pusat_Statistik_%28BPS%29_Indonesia.svg" alt="Logo BPS" referrerPolicy="no-referrer" />
            <div className="kop-text">
              <h2>BADAN PUSAT STATISTIK<br />PROVINSI JAMBI</h2>
            </div>
          </div>

          <div className="judul">
            <h3>SURAT TUGAS</h3>
            <p>Nomor {nomorFull}</p> 
          </div>

          <table className="main-table">
            <tbody>
              <tr>
                <td className="col-label">Menimbang</td>
                <td className="col-sep">:</td>
                <td className="col-content text-justify">
                  <span>{formData.menimbang || '...'}</span>
                </td>
              </tr>
              <tr>
                <td className="col-label">Mengingat</td>
                <td className="col-sep">:</td>
                <td className="col-content">
                  <ul className="list-uu">
                    <li><span>1.</span><span>Undang-Undang Republik Indonesia Nomor 16 Tahun 1997 tentang Statistik;</span></li>
                    <li><span>2.</span><span>Peraturan Pemerintah Nomor 51 Tahun 1999 tentang Penyelenggaraan Statistik;</span></li>
                    <li><span>3.</span><span>Peraturan Presiden Nomor 86 Tahun 2007 tentang Badan Pusat Statistik;</span></li>
                    <li><span>4.</span><span>Peraturan Badan Pusat Statistik Nomor 2 Tahun 2025 tentang Organisasi dan Tata Kerja Badan Pusat Statistik;</span></li>
                    <li><span>5.</span><span>Peraturan Badan Pusat Statistik Nomor 3 Tahun 2025 tentang Organisasi dan Tata Kerja Badan Pusat Statistik Provinsi dan Kabupaten/Kota;</span></li>
                    <li><span>6.</span><span>Peraturan Menteri Keuangan Nomor 49 Tahun 2023 tentang Standar Biaya Masukan;</span></li>
                    <li><span>7.</span><span>Peraturan Badan Pusat Statistik Nomor 1 Tahun 2023 tentang Tata Naskah Dinas.</span></li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="sub-judul">Menugaskan</div>

          <table className="main-table">
            <tbody>
              {kepadaMode === 'personal' ? (
                <tr>
                  <td className="col-label">Kepada</td>
                  <td className="col-sep">:</td>
                  <td className="col-content">
                    <table className="inner-table">
                      <tbody>
                        <tr><td className="lbl-inner">Nama</td><td>: <span>{formData.nama || '...'}</span></td></tr>
                        <tr><td className="lbl-inner">NIP</td><td>: <span>{formData.nip || '...'}</span></td></tr>
                        <tr><td className="lbl-inner">Pangkat / Gol.</td><td>: <span>{formData.pangkat || '...'}</span></td></tr>
                        <tr><td className="lbl-inner">Jabatan</td><td>: <span>{formData.jabatan || '...'}</span></td></tr>
                        <tr><td className="lbl-inner">Unit Kerja</td><td>: <span>{formData.unitKerja || '...'}</span></td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="col-label">Kepada</td>
                  <td className="col-sep">:</td>
                  <td className="col-content">Daftar Terlampir</td>
                </tr>
              )}

              <tr>
                <td className="col-label">Untuk</td>
                <td className="col-sep">:</td>
                <td className="col-content text-justify"><span>{formData.untuk || '...'}</span></td>
              </tr>
              <tr>
                <td className="col-label">Waktu</td>
                <td className="col-sep">:</td>
                <td className="col-content text-justify whitespace-pre-line"><span>{formData.waktu || '...'}</span></td>
              </tr>
            </tbody>
          </table>

          <div className="ttd-area">
            <div className="ttd-content">
              <div className="ttd-date">
                <span>{formData.tempat || 'Jambi'}</span>,&nbsp;<span>{formData.tanggal || '...'}</span>
              </div>
              <div className="ttd-jabatan">Kepala Badan Pusat Statistik<br />Provinsi Jambi</div>
              <div className="h-20"></div>
              <div className="ttd-nama">{formData.pejabat || 'Aidil Adha'}</div>
            </div>
          </div>
        </div>

        {/* HALAMAN 2 - LAMPIRAN */}
        <div className="paper page-break" id="halaman2">
          <div className="lampiran-header">
            <table className="lampiran-meta">
              <tbody>
                <tr>
                  <td className="lm-label">Lampiran Surat</td>
                  <td className="lm-sep">:</td>
                  <td>Nomor <span>{nomorFull}</span></td>
                </tr>
                <tr>
                  <td className="lm-label">Tanggal</td>
                  <td className="lm-sep">:</td>
                  <td><span>{formData.tanggal || '...'}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="lampiran-judul-wrap">
            <div className="lampiran-judul-text">{formData.lampiranJudul || 'Daftar Nama Peserta Pelatihan'}</div>
            <div className="lampiran-subjudul-text">{formData.lampiranSubjudul}</div>
          </div>

          <table className="tabel-peserta" id="tabel-peserta">
            <thead>
              <tr>
                <th className="th-no">No.</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Pangkat/<br />Golongan</th>
                <th>Jabatan</th>
                <th>Unit<br />Kerja</th>
                {showKeterangan && <th className="th-keterangan">Keterangan</th>}
              </tr>
            </thead>
            <tbody>
              {pesertaList.map((p, i) => (
                <tr key={i}>
                  <td className="td-no">{i + 1}</td>
                  <td>{p.nama || '...'}</td>
                  <td>{p.nip || '...'}</td>
                  <td>{p.pangkat || '...'}</td>
                  <td>{p.jabatan || '...'}</td>
                  <td>{p.unitKerja || '...'}</td>
              {showKeterangan && (
                  <td className="whitespace-pre-line">
              {p.keterangan}
            </td>
           )}
        </tr>
     ))}
            </tbody>
          </table>

          <div className="ttd-area !mt-12">
            <div className="ttd-content">
              <div className="h-24"></div>
              <div className="ttd-nama">{formData.pejabat || 'Aidil Adha'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
