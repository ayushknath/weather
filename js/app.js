import { API_KEY } from "./config.js"

function getSavedLocations() {
  const savedLocations = localStorage.getItem("savedLocations") ? JSON.parse(localStorage.getItem("savedLocations")) : []; 
  return savedLocations;
}

function setSavedLocations(savedLocations) {
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
}

const locationForm = document.querySelector("[data-location-form]");
const weatherDisplaySection = document.querySelector("[data-weather-display-section]");
const pinnedLocationsList = document.querySelector("[data-pinned-locations-list]");
const savedLocations = getSavedLocations();

async function getLatLong(locationName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if(!response.ok) {
      throw new Error(`Response status (getLatLong): ${response.status}`);
    }
    const data = await response.json();
    return [data[0].lat, data[0].lon];
  }
  catch(error) {
    console.log(`getLatLong Error: ${error}`);
  }
}

async function getWeather(locationName) {
  const [latitude, longitude] = await getLatLong(locationName);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if(!response.ok) {
      throw new Error(`Response status (getWeather): ${response.status}`);
    }
    const data = await response.json();
    return data;
  }
  catch(error) {
    console.log(`getWeather Error: ${error}`);
  }
}

function deleteLocation(locationName) {
  const targetIndex = savedLocations.findIndex((savedLocation) => savedLocation === locationName);
  savedLocations.splice(targetIndex, 1);
  updatePinnedUI("UNPIN", locationName);
  setSavedLocations(savedLocations);
}

async function refreshWeather(locationName) {
  try {
    const targetIndex = Array.from(pinnedLocationsList.children).findIndex((listItem) => listItem.firstElementChild.firstElementChild.lastElementChild.textContent.split(", ")[0] === locationName);
    pinnedLocationsList.children[targetIndex].classList.add("refreshing");
    const response = await getWeather(locationName);
    response.name = locationName;
    pinnedLocationsList.children[targetIndex].classList.remove("refreshing");
    pinnedLocationsList.children[targetIndex].lastElementChild.firstElementChild.firstElementChild.textContent = response.main.temp.toString() + "°C";
    pinnedLocationsList.children[targetIndex].lastElementChild.firstElementChild.lastElementChild.src = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
    pinnedLocationsList.children[targetIndex].lastElementChild.lastElementChild.firstElementChild.textContent = response.weather[0].main.toString();
    pinnedLocationsList.children[targetIndex].lastElementChild.lastElementChild.children[1].textContent = `Feels like ${response.main.feels_like}°`;
    pinnedLocationsList.children[targetIndex].lastElementChild.lastElementChild.lastElementChild.textContent = `Min ${response.main.temp_min}° • Max ${response.main.temp_max}°`;
  }
  catch(error) {
    console.log(`refreshWeather Error: ${error}`);
  }
}

function pinnedListUI(response) {
  const li = document.createElement("li");
  li.classList.add("pinned-display-list-item");
  li.innerHTML = `
    <header class="weather-display-header">
      <h3>
        <img src="./assets/img/location-pin.png" alt="Location pin icon" />
        <span>${response.name}, ${response.sys.country}</span>
      </h3>
      <div class="action-icons-container">
        <button title="Refresh weather data" data-refresh-location-data>
          <img src="./assets/img/refresh.png" alt="Refresh icon" />
        </button>
        <button title="Unpin location" data-delete-location>
          <img src="./assets/img/pin-filled.png" alt="Unpin icon" />
        </button>
      </div>
    </header>
    <div class="weather-details">
      <p class="temp-main">
        <span>${response.main.temp}°C</span>
        <img src="https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png" alt="Weather icon" />
      </p>
      <p class="temp-secondary">
        <span>${response.weather[0].main}</span>
        <span>Feels like ${response.main.feels_like}°</span>
        <span>Min ${response.main.temp_min}° • Max ${response.main.temp_max}°</span>
      </p>
    </div>
  `;
  const unpinLocationButton = li.querySelector("[data-delete-location]");
  const refreshWeatherButton = li.querySelector("[data-refresh-location-data]");
  unpinLocationButton.addEventListener("click", () => {
    deleteLocation(response.name);
  });
  refreshWeatherButton.addEventListener("click", () => {
    refreshWeather(response.name);
  });
  return li;
}

async function pinLocation() {
  const locationName = savedLocations[savedLocations.length - 1];
  try {
    const response = await getWeather(locationName);
    response.name = locationName;
    pinnedLocationsList.appendChild(pinnedListUI(response));
  }
  catch(error) {
    console.log(`appendLocation Error: ${error}`);
  }
}

function unpinLocation(locationName) {
  const targetIndex = Array.from(pinnedLocationsList.children).findIndex((listItem) => listItem.firstElementChild.firstElementChild.lastElementChild.textContent.split(", ")[0] === locationName);
  pinnedLocationsList.children[targetIndex].remove();
}

function displayPinnedLocations() {
  savedLocations.forEach(async (savedLocation) => {
    try {
      const response = await getWeather(savedLocation);
      response.name = savedLocation;
      pinnedLocationsList.appendChild(pinnedListUI(response));
    }
    catch(error) {
      console.log(`displayPinnedLocations Error: ${error}`);
    }
  });
}

function updatePinnedUI(action, locationName = undefined) {
  switch(action) {
    case "PIN":
    case "pin":
      pinLocation();
      break;
    case "UNPIN":
    case "unpin":
      unpinLocation(locationName);
      break;
    default:
      displayPinnedLocations();
  }
}

function saveLocation(locationName) {
  savedLocations.push(locationName);
  updatePinnedUI("PIN");
  setSavedLocations(savedLocations);
}

function displayWeather(response) {
  weatherDisplaySection.innerHTML = `
    <header class="weather-display-header">
      <h3>
        <img src="./assets/img/location-pin.png" alt="Location pin icon" />
        <span>${response.name}, ${response.sys.country}</span>
      </h3>
      <button title="Pin location" data-save-location>
        <img src="./assets/img/pin.png" alt="Pin icon" />
      </button>
    </header>
    <div class="weather-details">
      <p class="temp-main">
        <span>${response.main.temp}°C</span>
        <img src="https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png" alt="Weather icon" />
      </p>
      <p class="temp-secondary">
        <span>${response.weather[0].main}</span>
        <span>Feels like ${response.main.feels_like}°</span>
        <span>Min ${response.main.temp_min}° • Max ${response.main.temp_max}°</span>
      </p>
    </div>
  `;
  const saveLocationButton = weatherDisplaySection.querySelector("[data-save-location]");
  saveLocationButton.addEventListener("click", () => {
    saveLocation(response.name);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const inputValue = locationForm.querySelector("[data-location-input]").value.trim();
  const validationPattern = /^[a-zA-Z0-9\s,'-]{2,}$/;
  if (inputValue && validationPattern.test(inputValue)) {
    try {
      const response = await getWeather(inputValue);
      response.name = inputValue.slice(0, 1).toUpperCase() + inputValue.slice(1);
      displayWeather(response);
    }
    catch(error) {
      console.log(`handleSubmit Error: ${error}`);
    }
  }
  else {
    alert("Invalid location! Please enter a valid location name.");
  }
}

locationForm.addEventListener("submit", handleSubmit);
updatePinnedUI();