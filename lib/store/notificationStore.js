// lib/store/notificationStore.js
import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  pendingOrders: 0,
  newConsultas: 0,
  setCounts: ({ pendingOrders, newConsultas }) =>
    set({ pendingOrders, newConsultas }),
}))