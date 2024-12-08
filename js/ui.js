import { savedLocations } from "./config.js";
import { setSavedLocations } from "./storage.js";
import { getWeather } from "./weather.js";

async function refreshWeather(locationName) {
  try {
    const targetIndex = Array.from(pinnedLocationsList.children).findIndex(
      (listItem) =>
        listItem.firstElementChild.firstElementChild.lastElementChild.textContent.split(
          ", "
        )[0] === locationName
    );
    pinnedLocationsList.children[targetIndex].classList.add("refreshing");
    const response = await getWeather(locationName);
    response.name = locationName;
    pinnedLocationsList.children[targetIndex].classList.remove("refreshing");
    pinnedLocationsList.children[
      targetIndex
    ].lastElementChild.firstElementChild.firstElementChild.textContent =
      Math.round(response.main.temp).toString() + "°C";
    pinnedLocationsList.children[
      targetIndex
    ].lastElementChild.firstElementChild.lastElementChild.src = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
    pinnedLocationsList.children[
      targetIndex
    ].lastElementChild.lastElementChild.firstElementChild.textContent =
      response.weather[0].main;
    pinnedLocationsList.children[
      targetIndex
    ].lastElementChild.lastElementChild.children[1].textContent = `Feels like ${Math.round(
      response.main.feels_like
    )}°`;
    pinnedLocationsList.children[
      targetIndex
    ].lastElementChild.lastElementChild.lastElementChild.textContent = `Min ${Math.round(
      response.main.temp_min
    )}° • Max ${Math.round(response.main.temp_max)}°`;
  } catch (error) {
    console.log(`refreshWeather Error: ${error}`);
  }
}

function pinnedListItemUI(response) {
  const li = document.createElement("li");
  li.classList.add("pinned-item");
  li.innerHTML = `
    <header class="weather-display-header">
      <h3>
        <img src="./assets/img/location-pin.png" alt="Location pin icon" />
        <span>${response.name}, ${response.sys.country}</span>
      </h3>
      <div class="action-icons-container">
        <button class="action-button refresh-button" title="Refresh weather data" data-refresh-location-data>
          <img src="./assets/img/refresh.png" alt="Refresh icon" />
        </button>
        <button class="action-button unpin-button" title="Unpin location" data-delete-location>
          <img src="./assets/img/pin-filled.png" alt="Unpin icon" />
        </button>
      </div>
    </header>
    <div class="weather-details">
      <p class="temp-main">
        <span>${Math.round(response.main.temp)}°C</span>
        <img src="https://openweathermap.org/img/wn/${
          response.weather[0].icon
        }@2x.png" alt="Weather icon" />
      </p>
      <p class="temp-secondary">
        <span>${response.weather[0].main}</span>
        <span>Feels like ${Math.round(response.main.feels_like)}°</span>
        <span>Min ${Math.round(response.main.temp_min)}° • Max ${Math.round(
    response.main.temp_max
  )}°</span>
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
    pinnedLocationsList.appendChild(pinnedListItemUI(response));
  } catch (error) {
    console.log(`appendLocation Error: ${error}`);
  }
}

function unpinLocation(locationName) {
  const targetIndex = Array.from(pinnedLocationsList.children).findIndex(
    (listItem) =>
      listItem.firstElementChild.firstElementChild.lastElementChild.textContent.split(
        ", "
      )[0] === locationName
  );
  pinnedLocationsList.children[targetIndex].remove();
}

function displayPinnedLocations() {
  savedLocations.forEach(async (savedLocation) => {
    try {
      const response = await getWeather(savedLocation);
      response.name = savedLocation;
      pinnedLocationsList.appendChild(pinnedListItemUI(response));
    } catch (error) {
      console.log(`displayPinnedLocations Error: ${error}`);
    }
  });
}

function updatePinnedUI(action, locationName = undefined) {
  switch (action) {
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

function deleteLocation(locationName) {
  const targetIndex = savedLocations.findIndex(
    (savedLocation) => savedLocation === locationName
  );
  savedLocations.splice(targetIndex, 1);
  updatePinnedUI("UNPIN", locationName);
  setSavedLocations(savedLocations);
}

function displayWeather(response) {
  weatherDisplaySection.innerHTML = `
    <header class="weather-display-header">
      <h3>
        <img src="./assets/img/location-pin.png" alt="Location pin icon" />
        <span>${response.name}, ${response.sys.country}</span>
      </h3>
      <button class="action-button pin-button" title="Pin location" data-save-location>
        <img src="./assets/img/pin.png" alt="Pin icon" />
      </button>
    </header>
    <div class="weather-details">
      <p class="temp-main">
        <span>${Math.round(response.main.temp)}°C</span>
        <img src="https://openweathermap.org/img/wn/${
          response.weather[0].icon
        }@2x.png" alt="Weather icon" />
      </p>
      <p class="temp-secondary">
        <span>${response.weather[0].main}</span>
        <span>Feels like ${Math.round(response.main.feels_like)}°</span>
        <span>Min ${Math.round(response.main.temp_min)}° • Max ${Math.round(
    response.main.temp_max
  )}°</span>
      </p>
    </div>
  `;

  const saveLocationButton = weatherDisplaySection.querySelector(
    "[data-save-location]"
  );
  saveLocationButton.addEventListener("click", () => {
    saveLocation(response.name);
  });
}

const weatherDisplaySection = document.querySelector(
  "[data-weather-display-section]"
);
const pinnedLocationsList = document.querySelector(
  "[data-pinned-locations-list]"
);

export { displayWeather, updatePinnedUI };
