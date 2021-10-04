//Headers information required by the rapid api.
const headers = {
    "x-api-key": "ee4c99ebbbd26f1bf186d58f1f9821a0",
    "x-rapidapi-key": "5e922e6790msh2246e4b31f234a3p150363jsn9bc00953d94a",
    "x-rapidapi-host": "documenu.p.rapidapi.com"
};

//Google API call back function
function initMap() {
    const address = document.querySelector('#restaurant-address').innerHTML;

    if (!address) { return };

    let latitude = 0;
    let longitude = 0;
    let geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': address }, (results, status) => {

        if (status == google.maps.GeocoderStatus.OK) {
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();

            let eventPosition = {
                lat: latitude,
                lng: longitude
            };

            //Get the map around the restaurant location.
            let map = new google.maps.Map(document.getElementById("restaurant-map"), {
                center: eventPosition,
                zoom: 16,
                mapId: '6dbf17a103bba713'
            });

            //Draw the marker indicate the location of the restaurant on the map.
            new google.maps.Marker({
                position: eventPosition,
                map,
                title: 'restaurant location'
            });
        }
    });
}

//Select place holder elements.
const formEl = document.querySelector('#user-form');
var restaurantDisplayEl = $('#restaurant-display');
var restaurantHeaderEl = $('#restaurant-header');
var restaurantDetailsEl = $('#restaurant-details')
var searchby = document.getElementById("searchby");
$("#byzipcode").hide();

var lastCuisineSearch = localStorage.getItem("cuisine");
if (lastCuisineSearch !== null) {
    document.querySelector('#cuisine').value = lastCuisineSearch;
}

var userCurrentPosition = {
    lat: 0,
    lng: 0
}

const setUserCurrentPosition = position => {
    userCurrentPosition.lat = position.coords.latitude;
    userCurrentPosition.lng = position.coords.longitude;
}

//First we get the latitude and longitude for the user's location
navigator.geolocation.getCurrentPosition(setUserCurrentPosition);

//Function to reset the RestaurantInfo table.
const ResetRestaurantInfo = () => {
    restaurantDisplayEl.empty();
    restaurantHeaderEl.empty();
}

//Function to reset the restaurant details section.
const ResetRestaurantDetailsSection = () => {
    restaurantDetailsEl.empty();
}

//Event handler function for the user's input form.
const formSubmitHandler = event => {
    event.preventDefault();

    //Clear restaurant data.
    ResetRestaurantInfo();
    ResetRestaurantDetailsSection();

    const lat = userCurrentPosition.lat;
    const lng = userCurrentPosition.lng;
    var cuisine = document.querySelector('#cuisine').value;
    var distance = document.querySelector('#distance').value;
    var restaurantName = document.querySelector('#restaurant-name').value;
    var zip = document.querySelector('#zip').value;
    localStorage.setItem("cuisine", cuisine);

    if (searchby.value === "zipcode") {
        GetResturantByNameAPI(restaurantName, zip, cuisine)
    } else {
        GetResturantByGeoAPI(lat, lng, distance, cuisine)
    };
}

//Get list of restaurants from restaurant API then show them.
const GetRestaurants = requestUrl => {
    fetch(requestUrl, {
            "method": "GET",
            "headers": headers
        })
        .then(response => {
            return response.json();
        }).then(data => {
            ShowRestaurantInfo(data.data);
        })
        .catch(err => {
            alert(err);
        });
}

//Show restaurant info
const ShowRestaurantInfo = restaurants => {
    ResetRestaurantInfo();

    if (restaurants.length > 0) {
        //add menu item table header
        var restaurantHeaderRowEl = $('<tr>');
        var restaurantNamHeaderEl = $('<th>').text("Name");
        var restaurantAddressHeaderEl = $('<th>').text("Address");
        var restaurantPhoneNumberHeaderEl = $('<th>').text("Phone Number");
        restaurantHeaderRowEl.append(
            restaurantNamHeaderEl,
            restaurantAddressHeaderEl,
            restaurantPhoneNumberHeaderEl
        );
        restaurantHeaderEl.append(restaurantHeaderRowEl);

        //Add each restaurant found in search to the table
        for (var i = 0; i < restaurants.length; i++) {
            var restaurantRowEl = $('<tr>').addClass('restaurant-row');
            restaurantRowEl.attr('restaurantIndex', i);
            var restaurantNameTdEl = $('<td>').text(restaurants[i].restaurant_name);
            var restaurantAddressTdEl = $('<td>').text(restaurants[i].address.formatted);
            var restaurantPhoneTdEl = $('<td>').text(restaurants[i].restaurant_phone);
            restaurantRowEl.append(
                restaurantNameTdEl,
                restaurantAddressTdEl,
                restaurantPhoneTdEl
            );
            restaurantDisplayEl.append(restaurantRowEl);
        }

        //Add event listener when user clicks on a restaurant row
        restaurantDisplayEl.on('click', '.restaurant-row', event => {
            var restaurantIndex = event.currentTarget.attributes['restaurantIndex'].value;
            restaurantClickHandler(restaurants[restaurantIndex]);
        });
    }
}

//Restaurant onclick event handler.
const restaurantClickHandler = restaurant => {
    ResetRestaurantDetailsSection();

    var restaurantName = restaurant.restaurant_name;
    var restaurantAddress = restaurant.address.formatted;
    var restaurantPhoneNumber = restaurant.restaurant_phone;
    var restaurantHours = restaurant.hours;
    var restaurantWebsite = restaurant.restaurant_website;
    var restaurantid = restaurant.restaurant_id;
    var lat = restaurant.geo.lat;
    var lng = restaurant.geo.lon;

    restaurantDetailsEl.append(`<label>Name:</label>`);
    restaurantDetailsEl.append(`<p id = "restaurant-name">${restaurantName}</p>`);
    restaurantDetailsEl.append(`<label>Address:</label>`);
    restaurantDetailsEl.append(`<p id = "restaurant-address">${restaurantAddress}</p>`);
    restaurantDetailsEl.append(`<label>Phone:</label>`);
    restaurantDetailsEl.append(`<p id = "restaurant-phone">${restaurantPhoneNumber}</p>`);
    if (restaurantHours) {
        restaurantDetailsEl.append(`<p>Hours: ${restaurantHours}</p>`);
    }

    if (restaurantWebsite) {
        restaurantDetailsEl.append(`<p>Website: <a href="${restaurantWebsite}" target="_blank">${restaurantWebsite}</a></p>`);
    }

    restaurantDetailsEl.append('<div id="restaurant-map" style = "height: 500px;"</div>');

    var googleApiScript = document.createElement("script");
    googleApiScript.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA51EA8ocFj-7sqx78LGYN4BywXlsdyrsQ&map_ids=6dbf17a103bba713&callback=initMap";
    restaurantDetailsEl.append(googleApiScript);
}


//get resturant by name API
const GetResturantByNameAPI = (restaurantName, zip, cuisine) => {
    var requestUrl = "https://api.documenu.com/v2/restaurants/search/fields?zip_code=" + zip + "&exact=false" + "&size=30&page=1";
    if (restaurantName) {
        requestUrl += "&restaurant_name=" + restaurantName;
    }

    if (cuisine) {
        requestUrl = requestUrl + "&cuisine=" + cuisine;
    }
    GetRestaurants(requestUrl);
};

//get resturant by Geo API
const GetResturantByGeoAPI = (lat, lng, distance, cuisine) => {
    //Build the request Url for the rapid restaurant search api.
    var requestUrl = "https://documenu.p.rapidapi.com/restaurants/search/geo?lat=" + lat + "&lon=" + lng + "&size=30&page=1";

    //If the user select the distance in the user's form, we filter based on the distance selected.
    if (distance) {
        requestUrl = requestUrl + "&distance=" + distance;
    }
    //If the user entered the cuisine we filtler based on the cuisine entered.
    if (cuisine) {
        requestUrl = requestUrl + "&cuisine=" + cuisine;
    }
    GetRestaurants(requestUrl);
}

//Add event listener on the user's form.
formEl.addEventListener('submit', formSubmitHandler);

searchby.addEventListener("change", function() {
    //Clear restaurant data.
    ResetRestaurantInfo();
    ResetRestaurantDetailsSection();

    if (searchby.value === "zipcode") {
        $("#bylocation").hide();
        $("#byzipcode").show();
    } else {
        $("#bylocation").show();
        $("#byzipcode").hide();
    }
});