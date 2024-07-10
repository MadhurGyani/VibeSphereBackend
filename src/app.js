import cors from "cors";
const app = express();



app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(express.json());

// http://localhost:8000/api/v1/users/register

import express from "express";
import paymentRoutes from "./routes/payment.router.js";
import uploadRoutes from "./routes/upload.router.js";

app.use(express.json());

app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/upload", uploadRoutes);

export { app };
