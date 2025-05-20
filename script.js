
// fruitVegDb.js content merged here for simplicity
const fruitVegDb = [
  { name: "Apple", avgWeightKg: 0.15 },
  { name: "Banana", avgWeightKg: 0.12 },
  { name: "Carrot", avgWeightKg: 0.1 },
  { name: "Tomato", avgWeightKg: 0.13 },
  { name: "Orange", avgWeightKg: 0.2 },
  { name: "Lime", avgWeightKg: 0.06 },
  // ... Add all other items up to 200 here with their average weight in kg
  // Example:
  { name: "Strawberry", avgWeightKg: 0.005 },
  { name: "Broccoli", avgWeightKg: 0.3 },
  // etc...
];

// Roboflow API details
const apiKey = "GB0kZ53wdYSBmy34HxXW";  // Your Roboflow API key
const modelEndpoint = "https://detect.roboflow.com/fruit-veg-detector/train";

// Function to send image to Roboflow and get detections
async function detectFruitVeg(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${modelEndpoint}?api_key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Detection API error");
    const data = await response.json();
    return data.predictions; // Array of detected objects
  } catch (error) {
    console.error(error);
    alert("Error calling AI detection.");
    return [];
  }
}

// Calculate total weight in kg based on detections
function calculateTotalWeight(detections) {
  const results = {};

  detections.forEach((det) => {
    const name = det.class;
    if (!results[name]) results[name] = 0;
    results[name]++;
  });

  let totalWeightKg = 0;
  for (const [name, count] of Object.entries(results)) {
    const item = fruitVegDb.find(fv => fv.name.toLowerCase() === name.toLowerCase());
    if (item) {
      totalWeightKg += count * item.avgWeightKg;
    }
  }

  return totalWeightKg;
}

// Main process function called on button click
async function processImage() {
  const input = document.getElementById("imageInput");
  if (input.files.length === 0) {
    alert("Please select an image first.");
    return;
  }

  const detections = await detectFruitVeg(input.files[0]);
  if (detections.length === 0) {
    document.getElementById("results").innerText = "No fruits or vegetables detected.";
    return;
  }

  let detectedText = "Detected items:\n";
  const counts = {};
  detections.forEach(det => {
    counts[det.class] = (counts[det.class] || 0) + 1;
  });
  for (const [name, count] of Object.entries(counts)) {
    detectedText += `${name}: ${count}\n`;
  }

  const totalWeightKg = calculateTotalWeight(detections);
  const kg = Math.floor(totalWeightKg);
  const grams = Math.round((totalWeightKg - kg) * 1000);

  detectedText += `\nEstimated total stock weight in box: ${kg} kg ${grams} g`;

  document.getElementById("results").innerText = detectedText;
}
