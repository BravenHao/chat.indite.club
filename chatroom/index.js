var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var users = {},userList={};
io.on('connection', function(socket) {
	console.log('a user connected');
	var socketId = socket.id;
	socket.emit('login');
	
	socket.on('disconnect', function() {
		var username = users[socket.id].username;
		delete users[socket.id];
		delete userList[socket.id];
		console.log(username+'('+socketId+') disconnected');
		//socket.broadcast.emit('notice',user+"离开了聊天室");
		io.emit('notice', username+"离开了聊天室");
		console.log(username+" logout.");
		io.emit('list user', userList);
	});

	socket.on('chat message', function(data) {
		console.log('user send to'+data.to+' a message: ' + data.msg);
		if(data.to){
			users[data.to].socket.emit('chat message',users[socket.id].username+"悄悄对你说:"+data.msg);
			socket.emit('chat message',"你悄悄对"+users[data.to].username+"说:"+data.msg)
		}else{
			io.emit('chat message', users[socket.id].username+":"+data.msg);
		}
	});

	socket.on('login', function(username) {
		users[socket.id]= {username:username,socket:socket};
		userList[socket.id] = username;
		io.emit('notice', username+"进入了聊天室");
		console.log(username+" login.");
		io.emit('list user', userList);
		console.log("pushed users;")
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});