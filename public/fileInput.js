const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", onFileInputChange);

function onFileInputChange() {
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
}
