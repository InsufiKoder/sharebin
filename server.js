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
  fileFilter: (req, file, cb) => {
    if (/\.exe$|\.bat$/i.test(file.originalname)) {
      return cb(new Error("Executables are not allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 250 * 1024 * 1024 },
}).single("file");

const checkFileRestrictions = (file) => {
  if (/\.exe$|\.bat$/i.test(file.originalname)) {
    return "Executables are not allowed";
  }
  if (file.size > 250 * 1024 * 1024) {
    return "File size is too large";
  }
  return null;
};

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send("File too large");
        }
      }
      return res.status(500).send("Internal server error");
    }
    const error = checkFileRestrictions(req.file);
    if (error) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send(error);
    }
    const fileInfo = {
      name: req.file.originalname,
      size: req.file.size,
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
  const fileList = files.map((file) => ({
    name: file,
    url: `/uploads/${file}`,
  }));
  res.render("index", { fileList }); // Ensure fileList is passed to the template
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
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("File too large");
    } else if (/.exe$|.bat$/i.test(err.message)) {
      return res.status(400).send("Executables are not allowed");
    }
    return res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
