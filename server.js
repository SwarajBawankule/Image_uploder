const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Replace the MongoDB URI with your actual connection string
const mongoURI = "mongodb+srv://pkp22:2qHecDYGg8uG7D2X@pkp.utkz9dm.mongodb.net/elegance?retryWrites=true&w=majority&appName=pkp";

// Define the maximum file size (5 MB in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Upload Endpoint
app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.file;

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ msg: "File size exceeds the 5 MB limit" });
  }

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () =>
  console.log("MongoDB connection is established successfully!!!")
);

app.listen(port, () => console.log(`The app is running on Port: ${port}`));
