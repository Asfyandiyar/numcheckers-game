var express = require('express'), path = require('path'), fs = require('fs'),
 	app = express(), /*https = require('https'),*/http = require('http').createServer(app), NumCheckers = require('./models/numcheckers');

//app.use(require('helmet')());

 //var certificate = fs.readFileSync('/etc/letsencrypt/live/numcheckers.com/fullchain.pem');
 //var privateKey = fs.readFileSync('/etc/letsencrypt/live/numcheckers.com/privkey.pem');

 //var credentials = {
 	//key: privateKey,
 	//cert: certificate
 //};
var io;
  //var httpsServer = https.createServer(credentials, app);
  var io = require('socket.io').listen(http);
  http.listen(3000);
  //httpsServer.listen(443);
var webId;

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:id', function(req, res) {
  webId = req.params.id;
  res.sendFile(path.join(__dirname, webId));
});

app.get('/.well-known/:folder/:file', function(req, res) {    
  let folder = req.params.folder;
  let file = req.params.file;
  console.log(' folder: ' + folder + ' file: ' + file);

  res.sendFile(file, {root: __dirname + '/.well-known/' + folder});
});

var users = [];
var connections = [];
var index;
var random; var randoms = [];

var onlinePlayers = 0, countPlayers = [], Game = new NumCheckers();

for(var i = 0; i < 12; i++) {
	random = Math.round(Math.random()*10+1);
  	randoms.push(random);
}

setInterval(function() {
	io.sockets.emit('stats', {countPlayers: (onlinePlayers == 1)?(1 + ' (You)'):onlinePlayers});
}, 5000);

io.sockets.on('connection', function(socket) {
	io.sockets.emit('stats', {countPlayers: (onlinePlayers == 1)?(1 + ' (You)'):onlinePlayers});
	 console.log('Success connection');
	connections.push(socket);
	onlinePlayers++;
	socket.on('disconnect', function(data) {
		index = connections.indexOf(socket);
		users.splice(index, 1);
		connections.splice(index, 1);
		Game.end(socket.id.toString(), function(gameId, opponent) {
            io.sockets.connected[opponent].emit('exit');
            socket.leave(gameId);
            io.sockets.connected[opponent].leave(gameId);
        });
        onlinePlayers--;
        console.log('%s: %s - disconnected', socket.id.toString(), socket.handshake.address.address);
	});

	socket.on('send request', function(data) {
		users.push(data);
		io.sockets.emit('success message', {msg: data});
	});

	socket.on('start', function () {
		socket.emit('create board', {randoms: randoms});
		if(Game.users[socket.id] === undefined) {
			Game.start(socket.id.toString(), function(start, gameId, opponent){ 
		        if(start) {
		            socket.join(gameId);
		            io.sockets.connected[opponent].join(gameId);
		            socket.emit('ready', gameId, 'green');
		            io.sockets.connected[opponent].emit('ready', gameId, 'red');
		            if(Game.free[opponent]) {
		            	Game.free = [];
		            }
		        } else {
		            io.sockets.connected[socket.id].emit('wait');
		        }
		        if(countPlayers[socket.handshake.address.address] == undefined) countPlayers[socket.handshake.address.address] = true;
		    });
		} 
	});

	socket.on('onmousedown', function(gameId, j, i, pageX, pageY, coords, coordsTable) {
		io.sockets.in(gameId).emit('onmousedown', j, i, pageX, pageY, coords, coordsTable);
	});

	socket.on('onmousemove', function(gameId, j, i, pageX, pageY, shiftX, shiftY) {
		io.sockets.in(gameId).emit('onmousemove', j, i, pageX, pageY, shiftX, shiftY);
	});

	socket.on('onmouseup', function(gameId, j, i, dropElemClass) {
		io.sockets.in(gameId).emit('onmouseup', j, i, dropElemClass);
	});

	socket.on('toggle', function(gameId, i, j, turn) {
		io.sockets.in(gameId).emit('toggle', i, j, turn);
	});

    socket.on('step', function (gameId, selected, coord, barrier, swaping, remove, c_double_jump) {
        Game.step(gameId, socket.id.toString(), function(turn) {
            io.sockets.in(gameId).emit('step', selected, coord, barrier, swaping, remove, c_double_jump, turn);
        });
    });

    socket.on('next turn', function(gameId) {
    	Game.nextTurn(gameId, socket.id.toString(), function(turn) {
    		io.sockets.in(gameId).emit('next turn', turn);
    	});
    	
    });

    socket.on('endgame', function(gameId) {
    	Game.end(socket.id.toString(), function(gameId) {
            socket.leave(gameId);
            io.sockets.connected[opponent].leave(gameId);
        });
    });

});