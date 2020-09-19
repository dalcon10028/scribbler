var app = require('express')();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
//setting cors 
app.all('/*', function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
    next(); }); 
    
app.get('/', function(req, res) { 
    res.sendFile(__dirname + '/public/index.html');
}); 
    //connection event handler 
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('chat message', (msg) => {
          io.emit('chat message', msg);
        });
        socket.on('disconnect', () => {
        console.log('user disconnected');
        });
      }); 

server.listen(3000, function() { 
    console.log('socket io server listening on port 3000') 
})