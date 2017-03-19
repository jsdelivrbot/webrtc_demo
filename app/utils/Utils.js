function getRoomsInfo(rooms) {
    return rooms.map(getRoomInfo);
}

function getRoomInfo(room) {
    if (!room) {
        return room;
    }
    return {
        id: room._id,
        name: room.name,
        topic: room.topic,
        creatorEmail: room.creatorEmail,
        creatorName: room.creatorName,
        members: room.members
    };
}

module.exports = {
    getUserInfo: function (user) {
        return {
            username: user.username,
            email: user.email,
            userid: user._id,
            rooms: user.rooms
        };
    },
    getRoomsInfo: getRoomsInfo,
    getRoomInfo: getRoomInfo
};