// lib/store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items
        const existing = items.find((i) => i.product_id === product.id)

        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                image_url: product.image_url,
                quantity: 1,
              },
            ],
          })
        }
      },

      removeItem: (product_id) =>
        set({ items: get().items.filter((i) => i.product_id !== product_id) }),

      updateQuantity: (product_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(product_id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product_id === product_id ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      getCount: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: 'biarritz-cart' }
  )
)