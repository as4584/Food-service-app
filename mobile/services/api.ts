/**
 * Shore Eats API Service
 *
 * Centralized HTTP client for communicating with the FastAPI backend.
 * All endpoints go through /api/v1/. No auth — demo customer flow only.
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8001/api/v1";

export class ApiError extends Error {
  status: number;
  detail: any;
  constructor(message: string, status: number, detail?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!response.ok) {
        throw new ApiError(text || `Request failed (${response.status})`, response.status);
      }
      throw new Error("Invalid JSON response from server");
    }
  }

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : data?.detail?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data?.detail);
  }

  return data as T;
}

// ─── Restaurants ─────────────────────────────────────

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: string;
  image_emoji: string | null;
  image_url: string | null;
  is_available: boolean;
}

export interface RestaurantListItem {
  id: string;
  name: string;
  town: string;
  cuisine: string;
  image_emoji: string | null;
  image_url: string | null;
  website_url: string | null;
  category: string | null;
  rating: string;
  eta_minutes: number;
  price_range: string;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface RestaurantDetail extends RestaurantListItem {
  description: string | null;
  menu_items: MenuItem[];
}

export async function listRestaurants(): Promise<RestaurantListItem[]> {
  return request<RestaurantListItem[]>("/restaurants");
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  return request<RestaurantDetail>(`/restaurants/${id}`);
}

// ─── Orders ──────────────────────────────────────────

export interface OrderItemPayload {
  menu_item_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  restaurant_id: string;
  customer_name?: string;
  delivery_address?: string;
  items: OrderItemPayload[];
}

export type OrderStage = "placed" | "preparing" | "out_for_delivery" | "delivered";

// Real, authoritative lifecycle status (backend services.order_lifecycle).
export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "rejected";

export interface OrderResponse {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_latitude: number | null;
  restaurant_longitude: number | null;
  customer_name: string | null;
  delivery_address: string | null;
  subtotal: string;
  tax: string;
  delivery_fee: string;
  total: string;
  items: {
    id: string;
    menu_item_id: string | null;
    name_snapshot: string;
    unit_price_snapshot: string;
    quantity: number;
    line_total: string;
  }[];
  created_at: string;
  // legacy 4-step tracker
  stage: OrderStage;
  stage_index: number;
  stage_count: number;
  progress_in_stage: number;
  seconds_elapsed: number;
  is_delivered: boolean;
  // real lifecycle
  status: OrderStatus;
  status_label: string;
  rejected: boolean;
  rejected_reason: string | null;
  driver_name: string | null;
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  return request<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrder(id: string): Promise<OrderResponse> {
  return request<OrderResponse>(`/orders/${id}`);
}

// ─── Ops: merchant + driver dashboards ───────────────────────────────────────

export interface ListOrdersParams {
  restaurantId?: string;
  status?: OrderStatus | OrderStatus[];
  driverName?: string;
  activeOnly?: boolean;
  limit?: number;
}

export async function listOrders(params: ListOrdersParams = {}): Promise<OrderResponse[]> {
  const qs = new URLSearchParams();
  if (params.restaurantId) qs.append("restaurant_id", params.restaurantId);
  if (params.driverName) qs.append("driver_name", params.driverName);
  if (params.activeOnly) qs.append("active_only", "true");
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    statuses.forEach((s) => qs.append("status", s));
  }
  const q = qs.toString();
  return request<OrderResponse[]>(`/orders${q ? `?${q}` : ""}`);
}

// Merchant actions
export const acceptOrder = (id: string) =>
  request<OrderResponse>(`/orders/${id}/accept`, { method: "POST" });

export const rejectOrder = (id: string, reason?: string) =>
  request<OrderResponse>(`/orders/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? null }),
  });

export const markOrderReady = (id: string) =>
  request<OrderResponse>(`/orders/${id}/ready`, { method: "POST" });

// Driver actions
export const pickupOrder = (id: string, driverName: string) =>
  request<OrderResponse>(`/orders/${id}/pickup`, {
    method: "POST",
    body: JSON.stringify({ driver_name: driverName }),
  });

export const deliverOrder = (id: string) =>
  request<OrderResponse>(`/orders/${id}/deliver`, { method: "POST" });

export async function healthCheck(): Promise<{ status: string; version: string }> {
  return request("/health");
}
