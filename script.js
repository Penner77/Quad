// --- Wheel Data ---
// This array represents your WheelData!F2:F39 range in wheel order
// IMPORTANT: Make sure this exactly matches the order on your physical wheel (0, 00, 1-36)
// Use numbers for 1-36 and 0. Use string "00" if that's how you enter it.
const wheelData = [
    // !!! REPLACE THIS ARRAY WITH YOUR ACTUAL WHEEL ORDER !!!
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
    "00", // Example: Representing Double Zero as a string
    27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
    // !!! END OF ARRAY TO REPLACE !!!
];

const wheelSize = wheelData.length; // Should be 38 for double zero

// --- History Storage ---
let spinHistory = []; // This array will store all entered spin results

// --- Get HTML Elements ---
const spinInput = document.getElementById('spinInput');
const addSpinButton = document.getElementById('addSpinButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const validationFeedback = document.getElementById('validationFeedback');

const lastSpinQuadrantOutput = document.getElementById('lastSpinQuadrantOutput');
const lastSpinHalfOutput = document.getElementById('lastSpinHalfOutput');
const sum4Output = document.getElementById('sum4Output');
const avg10Output = document.getElementById('avg10Output');
const suggestionOutput = document.getElementById('suggestionOutput');
const surroundingNumbersOutput = document.getElementById('surroundingNumbersOutput');
const last10SpinsList = document.getElementById('last10SpinsList');
const last10QuadrantsList = document.getElementById('last10QuadrantsList'); // **NEW Reference**
const last10HalvesList = document.getElementById('last10HalvesList'); // **NEW Reference**


// --- Helper Function: Get Quadrant (Equivalent to Column B logic) ---
function getQuadrant(number) {
    // Ensure input is a number for comparison, handle "00" and 0 appropriately
    if (number === "00") return "00"; // Return "00" specifically
    if (number === 0) return 0; // Return 0 specifically

    const num = parseFloat(number); // Try converting
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
    }

    if (num >= 1 && num <= 9) return 1;
    if (num >= 10 && num <= 18) return 2;
    if (num >= 19 && num <= 27) return 3;
    if (num >= 28 && num <= 36) return 4;

    return null; // Should not happen for 1-36, but as a fallback
}

// --- Helper Function: Get Half (Equivalent to Column C logic) ---
function getHalf(number) {
    // Handle "00" and 0 appropriately
     if (number === "00") return "00";
     if (number === 0) return 0;

    const num = parseFloat(number); // Try converting
     if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
     }

    if (num >= 1 && num <= 18) return "1-18";
    if (num >= 19 && num <= 36) return "19-36";

    return null; // Should not happen
}


// --- Helper Function: Calculate Sum of Last 4 Quadrants (Equivalent to E3 logic) ---
function calculateSumLast4Quads(historyArray) {
    const last4Spins = historyArray.slice(-4); // Get the last up to 4 entries
    if (last4Spins.length < 4) return null; // Only calculate if there are at least 4 spins

    let sum = 0;
    let count = 0; // Count how many had a valid quadrant (1-4)

    for (const spin of last4Spins) {
        const quad = getQuadrant(spin);
        // Only sum quadrants 1-4, ignore 0, 00, or null
        if (typeof quad === 'number' && quad >= 1 && quad <= 4) {
            sum += quad;
            count++;
        } else {
            // If any of the last 4 do not have a valid quadrant (1-4), we cannot form a sum of 4 quads
            return null; // Cannot calculate sum of 4 quads
        }
    }
     // We should only get here if all 4 spins had valid quads (1-4)
    return sum;
}

// --- Helper Function: Calculate Avg of Last 10 Raw (Equivalent to E4 logic) ---
function calculateAvgLast10Raw(historyArray) {
    const last10Spins = historyArray.slice(-10); // Get the last up to 10 entries
     if (last10Spins.length < 10) return null; // Only calculate if there are at least 10 spins

    let sum = 0;
    let count = 0;

    for (const spin of last10Spins) {
         // Only include numbers 1-36 in the raw average
        const numberValue = parseFloat(spin); // Try converting

        if (!isNaN(numberValue) && typeof spin !== 'string' && spin >= 1 && spin <= 36) { // Check if it's a valid number 1-36
             sum += numberValue;
            count++;
        } else {
             // If any of the last 10 are not valid numbers (1-36), we cannot form an avg of 10 raw numbers
             return null; // Cannot calculate avg of 10 raw
        }
    }

     // We should only get here if all 10 spins had valid numbers (1-36)
    return count === 10 ? sum / count : null; // Ensure exactly 10 valid numbers were summed
}


// --- Helper Function: Classify Sum of 4 (Equivalent to F1 logic) ---
function classifyE3(sum4) {
    if (sum4 === null) return ""; // No sum data from 4 quads

    // Use ranges defined previously (Sum ranges from 4 to 16 for 4 quads)
    if (sum4 <= 4) return "E3_ExtremeLow"; // Only 4
    if (sum4 >= 16) return "E3_ExtremeHigh"; // Only 16
    if (sum4 >= 5 && sum4 <= 6) return "E3_Low";
    if (sum4 >= 14 && sum4 <= 15) return "E3_High";
    if (sum4 >= 7 && sum4 <= 8) return "E3_MidLow";
    if (sum4 >= 12 && sum4 <= 13) return "E3_MidHigh";
    if (sum4 >= 9 && sum4 <= 11) return "E3_Medium"; // Covers 9, 10, 11

     return ""; // Fallback - should cover 4-16
}

// --- Helper Function: Classify Avg of 10 (Equivalent to G1 logic) ---
function classifyE4(avg10) {
     if (avg10 === null) return ""; // No avg data from 10 numbers

    // Use ranges defined previously (Avg ranges roughly 1-36)
    // Make sure these match the H1 conditions exactly
    if (avg10 < 14) return "E4_ExtremeLow";
    if (avg10 > 23) return "E4_ExtremeHigh";
    if (avg10 >= 14 && avg10 < 16) return "E4_Low";
    if (avg10 > 21 && avg10 <= 23) return "E4_High";
    if (avg10 >= 17 && avg10 <= 20) return "E4_Medium"; // Covers 17-20 (near 18.5)
    if (avg10 >= 16 && avg10 < 17) return "E4_MidLow";
    if (avg10 > 20 && avg10 <= 21) return "E4_MidHigh";

     return ""; // Fallback
}


// --- Helper Function: Get Suggestion (Equivalent to H1 logic) ---
function getSuggestion(e3Class, e4Class) {
    // Need classifications from both E3 (sum of 4) and E4 (avg of 10) for a suggestion
     // **REMOVED specific "Needs data" message**
     if (e3Class === "" || e4Class === "") {
         return ""; // Return blank if not enough data for classification
     }


    // Use the H1 IFS logic based on classification strings
    if (e3Class === "E3_ExtremeLow" && e4Class === "E4_ExtremeLow") return "VERY Strong Suggest: Bet Dozen 3 (Extreme Low Indicators)";
    if (e3Class === "E3_ExtremeHigh" && e4Class === "E4_ExtremeHigh") return "VERY Strong Suggest: Bet Dozen 1 (Extreme High Indicators)";

    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) return "Strong Suggest: Bet Dozen 3 or 2 (Far Below Balance)";
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_MidHigh")) return "Strong Suggest: Bet Dozen 1 or 2 (Far Above Balance)";

    if (e3Class === "E3_Medium" && e4Class === "E4_Medium") return "Suggest: Bet Dozen 2 (Very Near Balance)";

    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) return "Leaning Suggest: Bet Dozen 2 or 1 (E1 High/Avg, E2 Near Avg)";
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) return "Leaning Suggest: Bet Dozen 2 or 3 (E1 Near/High, E2 High/Avg)"; // G1 High check
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) return "Leaning Suggest: Bet Dozen 2 or 3 (E1 Near/High, E2 High/Avg)"; // Added MidHigh check

    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) return "Leaning Suggest: Bet Dozen 2 or 3 (E1 Low/Avg, E2 Near Avg)";
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) return "Leaning Suggest: Bet Dozen 2 or 1 (E1 Near/High, E2 Low/Avg)";

    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) return "Conflicting High E / Low E - Unclear";
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_High" || e4Class === "E4_High")) return "Conflicting Low E / High E - Unclear"; // G1 High check
     if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidHigh")) return "Conflicting Low E / High E - Unclear"; // Added MidHigh check


    // This is the default "Signal Unclear / Other Combination" case if none of the above match
    // Let's use the revised text reflecting pattern breakdown
    return "Pattern Breakdown: Indicators Muddled - Opposition Possible";

    // Optional: Add the Zero Edge Signal Trigger - This logic needs to go *before* returning the default suggestion
    /*
    if (
        e3Class === "E3_ExtremeLow" ||
        e3Class === "E3_ExtremeHigh" ||
        e3Class.includes("Conflicting") // Check if the output string contains "Conflicting"
       ) {
           // You might want a separate output area for the Zero signal,
           // or combine the messages, or have a dedicated "Zero Signal Active" message in H1
           // For now, the default case covers the muddled state.
           // E.g., Add a line like: suggestionOutput.style.color = 'green'; // Change color for zero signal states
           // return "ZERO EDGE SIGNAL Active!"; // Or just return a specific zero message
       }
     */
}


// --- Helper Function: Get Surrounding Numbers String (Equivalent to E5 logic) ---
function getSurroundingNumbersString(spinResult) {
    // Handle blank or invalid input early
     if (spinResult === "" || spinResult === null || typeof spinResult === 'undefined') {
        return ""; // Return blank string
    }

    // Try to parse the input number, but keep "00" as string if needed
    let numberToMatch = (spinResult === "00") ? "00" : parseFloat(spinResult);
    if (spinResult === 0) numberToMatch = 0; // Ensure 0 is treated as number 0


    // Check if input is valid (a number or "00")
     if (isNaN(numberToMatch) && numberToMatch !== "00" && numberToMatch !== 0) {
         return "Error: Invalid input type"; // Or handle this error elsewhere
     }

    try {
        // Find the position of the spin result in the wheel data (using 0-based index for JS arrays)
        // Use a loop for matching to handle strict type matching (number 0 vs string "00")
        let spinMatchIndex = -1;
        for(let i = 0; i < wheelData.length; i++) {
            if (wheelData[i] === numberToMatch) {
                spinMatchIndex = i;
                break;
            }
        }


        if (spinMatchIndex === -1) {
            // Number not found in WheelData
            return "Error: Spin not found in WheelData";
        }

        // Calculate the position of the polar opposite (0-based index)
        const oppositeMatchIndex = (spinMatchIndex + 19) % wheelSize;

        let surroundingNumbers = [];

        // Around Self (5 before, self, 5 after)
        for (let i = -5; i <= 5; i++) {
            const position = (spinMatchIndex + i + wheelSize) % wheelSize; // Handles wrapping
            surroundingNumbers.push(wheelData[position]);
        }

        let oppositeNumbers = [];
         // Around Opposite (5 before, opposite, 5 after)
         for (let i = -5; i <= 5; i++) {
            const position = (oppositeMatchIndex + i + wheelSize) % wheelSize; // Handles wrapping
            oppositeNumbers.push(wheelData[position]);
        }

        // Build the final output string
        let outputString = "| " + surroundingNumbers.join(" | ") + " | ";
        outputString += " --- | "; // The separator you found
        outputString += oppositeNumbers.join(" | ") + " |";

        return outputString;


    } catch (error) {
        // Catch any errors during calculation
        return "Calculation Error: " + error.message;
    }
}


// --- Main Update Function ---
// This function is called when the Add Spin button is clicked
function updateAnalysisDisplay() {
    // 1. Get the current value from the input box
    const currentInputValue = spinInput.value.trim(); // Use trim to remove leading/trailing spaces

    // Clear previous outputs if the input is blank - Should not happen with button, but good practice
    if (currentInputValue === "") {
        // Clear display elements
        sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = ""; // Clear history display
        last10QuadrantsList.textContent = ""; // Clear Q history display
        last10HalvesList.textContent = ""; // Clear H history display
        validationFeedback.textContent = ""; // Clear validation message
        return; // Stop processing
    }

     // 2. Validate and parse the input (handle "0", "00", and numbers)
    let parsedSpin;
    if (currentInputValue === "00") {
        parsedSpin = "00"; // Keep "00" as string
    } else {
       const num = parseFloat(currentInputValue);
       if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 36) { // Includes 0 in valid numbers
           // Input is not a valid number 0-36 or "00"
            validationFeedback.textContent = "Invalid input. Enter 0-36 or 00."; // Show validation error
             // Clear display elements
             sum4Output.textContent = "";
             avg10Output.textContent = "";
             suggestionOutput.textContent = "";
             surroundingNumbersOutput.textContent = "";
             lastSpinQuadrantOutput.textContent = "";
             lastSpinHalfOutput.textContent = "";
             last10SpinsList.textContent = ""; // Clear history display
             last10QuadrantsList.textContent = ""; // Clear Q history display
             last10HalvesList.textContent = ""; // Clear H history display
            return; // Stop processing
       }
       parsedSpin = num; // Valid number (0-36)
    }

    // Input is valid - clear validation feedback
    validationFeedback.textContent = "";

    // 3. Add the validated input to the history array
    // Only add if it's different from the last entry to avoid duplicates on rapid clicks
     const lastHistoryEntry = spinHistory.length > 0 ? spinHistory[spinHistory.length - 1] : null;
     const isInputSameAsLastValid = lastHistoryEntry !== null && parsedSpin === lastHistoryEntry;

     // Add to history if it's the first entry OR different from the last entry
     if (spinHistory.length === 0 || !isInputSameAsLastValid) {
          spinHistory.push(parsedSpin);
          // Optional: Limit history size? spinHistory = spinHistory.slice(-100); // Keep last 100
     } else {
         // Optional: Message if input is same as last
         // validationFeedback.textContent = "Same as last spin, not added.";
     }


    // --- Perform Calculations based on History ---
    // Get the most recent spin from history
    const lastSpinFromHistory = spinHistory.length > 0 ? spinHistory[spinHistory.length - 1] : null;

    // Only proceed if history is not empty (redundant check with above logic, but safe)
    if (lastSpinFromHistory === null) {
         // Clear display elements
         sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = "";
        last10QuadrantsList.textContent = "";
        last10HalvesList.textContent = "";
        return;
    }


    // Display Last Spin Quadrant and Half for the LAST spin added
     const lastSpinQuad = getQuadrant(lastSpinFromHistory);
     lastSpinQuadrantOutput.textContent = lastSpinQuad !== null ? lastSpinQuad : "N/A";

     const lastSpinHalf = getHalf(lastSpinFromHistory);
     lastSpinHalfOutput.textContent = lastSpinHalf !== null ? lastSpinHalf : "N/A";


    // Calculate Sum of Last 4 Quadrants
    const sum4 = calculateSumLast4Quads(spinHistory);
    sum4Output.textContent = sum4 !== null ? sum4 : "N/A (<4 quads)"; // Display Sum of 4

    // Calculate Avg of Last 10 Raw Results
    const avg10 = calculateAvgLast10Raw(spinHistory);
    avg10Output.textContent = avg10 !== null ? avg10.toFixed(2) : "N/A (<10 numbers)"; // Display Avg of 10 (formatted)

    // Classify indicators
    const e3Class = classifyE3(sum4);
    const e4Class = classifyE4(avg10);

    // Get Suggestion (H1)
    const suggestion = getSuggestion(e3Class, e4Class);
    suggestionOutput.textContent = suggestion;


    // --- Get & Display Surrounding Numbers for the LAST spin ---
     const surroundingString = getSurroundingNumbersString(lastSpinFromHistory);
     surroundingNumbersOutput.textContent = surroundingString;

     // --- Display History Lists ---
     // Get the last 10 spins (or fewer)
     const last10Spins = spinHistory.slice(-10);

     // Calculate Quadrants and Halves for the last 10 spins
     const last10Quads = last10Spins.map(spin => {
         const quad = getQuadrant(spin);
         // Display 0, 00, or N/A if not a 1-4 quadrant
         if (quad === 0) return 0;
         if (quad === "00") return "00";
         if (quad === null) return "N/A";
         return quad; // Return 1, 2, 3, or 4
     });

     const last10Halves = last10Spins.map(spin => {
         const half = getHalf(spin);
          // Display 0, 00, or N/A if not a 1-18/19-36 half
         if (half === 0) return 0;
         if (half === "00") return "00";
         if (half === null) return "N/A";
         return half; // Return "1-18" or "19-36"
     });


     // **Display the History Lists (Most recent FIRST)**
     // Need to reverse the slices *before* joining them for display
     const displayedSpins = last10Spins.slice().reverse(); // Create copy before reversing
     const displayedQuads = last10Quads.slice().reverse(); // Create copy before reversing
     const displayedHalves = last10Halves.slice().reverse(); // Create copy before reversing


     last10SpinsList.textContent = displayedSpins.join(", ");
     last10QuadrantsList.textContent = displayedQuads.join(", ");
     last10HalvesList.textContent = displayedHalves.join(", ");


     // Clear input field after adding to history
     spinInput.value = ""; // Clear input for next entry
     // Keep focus on input for rapid entry
     spinInput.focus();
}


// --- Event Listener ---
// **Trigger updateAnalysisDisplay when the Add Spin button is clicked**
addSpinButton.addEventListener('click', updateAnalysisDisplay);

// Optional: Also trigger on Enter key press in the input field
spinInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if any
        updateAnalysisDisplay(); // Trigger update
    }
});


// --- Initial Call ---
// No initial call needed as user will press button
// updateAnalysisDisplay();

/*
// Optional: Add a button to clear history
// Add button in HTML: <button id="clearHistoryButton">Clear History</button>
// **This code IS now active in the main script block provided above**
*/

// Clear History Button Listener (Active in the main script block)
clearHistoryButton.addEventListener('click', () => {
    spinHistory = [];
    spinInput.value = ""; // Clear input too
    // Clear all display elements
    sum4Output.textContent = "";
    avg10Output.textContent = "";
    suggestionOutput.textContent = "";
    surroundingNumbersOutput.textContent = "";
    lastSpinQuadrantOutput.textContent = "";
    lastSpinHalfOutput.textContent = "";
    last10SpinsList.textContent = "";
    last10QuadrantsList.textContent = "";
    last10HalvesList.textContent = "";
    validationFeedback.textContent = "";
     spinInput.focus(); // Return focus
});


/*
// Optional: Function to save/load history to browser's local storage (more advanced)
// This allows history to persist if you close and reopen the browser page
*/