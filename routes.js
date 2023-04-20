const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

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

router.post("/upload", (req, res) => {
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

router.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);
  fs.existsSync(filePath) ? res.sendFile(filePath) : res.sendStatus(404);
});

router.get("/", (req, res) => {
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

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;
