import { useState, useEffect, useRef } from 'react';
import { Order } from '../types';

interface OrderStreamState {
  latestOrder: Order | null;
  connected: boolean;
  eventCount: number;
}

// 관리자 실시간 주문 스트림 (SSE)
export function useOrderStream(storeId: string | null): OrderStreamState {
  const [state, setState] = useState<OrderStreamState>({
    latestOrder: null,
    connected: false,
    eventCount: 0,
  });
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const source = new EventSource(`/api/stores/${storeId}/events`);
    sourceRef.current = source;

    source.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
    };

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_order' && data.order) {
          setState((prev) => ({
            latestOrder: data.order,
            connected: true,
            eventCount: prev.eventCount + 1,
          }));
        }
      } catch {
        // ignore non-JSON keepalive
      }
    };

    source.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [storeId]);

  return state;
}
