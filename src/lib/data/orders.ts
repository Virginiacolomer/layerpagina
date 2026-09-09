import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { OrderStatusValue } from "@/lib/order-status";

export type OrderStatus = OrderStatusValue;

export type OrderItem = {
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  colors: string[];
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

export type NewOrderInput = {
  userId: string;
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
};

const orderInclude = {
  user: true,
  coupon: true,
  items: { orderBy: { id: "asc" } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    status: row.status,
    items: row.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      productName: item.productName,
      variantLabel: item.variantLabel ?? undefined,
      colors: item.colors,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total: Number(row.total),
    couponCode: row.coupon?.code,
    shippingName: row.shippingName,
    shippingPhone: row.shippingPhone,
    shippingStreet: row.shippingStreet,
    shippingCity: row.shippingCity,
    shippingProvince: row.shippingProvince,
    shippingPostalCode: row.shippingPostalCode,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const coupon = input.couponCode
    ? await prisma.coupon.findUnique({ where: { code: input.couponCode } })
    : null;

  const row = await prisma.order.create({
    data: {
      userId: input.userId,
      status: "PENDING",
      subtotal: input.subtotal,
      discount: input.discount,
      total: input.total,
      couponId: coupon?.id ?? null,
      shippingName: input.shippingName,
      shippingPhone: input.shippingPhone,
      shippingStreet: input.shippingStreet,
      shippingCity: input.shippingCity,
      shippingProvince: input.shippingProvince,
      shippingPostalCode: input.shippingPostalCode,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          productName: item.productName,
          variantLabel: item.variantLabel ?? null,
          colors: item.colors ?? [],
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: orderInclude,
  });
  return toOrder(row);
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const row = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  return row ? toOrder(row) : undefined;
}

export async function getAllOrders(userId?: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: userId ? { userId } : undefined,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  const row = await prisma.order.update({
    where: { id },
    data: { status },
    include: orderInclude,
  });
  return toOrder(row);
}
