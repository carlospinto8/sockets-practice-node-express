import { IncomingMessage, Server } from 'http';
import { Socket } from 'net';
import { WebSocketServer, WebSocket } from 'ws';

const HEARTBEAT_INTERVAL = 1000 * 5; // In prod, use a bigger interval like 10-30 seconds
const HEARTBEAT_VALUE = 1;

interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
  }

function ping(ws: WebSocket) {
    ws.send(HEARTBEAT_VALUE, { binary: true });
}

// HTTP server is error handling
function onSocketPreError(e: Error) {
    console.log('Error occurred before upgrading: ' + e.message);

}

// Web socket server is error handling
function onSocketPostError(e: Error) {
    console.log('Error occurred after upgrading: ' + e.message);
}

export default function configureSockets(s: Server) {

    const wss: WebSocketServer = new WebSocketServer({ noServer: true });

    s.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
        // Before officially upgraded and emitted to the server
        socket.on('error', onSocketPreError);

        // TODO: Perform auth here


        // Use our three arguments and a call back which will get the web socket itself
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', (ws: WebSocket, req) => {
        const extWs = ws as ExtendedWebSocket;

        extWs.isAlive = true;

        extWs.on('error', onSocketPostError);

        extWs.on('message', (msg, isBinary) => {
            if (isBinary && (msg as any)[0] === HEARTBEAT_VALUE) {
                extWs.isAlive = true;
            } else {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(msg, { binary: isBinary });
                    }
                });
            }


        });

        extWs.on('close', () => {
            console.log('Connection closed');
        })

    });

    const interval = setInterval(() => {
        console.log('firing interval');
        wss.clients.forEach((client) => {
            const extClient = client as ExtendedWebSocket;

            if (!extClient.isAlive) {
                client.terminate();
                return;
            }

            extClient.isAlive = false;
            ping(extClient);
        });
    }, HEARTBEAT_INTERVAL);

    wss.on('close', () => {
        clearInterval(interval);
    })
}