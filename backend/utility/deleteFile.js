const fs = require('fs')

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw new Error('unable to delete file')
        }
    })
}

exports.deleteFile = deleteFile
