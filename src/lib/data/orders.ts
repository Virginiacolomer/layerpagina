export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  createdAt: string;
};

// En memoria — temporal hasta conectar la base de datos real (ver plan del
// proyecto). Sirve para probar el flujo de checkout y, más adelante, el
// panel de administración de pedidos.
const orders: Order[] = [];
let nextId = 1;

export function createOrder(input: Omit<Order, "id" | "createdAt">): Order {
  const order: Order = { ...input, id: String(nextId++), createdAt: new Date().toISOString() };
  orders.unshift(order);
  return order;
}

export function getOrdersByUser(userId: string) {
  return orders.filter((o) => o.userId === userId);
}

export function getOrderById(id: string) {
  return orders.find((o) => o.id === id);
}

export function getAllOrders() {
  return orders;
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const order = orders.find((o) => o.id === id);
  if (order) order.status = status;
  return order;
}
