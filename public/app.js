const form = document.getElementById("uploadForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  fetch("/upload", { method: "POST", body: formData })
    .then((response) => response.json())
    .then((fileInfo) => {
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
    })
    .catch((error) => console.error(error));
});
