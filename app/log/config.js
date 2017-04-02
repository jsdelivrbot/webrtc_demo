module.exports = {
    appenders: [
        { type: 'console' },
        { type: 'file', filename: 'logs/room-socket.log', category: 'room-socket' },
        { type: 'file', filename: 'logs/http-connect.log', category: 'http-connect' }
    ]
};