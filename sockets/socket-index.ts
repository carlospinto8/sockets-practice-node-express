import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

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

    s.on('upgrade', (req: any, socket: any, head: any) => {
        // Before officially upgraded and emitted to the server
        socket.on('error', onSocketPreError);

        // TODO: Perform auth here


        // Use our three arguments and a call back which will get the web socket itself
        wss.handleUpgrade(req, socket, head, (ws) => {
            socket.removeListener('error', onSocketPreError);
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', (ws, req) => {
        ws.on('error', onSocketPostError);

        ws.on('message', (msg, isBinary) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg, { binary: isBinary });
                }
            });
        });

        ws.on('close', () => {
            console.log('Connection closed');
        })

    });
}