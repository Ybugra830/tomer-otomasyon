import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  instructorInfo: {
    adSoyad: 'Dr. Ahmet Yılmaz',
    unvan: 'Kıdemli Eğitmen',
    email: 'ahmet.yilmaz@tomer.edu.tr'
  },
  students: [
    { id: 1, name: 'Yaşar Buğra Erbay', level: 'B1', successRate: 85, lastExam: 'Okuma', lastExamScore: 90 },
    { id: 2, name: 'Ayşe Kaya', level: 'A2', successRate: 70, lastExam: 'Dinleme', lastExamScore: 65 },
    { id: 3, name: 'John Doe', level: 'A1', successRate: 95, lastExam: 'Gramer', lastExamScore: 100 },
    { id: 4, name: 'Fatma Demir', level: 'B2', successRate: 88, lastExam: 'Yazma', lastExamScore: 80 }
  ],
  assignedMaterials: []
};

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    assignMaterial: (state, action) => {
      // action.payload: { studentId, studentName, type, title, description, fileOrLink, date }
      state.assignedMaterials.push(action.payload);
    }
  }
});

export const { assignMaterial } = instructorSlice.actions;
export default instructorSlice.reducer;
