import { getSavedLocations } from "./storage.js";

const API_KEY = "b17a6ac4adb3e3fa7b1cd9e215e4faec";
let savedLocations = getSavedLocations();

export { API_KEY, savedLocations };
