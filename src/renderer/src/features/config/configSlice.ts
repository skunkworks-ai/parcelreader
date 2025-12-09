import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConfigState {
  serverAddressURL: string
  unisonAddressURL: string
  realSenseAddressURL: string
  casPD2AddressURL: string
  manifestAddressURL: string
}

const initialState: ConfigState = {
  serverAddressURL: 'http://localhost:8000',
  unisonAddressURL: 'http://localhost:7070',
  realSenseAddressURL: 'http://localhost:6060',
  casPD2AddressURL: 'http://localhost:5050',
  manifestAddressURL: 'http://localhost:4040'
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
    }
  }
})

export const {
  replaceConfig,
  setServerAddressURL,
  setUnisonAddressURL,
  setRealSenseAddressURL,
  setCasPD2AddressURL,
  setManifestAddressURL
} = configSlice.actions
export default configSlice.reducer
