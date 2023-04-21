const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { FILES_PER_PAGE } = require("./config.json");

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
  const fileList = files
    .map((file) => {
      const filePath = path.join(__dirname, "uploads", file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        url: `/uploads/${file}`,
        createdAt: stats.birthtimeMs,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalFiles = fileList.length;
  const totalPages = Math.ceil(totalFiles / FILES_PER_PAGE);
  let page = req.query.page || 1;
  if (page < 1) {
    page = 1;
  } else if (page > totalPages) {
    page = totalPages;
  }
  const startIndex = (page - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;
  const pageFiles = fileList.slice(startIndex, endIndex);
  res.render("index", { fileList: pageFiles, totalPages, currentPage: page });
});

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;
