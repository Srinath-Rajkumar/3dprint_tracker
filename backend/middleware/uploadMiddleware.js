// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//     destination(req, file, cb) {
//         cb(null, 'uploads/'); // Make sure 'uploads' folder exists in backend root
//     },
//     filename(req, file, cb) {
//         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// function checkFileType(file, cb) {
//     const filetypes = /jpg|jpeg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (extname && mimetype) {
//         return cb(null, true);
//     } else {
//         cb('Images only (jpg, jpeg, png)!');
//     }
// }

// const upload = multer({
//     storage,
//     fileFilter: function (req, file, cb) {
//         checkFileType(file, cb);
//     }
// });

// export default upload;
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // This will save into the 'backend/uploads/' directory
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only (jpg, jpeg, png)!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

export default upload;