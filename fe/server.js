import WebSocket from 'ws';
const ws = new WebSocket('ws://192.168.1.222:3000/ws');

ws.on('open', () => {
  console.log('connected');
})

ws.on('message', (data) => {
  console.log(data);
})