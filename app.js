const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    console.log(data);
  });
});
Client (index.html)
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io.connect('http://localhost');
  socket.on('news', (data) => {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
</script>
