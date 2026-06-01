import { Request, Response } from 'express';

interface SSEClient {
  id: string;
  storeId: string;
  res: Response;
}

const clients: SSEClient[] = [];

export function handleSSEConnection(req: Request, res: Response): void {
  const { storeId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = `${storeId}-${Date.now()}`;
  const client: SSEClient = { id: clientId, storeId, res };
  clients.push(client);

  // 연결 확인 이벤트
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // 30초마다 keepalive
  const keepalive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepalive);
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
}

export function broadcastOrder(storeId: string, order: unknown): void {
  const storeClients = clients.filter(c => c.storeId === storeId);
  const data = JSON.stringify({ type: 'new_order', order });

  storeClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}
