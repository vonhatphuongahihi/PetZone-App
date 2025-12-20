import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

export type SocketEventType =
  | 'user_online'
  | 'user_offline'
  | 'message:new'
  | 'conversation:unread'
  | 'conversation:read'
  | 'conversation:typing'
  | 'conversation:stop_typing'
  | 'order:new'
  | 'order:created'
  | 'order:status_changed'
  | 'order:delivered'
  | 'order:cancelled';

export interface SocketEventData {
  user_online: { userId: string };
  user_offline: { userId: string };
  'message:new': {
    id: number;
    conversationId: number;
    senderId: string;
    body: string;
    createdAt: string;
    sender?: any;
  };
  'conversation:unread': {
    conversationId: number;
    message: any;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
  'conversation:read': {
    conversationId: number;
    userId: string;
    readAt: string;
    timestamp: number;
  };
  'conversation:typing': {
    userId: string;
    conversationId: number;
  };
  'conversation:stop_typing': {
    userId: string;
    conversationId: number;
  };
  'order:new': {
    orderId: string;
    orderNumber: string;
    storeId: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  };
  'order:created': {
    orders: Array<{
      orderId: string;
      orderNumber: string;
      storeName: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
  'order:status_changed': {
    orderId: string;
    orderNumber: string;
    storeName: string;
    oldStatus: string;
    newStatus: string;
    statusMessage: string;
    total: number;
    updatedAt: string;
  };
  'order:delivered': {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    deliveredAt: string;
  };
  'order:cancelled': {
    orderId: string;
    orderNumber: string;
    customerName: string;
    total: number;
    cancelledAt: string;
  };
}

export const SocketEventEmitter = {
  /**
   * Listen to socket events
   */
  addListener: <T extends SocketEventType>(
    eventType: T,
    listener: (data: SocketEventData[T]) => void
  ): EmitterSubscription => {
    return DeviceEventEmitter.addListener(eventType, listener);
  },

  /**
   * Remove specific listener
   */
  removeListener: (subscription: EmitterSubscription): void => {
    subscription.remove();
  },

  /**
   * Remove all listeners for a specific event type
   */
  removeAllListeners: (eventType?: SocketEventType): void => {
    DeviceEventEmitter.removeAllListeners(eventType);
  },

  /**
   * Emit event (usually used internally by socket service)
   */
  emit: <T extends SocketEventType>(
    eventType: T,
    data: SocketEventData[T]
  ): void => {
    DeviceEventEmitter.emit(eventType, data);
  },
};