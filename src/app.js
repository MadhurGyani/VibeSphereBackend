import cors from "cors";
const app = express();

const allowedOrigins = [ 'https://vibesphere.netlify.app/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(express.json());

// http://localhost:8000/api/v1/users/register

import express from "express";
import paymentRoutes from "./routes/payment.router.js";

app.use(express.json());

app.use("/api/v1/payment", paymentRoutes);

export { app };
