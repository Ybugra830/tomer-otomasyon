import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import TomerApi from '../../services/TomerApi';

export const fetchOptions = createAsyncThunk(
  'options/fetchOptions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await TomerApi.fetchAllFormOptions();
      return {
        diller: data.diller || [],
        seviyeler: data.seviyeler || [],
        subeler: data.subeler || [],
        uyruklar: data.uyruklar || [],
        indirimler: data.indirimler || [],
        sinavTurleri: data.sinavTurleri || []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  data: {
    diller: [],
    seviyeler: [],
    subeler: [],
    uyruklar: [],
    indirimler: [],
    sinavTurleri: []
  },
  loading: false,
  error: null,
};

const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Seçenekler yüklenirken bir hata oluştu';
      });
  },
});

export default optionsSlice.reducer;
