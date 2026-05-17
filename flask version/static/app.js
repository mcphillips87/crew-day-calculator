function timeToMinutes(value) {
  value = value.toString().padStart(4, "0");

  const hours = parseInt(value.substring(0, 2));
  const minutes = parseInt(value.substring(2, 4));

  return (hours * 60) + minutes;
}

function minutesToHHMM(totalMinutes) {
  totalMinutes = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function updateSunLabel() {
  const scenario = document.getElementById("scenario").value;
  const sunLabel = document.getElementById("sunLabel");
  const sunInput = document.getElementById("sunset");

  if (scenario === "day_to_night") {
    sunLabel.innerText = "Sunset (HHMM)";
    sunInput.placeholder = "1800";
  }

  if (scenario === "night_to_day") {
    sunLabel.innerText = "Sunrise (HHMM)";
    sunInput.placeholder = "0600";
  }
}

function dayIntoNightDiff(sunset, mes) {
  return sunset - mes;
}

function nightIntoDayDiff(sunrise, mes) {
  if (mes > sunrise) {
    mes -= 1440;
  }

  return sunrise - mes;
}

// Day into Night - Low Seas, 0.5 to 3.0 ft
function calculateDayToNightLow(sunset, mes) {
  const diff = dayIntoNightDiff(sunset, mes);

  if (diff >= 12 * 60) {
    return mes + (12 * 60);
  }

  const scaled = (diff / (12 * 60)) * (8 * 60);
  const remaining = (8 * 60) - scaled;

  return sunset + remaining;
}

// Day into Night - High Seas, 3.5 to 5.0 ft
function calculateDayToNightHigh(sunset, mes) {
  const diff = dayIntoNightDiff(sunset, mes);

  if (diff >= 8 * 60) {
    return mes + (8 * 60);
  }

  const scaled = (diff / (8 * 60)) * (6 * 60);
  const remaining = (6 * 60) - scaled;

  return sunset + remaining;
}

// Night into Day - Low Seas, 0.5 to 3.0 ft
function calculateNightToDayLow(sunrise, mes) {
  const diff = nightIntoDayDiff(sunrise, mes);

  if (diff >= 8 * 60) {
    return mes + (8 * 60);
  }

  const scaled = (diff / (8 * 60)) * (12 * 60);
  const remaining = (12 * 60) - scaled;

  return sunrise + remaining;
}

// Night into Day - High Seas, 3.5 to 5.0 ft
function calculateNightToDayHigh(sunrise, mes) {
  const diff = nightIntoDayDiff(sunrise, mes);

  if (diff >= 6 * 60) {
    return mes + (6 * 60);
  }

  const scaled = (diff / (6 * 60)) * (8 * 60);
  const remaining = (8 * 60) - scaled;

  return sunrise + remaining;
}

function calculateCrewDay() {
  const scenario = document.getElementById("scenario").value;
  const sunTimeInput = document.getElementById("sunset").value;
  const mesInput = document.getElementById("mes").value;

  if (!sunTimeInput || !mesInput) {
    document.getElementById("result").innerText = "Enter both times.";
    document.getElementById("details").innerText = "";
    return;
  }

  const sunTime = timeToMinutes(sunTimeInput);
  const mes = timeToMinutes(mesInput);

  let lowResult;
  let highResult;
  let label;

  if (scenario === "day_to_night") {
    lowResult = calculateDayToNightLow(sunTime, mes);
    highResult = calculateDayToNightHigh(sunTime, mes);
    label = "Day into Night";
  }

  if (scenario === "night_to_day") {
    lowResult = calculateNightToDayLow(sunTime, mes);
    highResult = calculateNightToDayHigh(sunTime, mes);
    label = "Night into Day";
  }

  document.getElementById("result").innerHTML = `
  <div class="results-wrapper">

    <div class="sea-card">
      <div class="sea-title">0.5 – 3.0 ft</div>
      <div class="sea-time">${minutesToHHMM(lowResult)}</div>
    </div>

    <div class="sea-card">
      <div class="sea-title">3.5 – 5.0 ft</div>
      <div class="sea-time">${minutesToHHMM(highResult)}</div>
    </div>

  </div>
`;

  document.getElementById("details").innerText =
    `Sunrise/Sunset: ${sunTimeInput.toString().padStart(4, "0")} | M/E Start: ${mesInput.toString().padStart(4, "0")}`;
}

updateSunLabel();

let manualThemeMode = null;

function applyThemeMode(mode) {
  document.body.classList.remove("day-mode", "night-mode");

  if (mode === "night") {
    document.body.classList.add("night-mode");
  }

  if (mode === "day") {
    document.body.classList.add("day-mode");
  }

  const button = document.getElementById("themeToggle");
  const label = document.getElementById("modeLabel");

  if (mode === "night") {
    if (button) {
        button.innerText = "SWITCH TO DAY MODE";
    }

    if (label) {
        label.innerText = "NIGHT MODE";
    }
  }

  if (mode === "day") {
    if (button) {
        button.innerText = "SWITCH TO NIGHT MODE";
    }

  if (label) {
    label.innerText = "DAY MODE";
  }
}
}

function getAutoThemeMode() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 16 || hour < 7) {
    return "night";
  }

  return "day";
}

function setInitialThemeMode() {
  applyThemeMode(getAutoThemeMode());
}

function toggleThemeMode() {
  const isNight = document.body.classList.contains("night-mode");
  manualThemeMode = isNight ? "day" : "night";
  applyThemeMode(manualThemeMode);
}

setInitialThemeMode();

// Keep service worker disabled while developing
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("/static/sw.js");
// }

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/static/sw.js");
}