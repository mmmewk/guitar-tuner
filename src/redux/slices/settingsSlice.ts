import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  bufferSize: number,
  sampleRate: number,
  frameRate: number,
};

const initialState: SettingsState = {
  bufferSize: 16384,
  sampleRate: 24000,
  frameRate: 30,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setBufferSize: (state, action: PayloadAction<number>) => {
      state.bufferSize = action.payload;
    },
    setSampleRate: (state, action: PayloadAction<number>) => {
      state.sampleRate = action.payload;
    },
    setFrameRate: (state, action: PayloadAction<number>) => {
      state.frameRate = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setBufferSize,
  setFrameRate,
  setSampleRate,
} = settingsSlice.actions;

export default settingsSlice.reducer;
