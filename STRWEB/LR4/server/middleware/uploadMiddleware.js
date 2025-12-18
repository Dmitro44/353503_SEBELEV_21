const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Ошибка: Разрешены только файлы изображений (jpeg, jpg, png, gif, webp)!');
};

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/cars/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadDisk = multer({
    storage: diskStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: fileFilter
});

const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 1024 * 1024 * 1 }, // 1MB
    fileFilter: fileFilter
});

module.exports = { uploadDisk, uploadMemory };
