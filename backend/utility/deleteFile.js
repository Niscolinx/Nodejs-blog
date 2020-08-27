const fs = require('fs')

const deleteFile = (filePath) => {
    console.log('the file to delete is', filePath)
    fs.unlink(filePath, (err) => {
        if (err) {
            throw new Error('unable to delete file')
        }
    })
}

exports.deleteFile = deleteFile
