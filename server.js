const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron"); // Added for scheduling tasks

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

app.locals.formatBytes = formatBytes;

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const routes = require("./routes"); // Importing routes from routes.js
app.use(routes); // Using routes in the app

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Schedule a cron job to delete files older than 1 week
cron.schedule("* * * * *", () => {
  const directory = path.join(__dirname, "public/uploads");
  const files = fs.readdirSync(directory);
  const currentTime = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentTime.getDate() - 7);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isFile() && fileStat.mtime < oneWeekAgo) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  });
});
