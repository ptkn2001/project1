//Google API call back function
function initMap() {
    //Parsing the restaurant latitude and longitude coordinates passed in the query string.
    function getPageParamValueByName(paramName) {
        return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(paramName).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    var latitude = parseFloat(getPageParamValueByName("lat"));
    var longitude = parseFloat(getPageParamValueByName("lng"));

    var restaurantPosition = {
        lat: latitude,
        lng: longitude
    };

    //Get the map around the restaurant location.
    var map = new google.maps.Map(document.getElementById("map"), {
        center: restaurantPosition,
        zoom: 16,
        mapId: '6dbf17a103bba713'
    });

    //Draw the marker indicate the location of the restaurant on the map.
    new google.maps.Marker({
        position: restaurantPosition,
        map,
        title: 'restaurant location'
    });
}