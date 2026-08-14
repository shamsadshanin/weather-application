var countriesApiKey = "rc_live_651d4e97dace45be8b39ec980c2920f8";
var countriesUrl = "https://api.restcountries.com/countries/v5";
var weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
var weatherApiKey = "9c0712d91cba98b57a4ed10186fe99bf";

window.onload = function() {
    loadCountries();
};

function getHeaders() {
    return {
        'Authorization': 'Bearer ' + countriesApiKey
    };
}

function loadCountries() {
    showLoading();
    fetch(countriesUrl + "?q=all", { headers: getHeaders() })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function(result) {
            if (result.success && result.data) {
                displayCountries(result.data.slice(0, 12));
            } else {
                showError("Failed to load countries");
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            showError("Failed to load countries. Please try again.");
        });
}

function searchCountry() {
    var searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm === "") {
        loadCountries();
        return;
    }

    showLoading();
    fetch(countriesUrl + "?q=" + searchTerm, { headers: getHeaders() })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Country not found');
            }
            return response.json();
        })
        .then(function(result) {
            if (result.success && result.data && result.data.length > 0) {
                displayCountries(result.data);
            } else {
                showError("Country not found. Please try again.");
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            showError("Country not found. Please try again.");
        });
}

function displayCountries(countries) {
    var displayArea = document.getElementById("displayArea");
    displayArea.innerHTML = "";

    if (!countries || countries.length === 0) {
        showError("No countries found");
        return;
    }

    countries.forEach(function(country) {
        var card = createCountryCard(country);
        displayArea.appendChild(card);
    });
}

function createCountryCard(country) {
    var card = document.createElement("div");
    card.className = "country-card";

    var capital = "N/A";
    if (country.capital && country.capital.length > 0) {
        capital = country.capital[0];
    }

    var population = country.population ? country.population.toLocaleString() : "N/A";
    var region = country.region || "N/A";
    
    var currency = "N/A";
    if (country.currencies && Object.keys(country.currencies).length > 0) {
        var currencyKey = Object.keys(country.currencies)[0];
        currency = country.currencies[currencyKey].name;
    }

    var flagUrl = "N/A";
    if (country.flags && country.flags.png) {
        flagUrl = country.flags.png;
    } else if (country.cca2) {
        flagUrl = "https://flagcdn.com/w320/" + country.cca2.toLowerCase() + ".png";
    }

    card.innerHTML = `
        <img src="${flagUrl}" class="country-flag" alt="Flag of ${country.name.common}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23f0f2f5%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Flag%3C/text%3E%3C/svg%3E'">
        <div class="country-name">${country.name.common}</div>
        <div class="country-info">
            <div class="info-row">
                <span class="info-label">Capital:</span>
                <span class="info-value">${capital}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Population:</span>
                <span class="info-value">${population}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Region:</span>
                <span class="info-value">${region}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Currency:</span>
                <span class="info-value">${currency}</span>
            </div>
        </div>
        <button class="weather-btn" onclick="showWeather('${capital}', '${country.name.common}')">
            View Weather
        </button>
    `;

    return card;
}

function showWeather(city, countryName) {
    if (city === "N/A") {
        alert("No capital city available for weather data");
        return;
    }

    document.getElementById("modalTitle").textContent = "Weather in " + city + ", " + countryName;
    document.getElementById("weatherInfo").innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    document.getElementById("weatherModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";

    var fullUrl = weatherUrl + "?q=" + city + "&appid=" + weatherApiKey + "&units=metric";

    fetch(fullUrl)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Weather data not available");
            }
        })
        .then(function(data) {
            displayWeatherData(data);
        })
        .catch(function(error) {
            document.getElementById("weatherInfo").innerHTML = "<p>Weather data not available. Please check your API key.</p>";
        });
}

function displayWeatherData(data) {
    var weatherInfo = document.getElementById("weatherInfo");
    
    weatherInfo.innerHTML = `
        <div class="weather-item">
            <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
            <div class="weather-desc">${data.weather[0].description}</div>
        </div>
        <div class="weather-item">
            <p><strong>Feels Like:</strong> ${Math.round(data.main.feels_like)}°C</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
        </div>
        <div class="weather-item">
            <p><strong>Min:</strong> ${Math.round(data.main.temp_min)}°C</p>
            <p><strong>Max:</strong> ${Math.round(data.main.temp_max)}°C</p>
            <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
        </div>
    `;
}

function closeModal() {
    document.getElementById("weatherModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
}

function showLoading() {
    document.getElementById("displayArea").innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById("displayArea").innerHTML = `
        <div class="loading">
            <p style="color: #e74c3c;">${message}</p>
        </div>
    `;
}
