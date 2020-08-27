let io;

module.exports = {
    init: httpSocket => {
        
    },

    getIo: () => {
        if(!io){
            throw new Error('socket.io is not set')
        }

        return io
    }
}