(
    function() {
        interface WebSocketExt extends WebSocket {
            pingTimeOut: NodeJS.Timeout;
        }

        let ws: WebSocketExt;
        const HEARTBEAT_TIMEOUT = ((1000 * 5) + (1000 * 1));
        const HEARTBEAT_VALUE = 1;
        const messages = <HTMLElement>document.getElementById('messages');
        const wsOpen = <HTMLButtonElement>document.getElementById('ws-open');
        const wsClose = <HTMLButtonElement>document.getElementById('ws-close');
        const wsSend = <HTMLButtonElement>document.getElementById('ws-send');
        const wsInput = <HTMLInputElement>document.getElementById('ws-input');
        const wsLogin = <HTMLButtonElement>document.getElementById('ws-login');
        const wsLogout = <HTMLButtonElement>document.getElementById('ws-logout');
        const wsTokenOpen = <HTMLButtonElement>document.getElementById('ws-open-tk');


        function showMessage(message: string) {
            if (!messages){
                return;
            }
            messages.textContent += `\n${message}`;
            messages.scrollTop = messages?.scrollHeight;
        }

        function closeConnection(){
            if (ws) {
                ws.close();
            }           
        }

        function heartbeat() {
            if (!ws) {
                return;
            } else if (!!ws.pingTimeOut) {
                clearTimeout(ws.pingTimeOut);
            }

            ws.pingTimeOut = setTimeout(() => {
                ws.close();

                // Business Logic for deciding whether or not to reconnect
            }, HEARTBEAT_TIMEOUT);

            const data = new Uint8Array(1);

            data[0] = HEARTBEAT_VALUE;

            ws.send(data);
        }

        function isBinary(obj: any) {
            return typeof obj === 'object' && Object.prototype.toString.call(obj) ==='[object Blob]';
        }

        // tk would be retrieved from a auth server separate from our websocket server
        // TODO: implement auth server and retrieve from there.
        function initConnection(tk?: string) {
            return () => {
                closeConnection();

                ws = new WebSocket(`ws://localhost:3000${!tk ? '' : `/?at=${tk}`}`) as WebSocketExt;
    
    
                ws.addEventListener('error', () => {
                    showMessage('WebSocket Error');
                });
    
                ws.addEventListener('open', () => {
                    showMessage('WebSocket Connection established');
                });
    
                ws.addEventListener('close', () => {
                    showMessage('WebSocket Connection close');
    
                    if (!!ws.pingTimeOut) {
                        clearTimeout(ws.pingTimeOut);
                    }
                });
    
                // msg will usually be an object requiring parsing but not right now for learning purposes
                ws.addEventListener('message', (msg: MessageEvent<string>) => {
                    if (isBinary(msg.data)) {
                        heartbeat();
                    } else {
                        showMessage(`Received message: ${msg.data}`);
                    }
                });
            }
        }

        wsOpen.addEventListener('click', initConnection());
        wsTokenOpen.addEventListener('click', initConnection('testt'));

        wsClose.addEventListener('click', closeConnection);

        wsSend.addEventListener('click', () => {

            const val = wsInput?.value;

            if (!val) {
                return;
            }

            if (ws.readyState !== 1 || ws.readyState !== WebSocket.OPEN) {
                showMessage('no WebSocket connection');
                return;
            }


            ws.send(val);
            showMessage(`Sent "${val}"`);
            wsInput.value = '';
        });

        wsLogin.addEventListener('click', async () => {
            const res = await fetch('/user/login');
            if (res.ok) {
                showMessage('Logged in');
            } else {
                showMessage('There was a problem logging in');
            }
        });

        wsLogout.addEventListener('click', async () => {
            closeConnection();
            const res = await fetch('/api/v1/user/logout');
            if (res.ok) {
                showMessage('Logged out');
            } else {
                showMessage('There was a problem logging out');
            }
        });
    }
)();