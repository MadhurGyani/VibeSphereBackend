// routes/paymentRoutes.js
import express from 'express';
import { createPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.route("/createPayment").post(createPayment);

export default router;
