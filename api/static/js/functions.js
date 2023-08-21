let currentID = 1;
      let currentTensionType = "CT"; // Default tension type abbreviation
      let currentValueType = "MAX"; // Default value type abbreviation
      let abnormalColor = "";
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
        const savedData = localStorage.getItem("savedData");
        if (savedData) {
          data = JSON.parse(savedData);
          // Update any necessary UI elements based on the loaded data
          updateIDDisplay();
          updateSpecForm();
          // ... (other updates)
        }
      });

      // Save data to localStorage whenever it's modified
      function saveDataToLocalStorage() {
        localStorage.setItem("savedData", JSON.stringify(data));
      }

      function resetStorage() {
        const confirmation = confirm(
          "Are you sure you want to clear all stored data within this browser?"
        );
        if (confirmation === !null) {
          localStorage.removeItem("savedData");
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

      function changeTensionType() {
        event.preventDefault();
        currentTensionType = currentTensionType === "CT" ? "WT" : "CT";
        updateTensionTypeDisplay();
        displayRecordedNumbers();
      }

      function changeValueType() {
        currentValueType = currentValueType === "MIN" ? "MAX" : "MIN";
        updateValueTypeDisplay();
        displayRecordedNumbers();
      }

      function updateTensionTypeDisplay() {
        const tensionTypeElement = document.getElementById("tension-type");
        tensionTypeElement.textContent = currentTensionType;
        const displayedTensionType = document.getElementById(
          "displayed-tension-type"
        );
        displayedTensionType.textContent =
          currentTensionType === "CT" ? "CT" : "WT";
      }

      function updateValueTypeDisplay() {
        const valueTypeElement = document.getElementById("value-type");
        valueTypeElement.textContent = currentValueType;
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
        if (!data[currentID][currentTensionType]) {
          data[currentID][currentTensionType] = {};
        }
        if (!data[currentID][currentTensionType][currentValueType]) {
          data[currentID][currentTensionType][currentValueType] = [];
        }

        // Check if tensions are abnormal
        normalTens = true;
        // if (checkAbnormalTens(number, currentValueType) === false) {
        //   normalTens = false;
        //   console.log(normalTens);
        // }

        // Add the number to the array
        data[currentID][currentTensionType][currentValueType].push(number);
        saveDataToLocalStorage();
        numberInput.value = "";

        minValExist = false;
        maxValExist = false;

        for (let val in data[currentID][currentTensionType]) {
          if (
            data[currentID] &&
            data[currentID][currentTensionType] &&
            data[currentID][currentTensionType][val]
          ) {
            if (
              val === "MIN" &&
              data[currentID][currentTensionType][val].length > 0
            ) {
              minValExist = true;
            }
            if (
              val === "MAX" &&
              data[currentID][currentTensionType][val].length > 0
            ) {
              maxValExist = true;
            }
          }
        }

        console.log(data);
        if (minValExist && maxValExist && normalTens) {
          nextID();
          displayRecordedNumbers();
          console.log("All normal");
        } else {
          changeValueType();
          displayRecordedNumbers();
          console.log("Something's not right");
        }
      }

      function checkAbnormalTens(tensNum, valueType) {
        const stdTens = document.getElementById("spec-tens").value;
        const devTens = document.getElementById("tens-dev").value;
        const upperLimit = stdTens + devTens;
        const lowerLimit = stdTens - devTens;

        if (valueType === "MIN" && tensNum < lowerLimit) {
          data[currentID][currentTensionType]["minTensNormal"] = false;
          return false;
        } else {
          data[currentID][currentTensionType]["minTensNormal"] = true;
        }

        if (valueType === "MAX" && tensNum > upperLimit) {
          data[currentID][currentTensionType]["maxTensNormal"] = false;
          return false;
        } else {
          data[currentID][currentTensionType]["maxTensNormal"] = true;
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

      function writeCSV(
        machineNumber,
        operator,
        dtx,
        twm,
        rpm,
        stdT,
        devT,
        itemN
      ) {
        let csvContent = "";
        csvContent += `Machine No.,${machineNumber},Item Number,${itemN}\n`;
        csvContent += `RPM, ${rpm},D-tex,${dtx},Operator Name,${operator}\n`;
        csvContent += `TPM,${twm}\n`;
        csvContent += `Spec STD,${stdT}\n`;
        csvContent += `±,${devT}\n`;
        csvContent += `Spindle Number,${currentTensionType} - MIN,${currentTensionType} - MAX, Stated Problem(s)\n`;

        const ids = Object.keys(data); // Get an array of data IDs
        const numIdsToDelete = 8; // Number of IDs to delete from the end
        console.log(data);

        // Loop through all IDs except the last few and append to csvContent
        for (let i = 0; i < ids.length - numIdsToDelete; i++) {
          const id = ids[i];
          const minTensionVal = data[id]?.[currentTensionType]?.["MIN"] || "";
          const maxTensionVal = data[id]?.[currentTensionType]?.["MAX"] || "";
          const spindleProb = data[id]?.["Problems"] || "";
          csvContent += `${id}.,${minTensionVal}.,${maxTensionVal}., ${spindleProb}.\n`;
        }
        const currentDateTime = new Date().toLocaleString(); // Get current date and time in a localized format
        const filename = `[${machineNumber}] - [${itemN}] - [${operator}] - [${currentDateTime}]`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      }

      function deleteData(dataType) {
        if (dataType === "tension") {
          const recordedValue =
            data[currentID][currentTensionType][currentValueType];
          if (currentValueType === "MIN") {
            data[currentID][currentTensionType]["minTensNormal"] = "";
          } else {
            tensionChk = data[currentID][currentTensionType]["maxTensNormal"] =
              "";
          }
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
          const currentTensionTypeData = currentIDData[currentTensionType];
          if (currentTensionTypeData) {
            const currentMinValues =
              currentTensionTypeData && currentTensionTypeData["MIN"]
                ? currentTensionTypeData["MIN"]
                : [];
            const currentMaxValues =
              currentTensionTypeData && currentTensionTypeData["MAX"]
                ? currentTensionTypeData["MAX"]
                : [];

            if (currentMinValues) {
              currentMinValues.forEach((number) => {
                const listItem = document.createElement("li");
                listItem.textContent = number;
                minNumbersList.appendChild(listItem);
              });
              if (currentTensionTypeData["minTensNormal"] === false) {
                minNumbersList.style.backgroundColor = "yellow";
              } else {
                minNumbersList.style.backgroundColor = "transparent";
              }
            }

            if (currentMaxValues) {
              currentMaxValues.forEach((number) => {
                const listItem = document.createElement("li");
                listItem.textContent = number;
                maxNumbersList.appendChild(listItem);
              });
              if (currentTensionTypeData["maxTensNormal"] === false) {
                maxNumbersList.style.backgroundColor = "red";
              } else {
                maxNumbersList.style.backgroundColor = "transparent";
              }
            }
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