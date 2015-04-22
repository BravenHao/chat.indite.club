/**
 * Created by artron on 15/3/27.
 */

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(55555);
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
};
function handler(req, res) {
    fs.readFile(__dirname + '/chat.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

var userList = new Array();
var socketList = new Array();


var Imserver = {
    broadUserList: function () {
        io.to('wechat').emit('userList', {userList: userList});
    },
    delUser: function (socketId) {
        console.log('删除', socketId);
        for (var i = 0; i < userList.length; i++) {
            if (userList[i].socketId == socketId) {
                userList.remove(i);
            }
        }
        console.log('删除', socketId);
        for (var i = 0; i < socketList.length; i++) {
            if (socketList[i].socketId == socketId) {
                socketList.remove(i);
            }
        }
    },
    sendMessage: function (socketId, message) {
        for (var i = 0; i < socketList.length; i++) {
            if (socketList[i].socketId == socketId) {
                console.log('找到socketid了', socketId)
                socketList[i].socket.emit('OnMessage', message);
            }
        }
    }
};
io.on('connection', function (socket) {
    var socketId = socket.id;
    console.log(socket.id);
    socket.join('wechat');
    socket.on('setName', function (data) {
        console.log('setName', data);
        userList.push({name: data.name, socketId: socket.id});
        socketList.push({socketId: socket.id, socket: socket});

        Imserver.broadUserList();
    });
    socket.on('error', function (data) {
        console.log(data);
    });
    socket.on('disconnect', function (socket) {

        Imserver.delUser(socketId)
    });
    //socket.emit('news', {hello: 'world'});
    socket.on('sendMessage', function (data) {
        console.log('谁给老子说话了', data);
        Imserver.sendMessage(data.user, data.content);
    });
});