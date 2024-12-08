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
      const response = await getWeather(inputValue);
      response.name =
        inputValue.slice(0, 1).toUpperCase() + inputValue.slice(1);
      displayWeather(response);
    } catch (error) {
      console.log(`handleSubmit Error: ${error}`);
    }
  } else {
    alert("Invalid location! Please enter a valid location name.");
  }
}

const locationForm = document.querySelector("[data-location-form]");
locationForm.addEventListener("submit", handleSubmit);
updatePinnedUI();
