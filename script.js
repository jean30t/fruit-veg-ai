const apiKey = "qJw0TfxGevUPDqJEVZft";  // Public Roboflow API key
const modelEndpoint = "https://detect.roboflow.com/fruit-vegetable-120/1";

// Approximate average weights in kg
const avgWeights = {
  apple: 0.15, banana: 0.12, carrot: 0.1, tomato: 0.13, orange: 0.2,
  lime: 0.06, strawberry: 0.005, broccoli: 0.3, cucumber: 0.25,
  onion: 0.2, lemon: 0.12, potato: 0.3, watermelon: 4,
  // Add more here if needed...
};

async function processImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];
  if (!file) return alert("Please select an image first.");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${modelEndpoint}?api_key=${apiKey}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    alert("Detection failed. Try again.");
    return;
  }

  const result = await response.json();
  const detections = result.predictions;

  if (detections.length === 0) {
    document.getElementById("results").innerText = "No items detected.";
    return;
  }

  const counts = {};
  detections.forEach(det => {
    const label = det.class.toLowerCase();
    counts[label] = (counts[label] || 0) + 1;
  });

  let output = "Detected items:\n";
  let totalKg = 0;

  for (const [name, count] of Object.entries(counts)) {
    const weight = avgWeights[name] || 0.1; // fallback weight
    const subtotal = weight * count;
    totalKg += subtotal;
    output += `${name} x ${count} = ${subtotal.toFixed(2)} kg\n`;
  }

  const kg = Math.floor(totalKg);
  const grams = Math.round((totalKg - kg) * 1000);
  output += `\nEstimated box stock: ${kg} kg ${grams} g (Box: 60x40x19 cm)`;

  document.getElementById("results").innerText = output;
}
