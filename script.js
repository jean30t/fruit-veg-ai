
const API_KEY = "GB0kZ53wdYSBmy34HxXW";
const MODEL_ID = "fruit-and-vegetable-120-classes";
const MODEL_VERSION = 5;
const BOX_LENGTH_CM = 60;
const BOX_WIDTH_CM = 40;
const BOX_HEIGHT_CM = 19;

document.getElementById("detectBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("imageUpload");
  const image = fileInput.files[0];
  if (!image) {
    alert("Please upload an image first.");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);

  try {
    const response = await fetch(`https://detect.roboflow.com/${MODEL_ID}/${MODEL_VERSION}?api_key=${API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    const outputDiv = document.getElementById("output");
    if (!data || !data.predictions || data.predictions.length === 0) {
      outputDiv.innerText = "No fruits or vegetables detected.";
      return;
    }

    // Calculate approximate stock volume per fruit/vegetable
    const totalDetections = data.predictions.length;
    outputDiv.innerText = `Detected ${totalDetections} items. (Box size: ${BOX_LENGTH_CM} x ${BOX_WIDTH_CM} x ${BOX_HEIGHT_CM} cm)`;

    // Optionally: Display each item name
    const list = document.createElement("ul");
    data.predictions.forEach(pred => {
      const li = document.createElement("li");
      li.textContent = `${pred.class} (Confidence: ${Math.round(pred.confidence * 100)}%)`;
      list.appendChild(li);
    });
    outputDiv.appendChild(list);

  } catch (error) {
    alert("Error calling AI detection.");
    console.error("Detection error:", error);
  }
});
