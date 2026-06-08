import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kisiselBilgiler: {
    adSoyad: '',
    tcNo: '12345678901',
    kayitTarihi: '06.05.2026',
    basvuruTipi: 'Kurs Ön Kayıt',
    email: '',
    telefon: ''
  },
  ogrenciDurumu: {
    tahminiSeviye: 'Başlangıç / Beginner',
    kesinSeviye: null,
    sinavDurumlari: {
      seviyeTespit: 'bekliyor',
      anaTest: 'kilitli',
      dinleme: 'kilitli',
      okuma: 'kilitli',
      yazma: 'kilitli'
    }
  }
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setKisiselBilgiler: (state, action) => {
      state.kisiselBilgiler = { ...state.kisiselBilgiler, ...action.payload };
    },
    setTahminiSeviye: (state, action) => {
      state.ogrenciDurumu.tahminiSeviye = action.payload;
    },
    setKesinSeviye: (state, action) => {
      state.ogrenciDurumu.kesinSeviye = action.payload;
    },
    setSinavDurumlari: (state, action) => {
      state.ogrenciDurumu.sinavDurumlari = { ...state.ogrenciDurumu.sinavDurumlari, ...action.payload };
    }
  }
});

export const { setKisiselBilgiler, setTahminiSeviye, setKesinSeviye, setSinavDurumlari } = studentSlice.actions;
export default studentSlice.reducer;
