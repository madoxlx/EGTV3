import express, { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export function setupUploadRoutes(app: Express) {
  console.log('🔧 Setting up upload routes...');
  
  // Serve uploaded files statically first
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
  
  // Add a test endpoint to verify API routing
  app.get('/api/upload/test', (req: Request, res: Response) => {
    res.json({ message: 'Upload API is working', timestamp: new Date().toISOString() });
  });
  
  // Single file upload endpoint for tours - with explicit content type handling
  app.post('/api/upload', (req: Request, res: Response, next: any) => {
    // Set response type to JSON explicitly
    res.setHeader('Content-Type', 'application/json');
    next();
  }, upload.single('file'), (req: Request, res: Response) => {
    console.log('📤 Upload request received:', req.file ? req.file.originalname : 'no file');
    try {
      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the public URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      console.log('✅ File uploaded successfully:', fileUrl);
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Multiple files upload endpoint
  app.post('/api/upload/multiple', upload.array('files', 10), (req: Request, res: Response) => {
    console.log('Multiple upload request received:', req.files ? req.files.length : 'no files');
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.log('No files in multiple upload request');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Return the public URLs for all uploaded files
      const files = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
      
      console.log('Multiple files uploaded successfully:', files.length);
      res.json({ files });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Image upload endpoint for hero slides
  app.post('/api/upload/image', upload.single('image'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Error handling middleware for multer
  app.use((error: any, req: Request, res: Response, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
    }
    next(error);
  });
}