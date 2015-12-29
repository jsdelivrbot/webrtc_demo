var peerId;

window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;

//建立与服务器的socket长连接
var socket = io();
//有peer接入到webrtc服务器, 服务器通过socket将其他id实时推送到客户端
socket.on('broadcast', function(msg) {
	console.log('message: ' + msg.type + ',' + msg.content);

	//文本连接
	var c = peer.connect(msg.content);
	//建立完成向对方打招呼
	c.on('open', function(conn) {
		c.send({
			id: peerId,
			content: 'hello, ' + msg.content,
			toId: msg.content
		});
	});
	//收到对方的消息
	c.on('data', function(data) {
		console.log(data.id + ' say:' + data.content);
	});

	//视频连接
	var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	getUserMedia = getUserMedia.bind(navigator);
	getUserMedia({video: true,audio: true}, function(stream) {
		var call = peer.call(msg.content, stream);
		call.on('stream', function(remoteStream) {
			// Show stream in some video/canvas element.
			document.getElementById('camera_box').src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(remoteStream) : remoteStream;
		});
	}, function(err) {
		console.log('Failed to get local stream', err);
	});
});

//开启一个webrtc点
var peer = new Peer({
	host: 'localhost',
	port: 9000
});

// The `open` event signifies that the Peer is ready to connect with other
// Peers and, if we didn't provide the Peer with an ID, that an ID has been
// assigned by the server.
// webrtc点开启成功
peer.on('open', function(id) {
	peerId = id;
	socket.emit('peer_open', id);
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
		console.log(data.id + ' say:' + data.content);
		connection.send({
			id: peerId,
			content: 'hello, ' + data.id,
			toId: data.id
		});
		//console.log(data);
		// Append the data to body.
		//$('#helloworld').append(data);
	});
});
//媒体请求
peer.on('call', function(call) {
	var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	getUserMedia = getUserMedia.bind(navigator);
	getUserMedia({video: true,audio: true}, function(stream) {
		call.answer(stream); // Answer the call with an A/V stream.
		call.on('stream', function(remoteStream) {
			// Show stream in some video/canvas element.
			document.getElementById('camera_box').src = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(remoteStream) : remoteStream;
		});
	}, function(err) {
		console.log('Failed to get local stream', err);
	});
});