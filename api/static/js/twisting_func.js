let currentID = 1;
let currentValueType = "MAX"; // Default value type abbreviation
let data = {};

let machineNumber = "";
let operator = "";
let dtex = "";
let tpm = "";
let rpm = "";
let stdTens = "";
let devTens = "";
let itemNum = "";

// Load data from localStorage when the page is loaded
window.addEventListener("load", () => {
  const savedData = localStorage.getItem("twistingData");
  if (savedData) {
    data = JSON.parse(savedData);
    // Update any necessary UI elements based on the loaded data
    updateIDDisplay();
    updateSpecForm();
    updateAllowTensDisplay();
    // ... (other updates)
  }
});

// Save data to localStorage whenever it's modified
function saveDataToLocalStorage() {
  localStorage.setItem("twistingData", JSON.stringify(data));
}

function resetStorage() {
  const confirmation = confirm(
    "Are you sure you want to clear all stored data within this browser?"
  );
  if (confirmation === !null) {
    localStorage.removeItem("twistingData");
  }
}

function autoScroll(event, where) {
  event.preventDefault(); // Prevent the default form submission
  localStorage.setItem("scrollPosition", window.scrollY);
  window.scrollTo(0, where); // Scroll to the specified position
}

function updateSpecForm() {
  document.getElementById("machine-number").value = data["machineNumber"];
  document.getElementById("operator").value = data["operator"];
  document.getElementById("dtex").value = data["dtex"];
  document.getElementById("tpm").value = data["tpm"];
  document.getElementById("rpm").value = data["rpm"];
  document.getElementById("spec-tens").value = data["stdTens"];
  document.getElementById("tens-dev").value = data["devTens"];
  document.getElementById("item-number").value = data["itemNum"];
}

function updateIDDisplay() {
  const currentIDElement = document.getElementById("current-id");
  currentIDElement.textContent = currentID;
  document.getElementById("displayed-id").textContent = currentID;
  document.getElementById("displayed-id-prob").textContent = currentID;
  displayRecordedNumbers();
  displayRecordedProbs();
}

function changeValueType() {
  currentValueType = currentValueType === "MIN" ? "MAX" : "MIN";
  updateValueTypeDisplay();
  displayRecordedNumbers();
}

function updateValueTypeDisplay() {
  const valueTypeElement = document.getElementById("value-type");
  valueTypeElement.textContent = currentValueType;
}

function updateAllowTensDisplay() {
  const specTens = Number(data["stdTens"]);
  const dvTens = Number(data["devTens"]);
  document.getElementById("max-allow-tens").textContent = specTens + dvTens;
  document.getElementById("min-allow-tens").textContent = specTens - dvTens;
}

function prevID() {
  if (currentID > 1) {
    currentID--;
    updateIDDisplay();
  }
}

function nextID() {
  if (currentID < 84) {
    currentID++;
    currentValueType = "MAX";
    updateValueTypeDisplay();
    updateIDDisplay();
  }
}

function appendNumber(num) {
  const numberInput = document.getElementById("number");
  numberInput.value += num;
}

function backspaceNumber() {
  const numberInput = document.getElementById("number");
  numberInput.value = numberInput.value.slice(0, -1);
}

function clearNumber() {
  const numberInput = document.getElementById("number");
  numberInput.value = "";
}

function recordProb() {
  const probInput = document.getElementById("problem");
  const problems = probInput.value;

  if (!data[currentID]) {
    data[currentID] = {};
  }

  if (!data[currentID]["Problems"]) {
    data[currentID]["Problems"] = [];
  }

  data[currentID]["Problems"].push(problems);
  console.log(data);
  probInput.value = "";
  saveDataToLocalStorage();
  displayRecordedProbs();
}

function recordNumber() {
  const numberInput = document.getElementById("number");
  const number = numberInput.value;

  if (!data[currentID]) {
    data[currentID] = {};
  }

  if (!data[currentID][currentValueType]) {
    data[currentID][currentValueType] = [];
  }

  if (!data[currentID][currentValueType]["statusTens"]) {
    data[currentID][currentValueType]["statusTens"] = "";
  }

  const maxAllowTens = data["stdTens"] + data["devTens"];
  const minAllowTens = data["stdTens"] - data["devTens"];
  let tenStatus = "normal";

  if (number > maxAllowTens) {
    data[currentID][currentValueType]["statusTens"] = "high";
    tenStatus = "high";
    recordProb();
  }
  if (number < minAllowTens) {
    data[currentID][currentValueType]["statusTens"] = "low";
    tenStatus = "low";
    recordProb();
  }

  // Add the number to the array
  data[currentID][currentValueType].push(number);
  saveDataToLocalStorage();
  numberInput.value = "";

  minValExist = false;
  maxValExist = false;

  for (let val in data[currentID]) {
    if (data[currentID] && data[currentID][val]) {
      if (val === "MIN" && data[currentID][val].length > 0) {
        minValExist = true;
      }
      if (val === "MAX" && data[currentID][val].length > 0) {
        maxValExist = true;
      }
    }
  }

  console.log(data);
  if (minValExist && maxValExist) {
    nextID();
    displayRecordedNumbers();
    console.log("All normal");
  } else {
    changeValueType();
    displayRecordedNumbers();
    console.log("Something's not right");
  }
}

function nextForms() {
  machineNumber = document.getElementById("machine-number").value;
  operator = document.getElementById("operator").value;
  dtex = document.getElementById("dtex").value;
  tpm = document.getElementById("tpm").value;
  rpm = document.getElementById("rpm").value;
  stdTens = document.getElementById("spec-tens").value;
  devTens = document.getElementById("tens-dev").value;
  itemNum = document.getElementById("item-number").value;

  data["machineNumber"] = machineNumber;
  data["operator"] = operator;
  data["dtex"] = dtex;
  data["tpm"] = tpm;
  data["rpm"] = rpm;
  data["stdTens"] = stdTens;
  data["devTens"] = devTens;
  data["itemNum"] = itemNum;

  saveDataToLocalStorage();
  console.log(data);
  updateAllowTensDisplay();
  autoScroll(event, 1000);
}

function finishRecording() {
  const confirmation = confirm("Are you sure you want to finish?");

  if (confirmation === !null) {
    writeCSV(
      data["machineNumber"],
      data["operator"],
      data["dtex"],
      data["tpm"],
      data["rpm"],
      data["stdTens"],
      data["devTens"],
      data["itemNum"]
    );
  }
}

function writeCSV(machineNumber, operator, dtx, twm, rpm, stdT, devT, itemN) {
  let csvContent = "";
  csvContent += `Machine No.,${machineNumber},Item Number,${itemN}\n`;
  csvContent += `RPM, ${rpm},D-tex,${dtx},Operator Name,${operator}\n`;
  csvContent += `TPM,${twm}\n`;
  csvContent += `Spec STD,${stdT}\n`;
  csvContent += `±,${devT}\n`;
  csvContent += `Spindle Number,MIN Value,MAX Value,Stated Problem(s)\n`;

  const ids = Object.keys(data); // Get an array of data IDs
  const numIdsToDelete = 8; // Number of IDs to delete from the end
  console.log(data);

  // Loop through all IDs except the last few and append to csvContent
  for (let i = 0; i < ids.length - numIdsToDelete; i++) {
    const id = ids[i];
    const minTensionVal = data[id]?.["MIN"] || "";
    const maxTensionVal = data[id]?.["MAX"] || "";
    const spindleProb = data[id]?.["Problems"] || "";
    csvContent += `${id}.,${minTensionVal}.,${maxTensionVal}., ${spindleProb}.\n`;
  }
  const currentDateTime = new Date().toLocaleString(); // Get current date and time in a localized format
  data["datetime"] = currentDateTime;
  console.log(data["datetime"]);
  const filename = `[${machineNumber}] - [${itemN}] - [${operator}] - [${currentDateTime}]`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);

  const confirmDownloadCSV = confirm(
    "Do you want to download the CSV file to this device as backup?"
  );
  if (confirmDownloadCSV) {
    link.click();
  }

  const jsonData = JSON.stringify(data);
  fetch("/store_tw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: jsonData,
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);  // Access the message property in the JSON response
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function deleteData(dataType) {
  if (dataType === "tension") {
    const recordedValue = data[currentID][currentValueType];
    delete recordedValue.pop();
    saveDataToLocalStorage();
    displayRecordedNumbers();
  } else {
    if (data[currentID]["Problems"]) {
      const problems = data[currentID]["Problems"];
      delete problems.pop();
      saveDataToLocalStorage();
      console.log(data[currentID]["Problems"]);
      displayRecordedProbs();
    } else {
      data[currentID]["Problems"] = [];
      displayRecordedProbs();
    }
  }
}

function displayRecordedNumbers() {
  const minNumbersList = document.getElementById("min-numbers-list");
  const maxNumbersList = document.getElementById("max-numbers-list");

  minNumbersList.innerHTML = "";
  maxNumbersList.innerHTML = "";

  const currentIDData = data[currentID];
  if (currentIDData) {
    const currentMinValues =
      currentIDData && currentIDData["MIN"] ? currentIDData["MIN"] : [];
    const currentMaxValues =
      currentIDData && currentIDData["MAX"] ? currentIDData["MAX"] : [];

    if (currentMinValues) {
      currentMinValues.forEach((number) => {
        const listItem = document.createElement("li");
        listItem.textContent = number;
        minNumbersList.appendChild(listItem);
      });
    }

    if (currentMaxValues) {
      currentMaxValues.forEach((number) => {
        const listItem = document.createElement("li");
        listItem.textContent = number;
        maxNumbersList.appendChild(listItem);
      });
    }
  }
}

function displayRecordedProbs() {
  const problemList = document.getElementById("prob-list");
  problemList.innerHTML = "";
  const currentIDData = data[currentID];

  if (currentIDData) {
    const currentIDProbs =
      currentIDData && currentIDData["Problems"]
        ? currentIDData["Problems"]
        : [];

    if (currentIDProbs) {
      currentIDProbs.forEach((problem) => {
        const listItem = document.createElement("li");
        listItem.textContent = problem;
        problemList.appendChild(listItem);
      });
    }
  }
}
