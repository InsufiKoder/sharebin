const form = document.getElementById("uploadForm");
const fileSizeError = document.getElementById("fileSizeError");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  fileSizeError.style.display = "none";
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (file.size > 250 * 1024 * 1024) {
    fileSizeError.style.display = "block";
    return;
  }
  const formData = new FormData(form);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  xhr.upload.addEventListener("progress", (event) => {
    const progressBar = document.getElementById("progressBar");
    const percent = Math.round((event.loaded / event.total) * 100);
    progressBar.value = percent;
  });
  xhr.addEventListener("load", (event) => {
    const fileInfo = JSON.parse(xhr.responseText);
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
    fileInput.value = "";
  });
  xhr.send(formData);
});

const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", () => {
  const fileSize = document.getElementById("fileSize");
  const file = fileInput.files[0];
  const fileExtension = file.name.split(".").pop();
  const restrictedExtensions = ["exe", "bat", "com"];

  if (restrictedExtensions.includes(fileExtension)) {
    alert("File type not allowed");
    fileInput.value = "";
    fileSize.textContent = "";
    return;
  }

  fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
});
