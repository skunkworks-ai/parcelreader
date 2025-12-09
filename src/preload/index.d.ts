import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getConfig: () => Promise<any>
      setConfig: (c: any) => Promise<any>
    }
  }
}
