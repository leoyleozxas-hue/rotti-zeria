// lib/constants/catalog.js
//
// Categorías del catálogo. Estaban escritas 5 veces (home, catálogo, sidebar del
// admin, ProductForm y el badge de ProductCard); si mañana cambia una, cambia
// en un solo lugar y se rompe en ninguno.

export const CATEGORIES = ['Panes', 'Facturas', 'Dulces', 'Salados', 'Bocados calientes', 'Lunch']

/** Para mostrar en filtros: "Todos" + las categorías reales. */
export const CATEGORY_FILTERS = [{ value: null, label: 'Todos' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]

export const isCategory = (value) => CATEGORIES.includes(value)
