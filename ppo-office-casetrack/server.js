const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const caseRoutes = require('./routes/caseRoutes');
const myRoutes = require('./routes/myRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');


const port = process.env.PORT || 3000;  // Use the port from .env or default to 3000

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(uploadDir));

// Configure Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, 'uploads/'); // Save files in 'uploads' folder
//   },
//   filename: function (req, file, cb) {
//       // Ensure req.documents_path is an array before using spread syntax
//       if (!Array.isArray(req.documents_path)) {
//           req.documents_path = [];
//       }
//       const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
//       req.documents_path.push(filename);
//       cb(null, filename);
//   }
// });

const storage = multer.memoryStorage();


// File filter to allow only specific file types (optional)
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all file types (modify if needed)
};

// Multer middleware (NO LIMIT on number of files)
const upload = multer({ storage, fileFilter });


app.use('/api/cases', caseRoutes);

const routes = require('./routes/routes');

app.use('/', routes);

app.use('/', myRoutes);
app.use('/api/upload', upload.array('documents'), uploadRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});