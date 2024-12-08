import { API_KEY } from "./config.js";

async function getLatLong(locationName) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status (getLatLong): ${response.status}`);
    }
    const data = await response.json();
    return [data[0].lat, data[0].lon];
  } catch (error) {
    console.log(`getLatLong Error: ${error}`);
  }
}

async function getWeather(locationName) {
  const [latitude, longitude] = await getLatLong(locationName);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status (getWeather): ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`getWeather Error: ${error}`);
  }
}

export { getLatLong, getWeather };
