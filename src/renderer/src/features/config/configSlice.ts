import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConfigState {
  serverAddressURL: string
  unisonAddressURL: string
  realSenseAddressURL: string
  casPD2AddressURL: string
  manifestAddressURL: string
  detectParcelURL: string
  parcels: any[]
}

const initialState: ConfigState = {
  serverAddressURL: 'http://localhost:8000',
  unisonAddressURL: 'http://localhost:7070', // camera
  realSenseAddressURL: 'http://localhost:6060', // dimensions
  casPD2AddressURL: 'http://localhost:3030', // weight
  manifestAddressURL: 'http://localhost:4040', // sender & receiver
  detectParcelURL: 'https://orc.poc.viana.ai/webhook/sali-dev',
  parcels: []
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    replaceConfig(_state, action: PayloadAction<ConfigState>) {
      return action.payload
    },
    setServerAddressURL(state, action: PayloadAction<string>) {
      state.serverAddressURL = action.payload
    },
    setUnisonAddressURL(state, action: PayloadAction<string>) {
      state.unisonAddressURL = action.payload
    },
    setRealSenseAddressURL(state, action: PayloadAction<string>) {
      state.realSenseAddressURL = action.payload
    },
    setCasPD2AddressURL(state, action: PayloadAction<string>) {
      state.casPD2AddressURL = action.payload
    },
    setManifestAddressURL(state, action: PayloadAction<string>) {
      state.manifestAddressURL = action.payload
    },
    setDetectParcelURL(state, action: PayloadAction<string>) {
      state.detectParcelURL = action.payload
    }
  }
})

export const {
  replaceConfig,
  setServerAddressURL,
  setUnisonAddressURL,
  setRealSenseAddressURL,
  setCasPD2AddressURL,
  setManifestAddressURL,
  setDetectParcelURL
} = configSlice.actions
export default configSlice.reducer
