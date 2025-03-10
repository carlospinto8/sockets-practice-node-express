(
    function() {
        let ws: WebSocket = new WebSocket('http://localhost:3000') ;
        const messages = <HTMLElement>document.getElementById('messages');
        const wsOpen = <HTMLButtonElement>document.getElementById('ws-open');
        const wsClose = <HTMLButtonElement>document.getElementById('ws-close');
        const wsSend = <HTMLButtonElement>document.getElementById('ws-send');
        const wsInput = <HTMLInputElement>document.getElementById('ws-input');

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

        wsOpen.addEventListener('click', () => {
            closeConnection();

            ws = new WebSocket('ws://localhost:3000');


            ws.addEventListener('error', () => {
                showMessage('WebSocket Error');
            });

            ws.addEventListener('open', () => {
                showMessage('WebSocket Connection established');
            });

            ws.addEventListener('close', () => {
                showMessage('WebSocket Connection close');
            });

            // msg will usually be an object requiring parsing but not right now for learning purposes
            ws.addEventListener('message', (msg: MessageEvent<string>) => {
                showMessage(`Received Message: ${msg.data}`);
            });
        });

        wsClose.addEventListener('click', closeConnection);

        wsSend.addEventListener('click', () => {

            const val = wsInput?.value;

            if (!val) {
                return;
            }

            if (ws.readyState !== 1) {
                showMessage('no WebSocket connection');
                return;
            }


            ws.send(val);
            showMessage(`Sent "${val}"`);
            wsInput.value = '';
        })
    }
)();