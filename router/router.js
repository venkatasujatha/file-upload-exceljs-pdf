const router = require('express').Router()
const server = require('../server')
const fileController = require('../controller/controller')

const multer = require('multer')
var multer1 = multer()
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const uploadFile = multer({
  storage: storage
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype == 'image/tiff' || file.mimetype == 'image/png') {
//       cb(null, true)
//     } else {
//       cb(null, false)
//       return cb(new Error('Only .tiff and .png format allowed!'))
//     }
//   }
})

router.post(
  '/uploadFile',
  uploadFile.single('path'),
  fileController.uploadFile
)
//router.get('/downloadFile',fileController.downloadFile)
module.exports = router