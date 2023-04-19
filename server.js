const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) =>
      cb(
        null,
        `${path.parse(file.originalname).name}-${Date.now()}${path.extname(
          file.originalname
        )}`
      ),
  }),
}).single("file");

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send("Internal server error");
    }
    const fileInfo = {
      name: req.file.originalname,
      size: req.file.size.toString(),
      url: `/uploads/${req.file.filename}`,
    };
    res.json(fileInfo);
  });
});

app.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);
  fs.existsSync(filePath) ? res.sendFile(filePath) : res.sendStatus(404);
});

app.get("/", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "uploads"));
  const fileList = files.map((file) => {
    const filePath = path.join(__dirname, "uploads", file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      size: stats.size,
      url: `/uploads/${file}`,
    };
  });
  res.render("index", { fileList });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.locals.formatBytes = (bytes, decimals = 2) => {
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Error handler middleware
app.use((err, req, res, next) => {
  if (err) {
    return res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
