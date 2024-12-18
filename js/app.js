import { getWeather } from "./weather.js";
import { displayWeather, updatePinnedUI } from "./ui.js";

async function handleSubmit(e) {
  e.preventDefault();
  const inputValue = locationForm
    .querySelector("[data-location-input]")
    .value.trim();
  const validationPattern = /^[a-zA-Z0-9\s,'-]{2,}$/;
  if (inputValue && validationPattern.test(inputValue)) {
    try {
      weatherDisplaySection.classList.add("fetching");
      const response = await getWeather(inputValue);
      weatherDisplaySection.classList.remove("fetching");
      response.name =
        inputValue.slice(0, 1).toUpperCase() + inputValue.slice(1);
      displayWeather(response);
    } catch (error) {
      console.log(`handleSubmit Error: ${error}`);
      alert("Invalid location!");
    }
  } else {
    alert("Invalid location! Please enter a valid location name.");
  }
}

const locationForm = document.querySelector("[data-location-form]");
const weatherDisplaySection = document.querySelector(
  "[data-weather-display-section]"
);
locationForm.addEventListener("submit", handleSubmit);
updatePinnedUI();
