import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OrderItem {
  name: string
  weight: number
}

export interface Order {
  id: string
  date_created: Date
  items: OrderItem[]
}

export interface OrdersState {
  orders: Order[],
  currentOrder: Order | null
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null
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

export const { addOrder, setCurrentOrder, removeOrder, addItemToOrder, removeItemFromOrder } =
  ordersSlice.actions

export default ordersSlice.reducer
