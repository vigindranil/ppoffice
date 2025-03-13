// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure the uploads directory exists (Multer needs a temp location)
// const uploadDir = path.join(__dirname, "../uploads/");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Multer storage config (TEMPORARY before FTP upload)
// // const storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //         cb(null, uploadDir); // Save locally before moving to FTP
// //     },
// //     filename: function (req, file, cb) {
// //         cb(null, `${Date.now()}_${file.originalname}`);
// //     },
// // });

// const storage = multer.memoryStorage();

// // File type validation
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
//     }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;