import { configureStore } from '@reduxjs/toolkit';
import configReducer, { replaceConfig } from './features/config/configSlice';
import type { ConfigState } from './features/config/configSlice';
import ordersReducer from './features/orders/ordersSlice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(
        // Add other middleware here if needed
      ),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hydrate store from persisted config (Electron) and persist on changes
if (typeof window !== 'undefined' && (window as any).api && (window as any).api.getConfig) {
  ;(async () => {
    try {
      const persisted = await (window as any).api.getConfig() as ConfigState | null
      if (persisted) {
        store.dispatch(replaceConfig(persisted))
      }
    } catch (e) {
      console.error('Failed to load persisted config', e)
    }
  })()

  // Persist on config changes
  let prev = JSON.stringify(store.getState().config)
  store.subscribe(() => {
    try {
      const next = JSON.stringify(store.getState().config)
      if (next !== prev) {
        prev = next
        ;(window as any).api.setConfig(store.getState().config).catch((e) => {
          console.error('Failed to persist config', e)
        })
      }
    } catch (e) {
      console.error('Error while persisting config', e)
    }
  })
}
