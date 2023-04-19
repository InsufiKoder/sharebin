const form = document.getElementById("uploadForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
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
    sizeCell.textContent = `${fileInfo.size} bytes`;
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
  });
  xhr.send(formData);
});
