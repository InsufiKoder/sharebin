const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// Set up multer to store uploaded files with their original names and extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + "-" + Date.now() + ext);
  },
});
const upload = multer({ storage });

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const fileInfo = {
    name: file.originalname,
    size: file.size,
    url: `/uploads/${file.filename}`,
  };
  res.json(fileInfo);
});

app.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendStatus(404);
  }
});

app.get("/", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "uploads"));
  const fileList = files.map((file) => ({
    name: file,
    url: `/uploads/${file}`,
  }));
  res.render("index", { fileList: fileList }); // Ensure fileList is passed to the template
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.locals.formatBytes = function (bytes, decimals = 2) {
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
};

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
