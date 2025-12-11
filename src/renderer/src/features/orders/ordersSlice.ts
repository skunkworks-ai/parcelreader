import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OrderItem {
  id: string
  parcelWeight?: number
  parcelSize?: string
  senderDetailsLastName?: string
  senderDetailsFirstName?: string
  senderDetailsMiddleName?: string
  senderDetailsEmailAddress?: string
  senderDetailsContactNumber?: string
  senderDetailsStreet?: string
  senderDetailsCity?: string
  senderDetailsState?: string
  senderDetailsZIPCode?: string
  senderDetailsCountry?: string
  recipientDetailsLastName?: string
  recipientDetailsFirstName?: string
  recipientDetailsMiddleName?: string
  recipientDetailsEmailAddress?: string
  recipientDetailsContactNumber?: string
  recipientDetailsStreet?: string
  recipientDetailsCity?: string
  recipientDetailsState?: string
  recipientDetailsZIPCode?: string
  recipientDetailsCountry?: string
}

export interface Order {
  id: string
  date_created: string // Date()
  items: OrderItem[]
}

export interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  currentItem: OrderItem | null
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  currentItem: null
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.push(action.payload)
    },
    setCurrentOrder(state, action: PayloadAction<Order | null>) {
      state.currentOrder = action.payload
    },
    setCurrentItem(state, action: PayloadAction<OrderItem | null>) {
      state.currentItem = action.payload
    },
    removeOrder(state, action: PayloadAction<string>) {
      state.orders = state.orders.filter((o) => o.id !== action.payload)
    },
    addItemToOrder(state, action: PayloadAction<{ orderId: string; item: OrderItem }>) {
      const order = state.orders.find((o) => o.id === action.payload.orderId)
      if (order) {
        order.items.push(action.payload.item)
      }
    },
    removeItemFromOrder(state, action: PayloadAction<{ orderId: string; itemIndex: number }>) {
      const order = state.orders.find((o) => o.id === action.payload.orderId)
      if (order) {
        order.items = order.items.filter((_it, idx) => idx !== action.payload.itemIndex)
      }
    }
  }
})

export const {
  addOrder,
  setCurrentOrder,
  setCurrentItem,
  removeOrder,
  addItemToOrder,
  removeItemFromOrder
} = ordersSlice.actions

export default ordersSlice.reducer
