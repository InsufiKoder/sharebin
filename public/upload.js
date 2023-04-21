const form = document.getElementById("uploadForm");
const fileSizeError = document.getElementById("fileSizeError");

const fileSizeLimit = false;
const maxFileSizeKB = 256000;

form.addEventListener("submit", onSubmit);

function onSubmit(event) {
  event.preventDefault();
  fileSizeError.style.display = "none";
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!fileSizeLimit && file.size > maxFileSizeKB * 1024) {
    fileSizeError.style.display = "block";
    return;
  }
  const formData = new FormData(form);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  xhr.upload.addEventListener("progress", onUploadProgress);
  xhr.addEventListener("load", onUploadComplete);
  xhr.send(formData);
}

function onUploadProgress(event) {
  const progressBar = document.getElementById("progressBar");
  const percent = Math.round((event.loaded / event.total) * 100);
  progressBar.value = percent;
}

function onUploadComplete(event) {
  const fileInfo = JSON.parse(event.target.responseText);
  addFileToTable(fileInfo);
  fileInput.value = "";
}

function addFileToTable(fileInfo) {
  const table = document.querySelector("table tbody");
  const row = document.createElement("tr");
  const nameCell = document.createElement("td");
  const nameLink = document.createElement("a");
  nameLink.href = fileInfo.url;
  nameLink.textContent = fileInfo.name;
  nameCell.appendChild(nameLink);
  const sizeCell = document.createElement("td");
  sizeCell.textContent = fileInfo.size;
  const actionCell = document.createElement("td");
  const downloadLink = document.createElement("a");
  downloadLink.href = fileInfo.url;
  downloadLink.setAttribute("download", "");
  downloadLink.textContent = "Download";
  actionCell.appendChild(downloadLink);
  row.appendChild(nameCell);
  row.appendChild(sizeCell);
  row.appendChild(actionCell);
  table.appendChild(row);
}
