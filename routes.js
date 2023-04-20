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

const FILES_PER_PAGE = 10;

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

  // get page query parameter or default to 1
  const page = parseInt(req.query.page) || 1;

  // calculate start and end indices of files to show on the page
  const startIdx = (page - 1) * FILES_PER_PAGE;
  const endIdx = startIdx + FILES_PER_PAGE;

  // slice the fileList array to show only the files for the current page
  const filesToShow = fileList.slice(startIdx, endIdx);

  // calculate total number of pages
  const totalPages = Math.ceil(fileList.length / FILES_PER_PAGE);

  res.render("index", { fileList: filesToShow, totalPages, currentPage: page });
});

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;
