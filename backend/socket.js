let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer)
        return io
    },

    getIo: () => {
        if(!io){
            throw new Error('socket.io is not set')
        }

        return io
    }
}