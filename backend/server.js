import express from "express";
import mongoose from "mongoose";

import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./openapi.json" assert { type: "json" };

import usersRoute from "./routes/usersRoute.js";
import listings from "./routes/listings.js";
import reservations from "./routes/reservations.js";
import uploads from "./routes/uploadsRoute.js";

dotenv.config();

//express app
const app = express();

const corsOrigin =
  process.env.MODE === "PRODUCTION"
    ? ["http://vcsrentals.xyz", "http://141.136.44.49"]
    : "http://localhost:5173";

const corsOptions = {
  origin: [
    "http://vcsrentals.xyz",
    "http://141.136.44.49",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

//middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/uploads", express.static("uploads"));

//routes
app.use("/api/listings", listings);
app.use("/api/reservations", reservations);
app.use("/api/users", usersRoute);
app.use("/api/uploads", uploads);

mongoose
  .connect(process.env.URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`DB connected and listening on ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

export default app;
