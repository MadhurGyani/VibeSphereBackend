// routes/paymentRoutes.js
import express from 'express';
import { uploader } from '../controllers/upload.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/api/v1/uploads').post( upload.single('video'), uploader);


export default router;
