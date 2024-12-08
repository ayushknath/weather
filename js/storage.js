function getSavedLocations() {
  const savedLocations = localStorage.getItem("savedLocations")
    ? JSON.parse(localStorage.getItem("savedLocations"))
    : [];
  return savedLocations;
}

function setSavedLocations(savedLocations) {
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
}

export { getSavedLocations, setSavedLocations };
