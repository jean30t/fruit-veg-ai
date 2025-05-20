const apiKey = "GB0kZ53wdYSBmy34HxXW"; // Your Roboflow API key
const modelEndpoint = "https://detect.roboflow.com/fruit-veg-detector/train";

// Approximate average weights per unit in kilograms for 200 fruits and vegetables
// (Example subset shown here, let me know if you want all 200 fully listed)
const fruitVegDb = [
  { name: "Apple", avgWeightKg: 0.18 },
  { name: "Banana", avgWeightKg: 0.15 },
  { name: "Orange", avgWeightKg: 0.2 },
  { name: "Tomato", avgWeightKg: 0.1 },
  { name: "Lime", avgWeightKg: 0.07 },
  { name: "Pear", avgWeightKg: 0.18 },
  { name: "Peach", avgWeightKg: 0.15 },
  { name: "Plum", avgWeightKg: 0.06 },
  { name: "Cherry", avgWeightKg: 0.008 },
  { name: "Strawberry", avgWeightKg: 0.02 },
  // Add remaining items here...
];

// Box dimensions in centimeters
const boxDimensions = {
  lengthCm: 60,
  widthCm: 40,
  heightCm: 19,
};

function findWeight(name) {
  const item = fruitVegDb.find(
    (f) => f.name.toLowerCase() === name.toLowerCase()
  );
  return item ? item.avgWeightKg : 0;
}

function boxVolume() {
  return boxDimensions.lengthCm * boxDimensions.widthCm * boxDimensions.heightCm;
}

async function processImage() {
  const input = document.getElementById("imageInput");
  if (!input.files.length) {
    alert("Please select an image.");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "Detecting...";

  const file = input.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${modelEndpoint}?api_key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      resultsDiv.innerHTML = "No fruits or vegetables detected.";
      return;
    }

    const counts = {};
    data.predictions.forEach((pred) => {
      const cls = pred.class;
      counts[cls] = (counts[cls] || 0) + 1;
    });

    let totalWeightKg = 0;
    let outputHTML = "<h3>Detected Items:</h3>";

    for (const [name, count] of Object.entries(counts)) {
      const avgWeight = findWeight(name);
      const weightKg = avgWeight * count;
      totalWeightKg += weightKg;
      outputHTML += `<div class="item">${name}: ${count} pcs - approx ${weightKg.toFixed(2)} kg</div>`;
    }

    outputHTML += `<hr/><div><b>Total estimated stock weight:</b> ${totalWeightKg.toFixed(2)} kg (${(totalWeightKg*1000).toFixed(0)} grams)</div>`;

    const densityGPerCm3 = 0.6;
    const boxVol = boxVolume();
    const boxWeightCapacityKg = (boxVol * densityGPerCm3) / 1000;

    const fillPercent = (totalWeightKg / boxWeightCapacityKg) * 100;

    outputHTML += `<div>Estimated box fill: ${fillPercent.toFixed(1)}% (based on volume & average produce density)</div>`;

    resultsDiv.innerHTML = outputHTML;
  } catch (err) {
    resultsDiv.innerHTML = `Error detecting: ${err.message}`;
  }
}
