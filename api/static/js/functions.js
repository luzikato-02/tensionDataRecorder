let currentColumn = "N";
let currentValueType = "MAX"; // Default value type abbreviation
let currentCreelRow = "A";
let currentCreelRowInput = "A";
let currentCreelSide = "Ai";
let currentCreelSideInput = "Out";
let abnormalColor = "";
let data = {};
let colIDs = [];

let machineNumber = "";
let operator = "";
let prod_order = "";
let tpm = "";
let stl = "";
let cntNoens = "";
let colCodeens = "";
let itemNum = "";

// Load data from localStorage when the page is loaded
window.addEventListener("load", () => {
  const savedData = localStorage.getItem("savedData");
  if (savedData) {
    // Parse data from local storage variable
    data = JSON.parse(savedData);
    // Update displayed column number in recording form
    updateIDDisplay();
    // Update specification form value to show stored spec data
    updateSpecForm();
    // Show recorded target columns as form values
    displayRecordedTargetColumns();
    // ... (other updates)
    console.log(data);
  }
});

// Save data to localStorage whenever it's modified
function saveDataToLocalStorage() {
  localStorage.setItem("savedData", JSON.stringify(data));
}

// Record inputted specs in specification form
function recordSpecs() {
  // Call html element as assign it to variables
  machineNumber = document.getElementById("machine-number").value;
  operator = document.getElementById("operator").value;
  prodOrder = document.getElementById("production-order").value;
  baleNo = document.getElementById("bale-no").value;
  colorCode = document.getElementById("color-code").value;
  styleSpec = document.getElementById("style-spec").value;
  counterNo = document.getElementById("counter-number").value;

  // If stored data exist, show recorded specs as form values
  data["machineNumber"] = machineNumber;
  data["operator"] = operator;
  data["productionOrder"] = prodOrder;
  data["baleNo"] = baleNo;
  data["style"] = styleSpec;
  data["counterNo"] = counterNo;
  data["colorCode"] = colorCode;

  // After appending new specs data to data array, update stored data array in localStorage
  saveDataToLocalStorage();
  console.log(data);
  autoScroll(event, 1000);
}

// Switch current selected creel side in targeting form
function changeCreelSideInput() {
  event.preventDefault();
  currentCreelSideInput = currentCreelSideInput === "In" ? "Out" : "In";
  updateCreelSideInputDisplay();
  displayRecordedTargetColumns();
}

// Switch current selected row in targeting form
function changeCreelRowInput(direction) {
  event.preventDefault();
  // Define an array of available rows
  rows = ["A", "B", "C", "D", "E"];
  if (direction === "next") {
    // Change current selected row variable
    // Get next item in the array by getting the next index of the array
    // If the next index exceeded the array length, then go back to first index item
    currentCreelRowInput =
      rows.indexOf(currentCreelRowInput) + 1 > rows.length - 1
        ? rows[0]
        : rows[rows.indexOf(currentCreelRowInput) + 1];
    updateCreelRowInput();
  }
  if (direction === "prev") {
    // Change current selected row variable
    // Get previous item in the array by getting the previous index of the array
    // If the previous index is less than 0, then go to the last item of the array
    event.preventDefault();
    currentCreelRowInput =
      rows.indexOf(currentCreelRowInput) - 1 < 0
        ? rows[rows.length - 1]
        : rows[rows.indexOf(currentCreelRowInput) - 1];
    updateCreelRowInput();
  }

  // When the creel row changed, automatically switch to "Outside" (intended, may need some revision)
  changeCreelSideInput();
  // Update current selected creel side in targetting form
  updateCreelSideInputDisplay();
  // Display recorded targetted columns
  displayRecordedTargetColumns();
}

// Record targetted column numbers
function recordColumnNumbers() {
  event.preventDefault();
  // Get HTML element and assign it to variables
  const maxColNum = document.getElementById("max-col-num").value;
  const minColNum = document.getElementById("min-col-num").value;

  // Checks if "recordTarget" key has a value
  if (!data["recordTarget"]) {
    data["recordTarget"] = {};
  }
  // Checks if data array keys and values corresponding to currently selected TARGETED creel side,
  // creel row, and columns exist.
  // If not, then create an object to store the values.
  if (!data["recordTarget"][currentCreelRowInput]) {
    data["recordTarget"][currentCreelRowInput] = {};
  }
  if (!data["recordTarget"][currentCreelRowInput][currentCreelSideInput]) {
    data["recordTarget"][currentCreelRowInput][currentCreelSideInput] = [];
  }
  if (
    data["recordTarget"][currentCreelRowInput][currentCreelSideInput].length > 1
  ) {
    data["recordTarget"][currentCreelRowInput][currentCreelSideInput] = [];
  }

  // Append the column numbers to the data array by taking the smallest and biggest number
  // of the TARGETED column number
  for (let i = Number(minColNum); i <= maxColNum; i++) {
    data["recordTarget"][currentCreelRowInput][currentCreelSideInput].push(i);
  }

  // Empty form after recording data
  maxColNum.value = "";
  minColNum.value = "";

  console.log(data);
  // If both sides column numbers is filled, switch to next creel row
  if (currentCreelSideInput === "In") {
    changeCreelRowInput("next");
  } else {
    // If not then, change to another side
    changeCreelSideInput();
  }
  // Update data array in localStorage
  saveDataToLocalStorage();
}

// Create array of column target for four creel sides
function arrangeDataID() {
  sidesID = {
    Ai: {},
    Ao: {},
    Bi: {},
    Bo: {},
  };

  rws = data["recordTarget"];
  for (var s in sidesID) {
    if (s === "Ai" || s === "Bi") {
      for (var i in rws) {
        const key = i;
        sidesID[s][key] = rws[i]["In"];
      }
    } else {
      for (var i in rws) {
        const key = i;
        sidesID[s][key] = rws[i]["Out"];
      }
    }
  }
  return sidesID;
}

// Display recorded targetted column numbers
function displayRecordedTargetColumns() {
  const minColNum = document.getElementById("min-columns");
  const maxColNum = document.getElementById("max-columns");

  const rowsData = data["recordTarget"];
  if (rowsData) {
    const currentRowData = rowsData[currentCreelRowInput];
    if (currentRowData) {
      const currentSideData = currentRowData[currentCreelSideInput];
      if (currentSideData) {
        const currentMinColValue = currentSideData[0];
        const currentMaxColValue = currentSideData[currentSideData.length - 1];
        minColNum.textContent = currentMinColValue;
        maxColNum.textContent = currentMaxColValue;
      }
    }
  }
}

// Finish recording targets
function finishRecordRowNums() {
  event.preventDefault();
  colIDs = arrangeDataID();
  console.log(colIDs);
  // Prompt to check the inputted data
  const confirmation = confirm(
    `Are you sure you want to start recording tension? Please check the inputted target columns before continuing!`
  );

  if (confirmation === !null) {
    currentColumn = colIDs[currentCreelSide][currentCreelRow][0];
    updateIDDisplay();
    console.log(colIDs[currentCreelSide][currentCreelRow][0]);
    // Scroll down to tension recorder
    autoScroll(event, 2000);
  }
}

// Update displayed creel row element to match currently selected TARGET creel row
function updateCreelRowInput() {
  const currentCreelRowInputElement = document.getElementById("row-side-input");
  currentCreelRowInputElement.textContent = currentCreelRowInput;
}

// Update displayed creel side element to match currently selected TARGET creel side
function updateCreelSideInputDisplay() {
  const currentCreelSideInputElement =
    document.getElementById("creel-side-input");
  currentCreelSideInputElement.textContent = currentCreelSideInput;
}

// Erase stored data in local browser storage
function resetStorage() {
  const confirmation = confirm(
    "Are you sure you want to clear all stored data within this browser?"
  );
  if (confirmation === !null) {
    localStorage.removeItem("savedData");
  }
}

// Automatically scroll to specific point
function autoScroll(event, where) {
  event.preventDefault(); // Prevent the default form submission
  localStorage.setItem("scrollPosition", window.scrollY);
  window.scrollTo(0, where); // Scroll to the specified position
}

// Fill the specification with stored data
function updateSpecForm() {
  document.getElementById("machine-number").value = data["machineNumber"];
  document.getElementById("operator").value = data["operator"];
  document.getElementById("production-order").value = data["productionOrder"];
  document.getElementById("bale-no").value = data["baleNo"];
  document.getElementById("color-code").value = data["colorCode"];
  document.getElementById("style-spec").value = data["style"];
  document.getElementById("counter-number").value = data["counterNo"];
}

function changeCreelRow(direction) {
  columns = ["A", "B", "C", "D", "E"];
  if (direction === "next") {
    currentCreelRow =
      columns.indexOf(currentCreelRow) + 1 > columns.length - 1
        ? columns[0]
        : columns[columns.indexOf(currentCreelRow) + 1];
  }
  if (direction === "prev") {
    currentCreelRow =
      columns.indexOf(currentCreelRow) - 1 < 0
        ? columns[columns.length - 1]
        : columns[columns.indexOf(currentCreelRow) - 1];
  }
  currentColumn = colIDs[currentCreelSide][currentCreelRow][0];
  updateIDDisplay();
  updateColumnDisplay();
}

function changeCreelSide(direction) {
  sides = ["Ai", "Ao", "Bi", "Bo"];
  if (direction === "next") {
    currentCreelSide =
      sides.indexOf(currentCreelSide) + 1 > sides.length - 1
        ? sides[0]
        : sides[sides.indexOf(currentCreelSide) + 1];
  }
  if (direction === "prev") {
    currentCreelSide =
      sides.indexOf(currentCreelSide) - 1 < 0
        ? sides[sides.length - 1]
        : sides[sides.indexOf(currentCreelSide) - 1];
  }
  currentCreelRow = "A";
  updateColumnDisplay();
  currentColumn = colIDs[currentCreelSide][currentCreelRow][0];
  updateIDDisplay();
  updateColumnSideDisplay();
}

function changeValueType() {
  currentValueType = currentValueType === "MIN" ? "MAX" : "MIN";
  updateValueTypeDisplay();
  displayRecordedNumbers();
}

function updateColumnDisplay() {
  const columnDisplay = document.getElementById("column");
  columnDisplay.textContent = currentCreelRow;
}

function updateColumnSideDisplay() {
  const columnSideDisplay = document.getElementById("column-side");
  columnSideDisplay.textContent = currentCreelSide;
}

function updateValueTypeDisplay() {
  const valueTypeElement = document.getElementById("value-type");
  valueTypeElement.textContent = currentValueType;
}

function updateIDDisplay() {
  const currentColumnElement = document.getElementById("current-id");
  currentColumnElement.textContent = currentColumn;
  document.getElementById("displayed-id").textContent = currentColumn;
  document.getElementById("displayed-id-prob").textContent = currentColumn;
  displayRecordedNumbers();
  displayRecordedProbs();
}

function changeColumnNumber(direction) {
  const currentSideColumns = colIDs[currentCreelSide][currentCreelRow];
  if (
    currentSideColumns.indexOf(currentColumn) + 1 <=
      currentSideColumns.length - 1 &&
    direction === "next"
  ) {
    currentColumn =
      currentSideColumns[currentSideColumns.indexOf(currentColumn) + 1];
  }
  if (
    currentSideColumns.indexOf(currentColumn) - 1 >= 0 &&
    direction === "prev"
  ) {
    currentColumn =
      currentSideColumns[currentSideColumns.indexOf(currentColumn) - 1];
  }
  updateIDDisplay();
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

function recordTensionData(directive) {
  const numberInput = document.getElementById("number");
  const number = numberInput.value;
  const probInput = document.getElementById("problem");
  const problems = probInput.value;

  if (!data["tensionData"]) {
    data["tensionData"] = {};
  }

  if (!data["tensionData"][currentCreelSide]) {
    data["tensionData"][currentCreelSide] = {};
  }

  if (!data["tensionData"][currentCreelSide][currentCreelRow]) {
    data["tensionData"][currentCreelSide][currentCreelRow] = {};
  }

  if (!data["tensionData"][currentCreelSide][currentCreelRow][currentColumn]) {
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn] = {};
  }

  if (
    !data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      currentValueType
    ]
  ) {
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      currentValueType
    ] = [];
  }

  if (
    !data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      "Problems"
    ]
  ) {
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      "Problems"
    ] = [];
  }

  // Check if tensions are abnormal
  normalTens = true;
  // if (checkAbnormalTens(number, currentValueType) === false) {
  //   normalTens = false;
  //   console.log(normalTens);
  // }

  if (directive === "tens") {
    // Add the number to the array
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      currentValueType
    ].push(number);
    numberInput.value = "";
  }

  if (directive === "prob") {
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
      "Problems"
    ].push(problems);
  }

  console.log(data);
  minValExist = false;
  maxValExist = false;

  for (let val in data["tensionData"][currentCreelSide][currentCreelRow][
    currentColumn
  ]) {
    if (
      data["tensionData"][currentCreelSide] &&
      data["tensionData"][currentCreelSide][currentCreelRow] &&
      data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][val]
    ) {
      if (
        val === "MAX" &&
        data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
          val
        ].length > 0
      ) {
        maxValExist = true;
      }
      if (
        val === "MIN" &&
        data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
          val
        ].length > 0
      ) {
        minValExist = true;
      }
    }
  }

  console.log(data);
  if (minValExist && maxValExist && normalTens) {
    changeColumnNumber("next");
    changeValueType();
  } else {
    changeValueType();
  }
  saveDataToLocalStorage();
  displayRecordedNumbers();
  displayRecordedProbs();
}

function displayRecordedNumbers() {
  const minNumbersList = document.getElementById("min-numbers-list");
  const maxNumbersList = document.getElementById("max-numbers-list");

  minNumbersList.innerHTML = "";
  maxNumbersList.innerHTML = "";

  const currentSideData = data["tensionData"][currentCreelSide];
  if (currentSideData) {
    const currentRowData = currentSideData[currentCreelRow];
    if (currentRowData) {
      const currentColumnData = currentRowData[currentColumn];
      if (currentColumnData) {
        const currentTenValueType = currentColumnData[currentValueType];
        if (currentTenValueType) {
          const currentMaxValues =
            currentColumnData && currentColumnData["MAX"]
              ? currentColumnData["MAX"]
              : [];
          const currentMinValues =
            currentColumnData && currentColumnData["MIN"]
              ? currentColumnData["MIN"]
              : [];

          console.log(currentTenValueType);
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
    }
  }
}

function displayRecordedProbs() {
  const problemList = document.getElementById("prob-list");
  problemList.innerHTML = "";

  if (data["tensionData"][currentCreelSide][currentCreelRow][currentColumn]) {
    const currentColumnProbs =
      data["tensionData"][currentCreelSide][currentCreelRow][currentColumn] &&
      data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
        "Problems"
      ]
        ? data["tensionData"][currentCreelSide][currentCreelRow][currentColumn][
            "Problems"
          ]
        : [];

    if (currentColumnProbs) {
      currentColumnProbs.forEach((problem) => {
        const listItem = document.createElement("li");
        listItem.textContent = problem;
        problemList.appendChild(listItem);
      });
    }
  }
}

// function checkAbnormalTens(tensNum, valueType) {
//   const cntNoens = document.getElementById("spec-tens").value;
//   const colCodeens = document.getElementById("tens-dev").value;
//   const upperLimit = cntNoens + colCodeens;
//   const lowerLimit = cntNoens - colCodeens;

//   if (valueType === "MIN" && tensNum < lowerLimit) {
//     data[currentColumn][currentTensionType]["minTensNormal"] = false;
//     return false;
//   } else {
//     data[currentColumn][currentTensionType]["minTensNormal"] = true;
//   }

//   if (valueType === "MAX" && tensNum > upperLimit) {
//     data[currentColumn][currentTensionType]["maxTensNormal"] = false;
//     return false;
//   } else {
//     data[currentColumn][currentTensionType]["maxTensNormal"] = true;
//   }
// }

function finishRecording() {
  const confirmation = confirm("Are you sure you want to finish?");

  if (confirmation === !null) {
    writeCSV(
      data["machineNumber"],
      data["operator"],
      data["productionOrder"],
      data["baleNo"],
      data["style"],
      data["counterNo"],
      data["colorCode"]
    );
  }
}

function writeCSV(machineNumber, operator, po, bale, stl, cntNo, colCode) {
  let csvContent = "";
  const currentDateTime = new Date().toLocaleString(); // Get current date and time in a localized format
  csvContent += `Tanggal,${currentDateTime}\n`;
  csvContent += `Style,${stl}\n`;
  csvContent += `PO,${po}\n`;
  csvContent += `\n`;
  csvContent += `Color,${colCode}\n`;
  csvContent += `Bale Ke,${bale}\n`;
  csvContent += `Loom,${machineNumber}\n`;
  csvContent += `Meter,${cntNo}\n`;
  csvContent += `Date,${currentDateTime}\n`;
  csvContent += `Operator,${operator}\n`;
  console.log(data);

  // Loop through all IDs except the last few and append to csvContent
  for (let sd in data["tensionData"]) {
    console.log(sd);
    csvContent += `${sd}\n`;
    for (let rw in data["tensionData"][sd]) {
      console.log(rw);
      for (let col in data["tensionData"][sd][rw]) {
        const minTensionVal =
          data["tensionData"]?.[sd]?.[rw]?.[col]?.["MIN"] || "";
        const maxTensionVal =
          data["tensionData"]?.[sd]?.[rw]?.[col]?.["MAX"] || "";
        csvContent += `${rw},${col},${maxTensionVal},${minTensionVal}\n`;
      }
    }
  }

  const filename = `[${machineNumber}] - [${po}] - [${operator}] - [${currentDateTime}]`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
}

function deleteData(dataType) {
  const currentColumnData =
    data["tensionData"][currentCreelSide][currentCreelRow][currentColumn];
  if (dataType === "tension") {
    const recordedValue = currentColumnData[currentValueType];
    delete recordedValue.pop();
  } else {
    if (currentColumnData["Problems"]) {
      const problems = currentColumnData["Problems"];
      delete problems.pop();
      console.log(currentColumnData["Problems"]);
    } else {
      currentColumnData["Problems"] = [];
    }
  }
  saveDataToLocalStorage();
  displayRecordedNumbers();
  displayRecordedProbs();
}
