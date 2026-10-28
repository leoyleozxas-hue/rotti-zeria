// app/admin/preview/fixtures.js
//
// Datos de mentira para la ruta de preview (sólo desarrollo). No tocan Supabase.

export const FIXTURE_PRODUCTS = [
  {
    id: 'p1',
    name: 'Pan de campo de masa madre',
    price: 4200,
    category: 'Panes',
    is_available: true,
    image_url:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  },
  {
    id: 'p2',
    name: 'Medialunas de manteca (media docena)',
    price: 5600,
    category: 'Facturas',
    is_available: true,
    image_url:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
  },
  {
    id: 'p3',
    name: 'Croissant de almendras',
    price: 1900,
    category: 'Facturas',
    is_available: true,
    image_url: null,
  },
  {
    id: 'p4',
    name: 'Cheesecake de frutos rojos',
    price: 8900,
    category: 'Dulces',
    is_available: false,
    image_url:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  },
  {
    id: 'p5',
    name: 'Sánguche de miga de jamón y queso',
    price: 2400,
    category: 'Salados',
    is_available: true,
    image_url:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
  },
  {
    id: 'p6',
    name: 'Chipá de queso',
    price: 900,
    category: 'Bocados calientes',
    is_available: true,
    image_url: null,
  },
  {
    id: 'p7',
    name: 'Prepizza de cebolla',
    price: 3100,
    category: 'Bocados calientes',
    is_available: true,
    image_url:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  },
  {
    id: 'p8',
    name: 'Pan integral de semillas',
    price: 3900,
    category: 'Panes',
    is_available: false,
    image_url: null,
  },
]

const today = new Date()
const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString()
const todayIso = today.toISOString().slice(0, 10)

export const FIXTURE_ORDERS = [
  {
    id: 'o1',
    order_number: '004812',
    status: 'pending_payment',
    total: 14400,
    created_at: daysAgo(0.02),
    customer_name: 'Lucía Fernández',
    customer_phone: '11 5555-1234',
    pickup_date: todayIso,
    pickup_time: '09:30',
    order_items: [
      { id: 'i1', quantity: 2, product_name: 'Medialunas de manteca' },
      { id: 'i2', quantity: 1, product_name: 'Pan de campo de masa madre' },
    ],
  },
  {
    id: 'o2',
    order_number: '004811',
    status: 'payment_review',
    total: 8900,
    created_at: daysAgo(0.06),
    customer_name: 'Martín Sosa',
    customer_phone: '11 4444-8899',
    pickup_date: todayIso,
    pickup_time: '11:00',
    order_items: [{ id: 'i3', quantity: 1, product_name: 'Cheesecake de frutos rojos' }],
  },
  {
    id: 'o3',
    order_number: '004810',
    status: 'preparing',
    total: 22800,
    created_at: daysAgo(0.3),
    customer_name: 'Carla Domínguez',
    customer_phone: '11 6666-2211',
    pickup_date: todayIso,
    pickup_time: '12:15',
    order_items: [
      { id: 'i4', quantity: 4, product_name: 'Chipá de queso' },
      { id: 'i5', quantity: 2, product_name: 'Sánguche de miga de jamón y queso' },
    ],
  },
  {
    id: 'o4',
    order_number: '004809',
    status: 'confirmed',
    total: 6300,
    created_at: daysAgo(0.5),
    customer_name: 'Julián Pérez',
    customer_phone: '11 3333-7788',
    pickup_date: todayIso,
    pickup_time: '13:00',
    order_items: [{ id: 'i6', quantity: 3, product_name: 'Croissant de almendras' }],
  },
  {
    id: 'o5',
    order_number: '004808',
    status: 'ready',
    total: 9750,
    created_at: daysAgo(1.2),
    customer_name: 'Sofía Acosta',
    customer_phone: '11 2222-4455',
    pickup_date: todayIso,
    pickup_time: '16:30',
    order_items: [{ id: 'i7', quantity: 2, product_name: 'Prepizza de cebolla' }],
  },
  {
    id: 'o6',
    order_number: '004807',
    status: 'delivered',
    total: 4200,
    created_at: daysAgo(2.4),
    customer_name: 'Diego Almada',
    customer_phone: '11 7777-9090',
    pickup_date: null,
    pickup_time: null,
    order_items: [{ id: 'i8', quantity: 1, product_name: 'Pan de campo' }],
  },
]
