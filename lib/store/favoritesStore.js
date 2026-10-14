// lib/store/favoritesStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const items = get().items
        const exists = items.find((i) => i.product_id === product.id)

        if (exists) {
          set({ items: items.filter((i) => i.product_id !== product.id) })
        } else {
          set({
            items: [
              ...items,
              {
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                image_url: product.image_url,
                category: product.category,
                description: product.description,
              },
            ],
          })
        }
      },

      remove: (product_id) =>
        set({ items: get().items.filter((i) => i.product_id !== product_id) }),

      isFavorite: (product_id) =>
        get().items.some((i) => i.product_id === product_id),

      clear: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    { name: 'biarritz-favorites' }
  )
)