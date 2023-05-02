import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  address: null,
  selectedFile : null,
  uploadedFile : null
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (state) => {
      state.connected = true;
    },
    disconnectWallet: (state) => {
      state.connected = false;
      state.address = null;
    },
    selectFile : (state,action) => {
      state.selectedFile = action.payload;
    },
    uploadFile: (state, action) => {
      state.uploadedFile = state.selectedFile;
    },
    backToStart : (state)=>{
      state.selectedFile = null;
      state.uploadedFile = null;
    }

    
  },
});

export const { connectWallet, disconnectWallet ,selectFile ,uploadFile,backToStart} = walletSlice.actions;

export default walletSlice.reducer;
