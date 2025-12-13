import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// Use require() for electron-store to avoid ESM/CJS interop issues
const Store = require('electron-store') as any

interface ConfigState {
  serverAddressURL: string
  unisonAddressURL: string
  realSenseAddressURL: string
  casPD2AddressURL: string
  manifestAddressURL: string
  parcels: any[]
}

const defaults: ConfigState = {
  serverAddressURL: 'http://localhost:8000',
  unisonAddressURL: 'http://localhost:7070', // camera
  realSenseAddressURL: 'http://localhost:6060', // dimensions
  casPD2AddressURL: 'http://localhost:3030', // weight
  manifestAddressURL: 'http://localhost:4040', // sender & receiver,
  parcels: [
    {
      name: 'Small Box',
      range: '0.1kg < x <= 1kg',
      min_kg: 0.1,
      max_kg: 1,
      min_inclusive: false,
      max_inclusive: true
    },
    {
      name: 'Medium Box',
      range: '1kg < x <= 3kg',
      min_kg: 1,
      max_kg: 3,
      min_inclusive: false,
      max_inclusive: true
    },
    {
      name: 'Large Box',
      range: '3kg < x <= 5kg',
      min_kg: 3,
      max_kg: 5,
      min_inclusive: false,
      max_inclusive: true
    },
    {
      name: 'Extra Large',
      range: '5kg < x <= 10kg',
      min_kg: 20,
      max_kg: 50,
      min_inclusive: false,
      max_inclusive: true
    }
  ]
}

const store: any = new Store({ name: 'config', defaults })

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Config persistence
  ipcMain.handle('config-get', () => {
    return store.store
  })

  ipcMain.handle('config-set', (_, newConfig: Partial<ConfigState>) => {
    // merge with existing
    const merged = { ...store.store, ...newConfig }
    store.set(merged)
    return store.store
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
