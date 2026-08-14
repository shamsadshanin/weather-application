var countriesUrl = "https://restcountries.com/v3.1";
var weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
var weatherApiKey = "9c0712d91cba98b57a4ed10186fe99bf";

var requiredFields = "?fields=name,capital,population,region,currencies,flags";

window.onload = function() {
    loadCountries();
};

function loadCountries() {
    showLoading();
    fetch(countriesUrl + "/all" + requiredFields)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function(data) {
            displayCountries(data.slice(0, 12));
        })
        .catch(function(error) {
            console.error('Error:', error);
            showError("Failed to load countries. Please try refreshing.");
        });
}

function searchCountry() {
    var searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm === "") {
        loadCountries();
        return;
    }

    showLoading();
    fetch(countriesUrl + "/name/" + encodeURIComponent(searchTerm) + requiredFields)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Country not found');
            }
            return response.json();
        })
        .then(function(data) {
            displayCountries(data);
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
    if (country.currencies) {
        var currencyKeys = Object.keys(country.currencies);
        if (currencyKeys.length > 0) {
            currency = country.currencies[currencyKeys[0]].name;
        }
    }

    var flagUrl = country.flags ? (country.flags.png || country.flags.svg) : "";
    var countryName = (country.name && country.name.common) ? country.name.common : "Unknown";

    // Escape single quotes for inline onclick handler
    var safeCapital = capital.replace(/'/g, "\\'");
    var safeCountryName = countryName.replace(/'/g, "\\'");

    card.innerHTML = `
        <img src="${flagUrl}" class="country-flag" alt="Flag of ${countryName}" onerror="this.src='https://via.placeholder.com/320x180?text=No+Flag'">
        <div class="country-name">${countryName}</div>
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
        <button class="weather-btn" onclick="showWeather('${safeCapital}', '${safeCountryName}')">
            View Weather
        </button>
    `;

    return card;
}

function showWeather(city, countryName) {
    if (city === "N/A" || !city) {
        alert("No capital city available for weather data");
        return;
    }

    document.getElementById("modalTitle").textContent = "Weather in " + city + ", " + countryName;
    document.getElementById("weatherInfo").innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    document.getElementById("weatherModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";

    var fullUrl = weatherUrl + "?q=" + encodeURIComponent(city) + "&appid=" + weatherApiKey + "&units=metric";

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
            document.getElementById("weatherInfo").innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #7f8c8d;'>Weather data not available. Please verify your OpenWeather API key.</p>";
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
