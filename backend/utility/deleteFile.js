const fs = require('fs')
const path = require('path')

const deleteFile = (filePath) => {
    console.log('the file to delete is', filePath)
    
    console.log('the path to delete', imgPath)
    fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
            console.error(err)
            return
        }

        console.log('the file exists')
        //file exists
    })
    // fs.unlink(filePath, (err) => {
    //     if (err) {
    //         throw new Error('unable to delete file')
    //     }
    // })
}

exports.deleteFile = deleteFile
