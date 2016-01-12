var chatList = new Vue({
	el: '#chat-list',
	data: {
		users: []
	},
	created: function() {
		window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;
		this.socket = this.openSocket();
		this.peer = this.openPeer();
	},
	methods: {
		openSocket: function() {
			//建立与服务器的socket长连接
			var socket = io();
			socket.on('init', function(users) {
				for(var i = 0; i < users.length; i++) {
					chatList.addPerson(users[i].id);
				}
			});

			//有peer接入到webrtc服务器, 服务器通过socket将其他id实时推送到客户端
			socket.on('broadcast', function(msg) {
				console.log('message: ' + msg.type + ',' + msg.content);

				chatList.addPerson(msg.content);

				// //文本连接
				// var c = peer.connect(msg.content);
				// //建立完成向对方打招呼
				// c.on('open', function(conn) {
				// 	c.send({
				// 		id: peerId,
				// 		content: 'hello, ' + msg.content,
				// 		toId: msg.content
				// 	});
				// });
				// //收到对方的消息
				// c.on('data', function(data) {
				// 	console.log(data.id + ' say:' + data.content);
				// });
			});

			return socket;
		},
		openPeer: function() {
			var self = this;
			//开启一个webrtc点
			var peer = new Peer({
				host: 'localhost',
				port: 9000
			});

			// The `open` event signifies that the Peer is ready to connect with other
			// Peers and, if we didn't provide the Peer with an ID, that an ID has been
			// assigned by the server.
			// webrtc点开启成功, 记录id到服务器
			peer.on('open', function(id) {
				self.peerId = id;
				self.socket.emit('peer_open', id);
			});
			// Wait for a connection from the second peer.
			peer.on('connection', function(connection) {
				// This `connection` is a DataConnection object with which we can send
				// data.
				// The `open` event firing means that the connection is now ready to
				// transmit data.
				connection.on('open', function() {
					// Send 'Hello' on the connection.
					//connection.send('Hello peer2!');
				});
				// The `data` event is fired when data is received on the connection.
				connection.on('data', function(data) {
					switch(data.type) {
						case 'video_request':
							var isConfirm = confirm(data.content);
							if(isConfirm) {
								self.openVideo(data.id);
							} else {
								return;
							}
					}
				});
			});

			return peer;
		},
		addPerson: function(id) {
			this.users.push({
				id: id,
				text: id
			});
		},
		requestVideo: function() {
			var self = this;
			var c = this.peer.connect(this.id);
			//与该客户端建立连接并请求视频共享
			c.on('open', function(conn) {
				c.send({
					id: self.peerId,
					type: 'video_request',
					content: self.peerId + ' is asked for your video sharing!',
					toId: this.id
				});
			});

			//其他客户端共享视频流到本客户端
			this.peer.on('call', function(call) {
				call.on('stream', function(remoteStream) {
					// Show stream in some video/canvas element.
					// document.getElementById('camera_box').src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(remoteStream) : remoteStream;
				});
			});
		},
		openVideo: function(toId) {
			var self = this;
			//视频连接
			var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			getUserMedia = getUserMedia.bind(navigator);
			getUserMedia({
				video: true,
				audio: true
			}, function(stream) {
				var call = self.peer.call(toId, stream);
				call.on('stream', function(remoteStream) {
					// Show stream in some video/canvas element.
					document.getElementById('camera_box').src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(remoteStream) : remoteStream;
				});
			}, function(err) {
				console.log('Failed to get local stream', err);
			});
		}
	}
});

