var googleSuccess = function() {
    "use strict";
    // markersData variable stores the information necessary to each marker
    var cityData = [{
        cityName: "Calgary, AB",
        cityDescript: "Where I currently live",
        cityStr: "Calgary, Alberta",
        streetView: "http://maps.googleapis.com/maps/api/streetview?size=175x175&location=calgary",
        latLng: {
            lat: 51.03,
            lng: -114.14
        },
    }, {
        cityName: "Vancouver, BC",
        cityDescript: "Where I grew up",
        cityStr: "Vancouver, British Columbia",
        streetView: "http://maps.googleapis.com/maps/api/streetview?size=175x175&location=vancouver",
        latLng: {
            lat: 49.28,
            lng: -123.12
        },
    }, {
        cityName: "Toronto, ON",
        cityDescript: "Where Drake lives",
        cityStr: "Toronto, Ontario",
        streetView: "http://maps.googleapis.com/maps/api/streetview?size=175x175&location=toronto",
        latLng: {
            lat: 43.65,
            lng: -79.38
        },
    }, {
        cityName: "Mountainview, CA",
        cityDescript: "Where I learned how to program",
        cityStr: "Mountainview",
        streetView: "http://maps.googleapis.com/maps/api/streetview?size=175x175&location=MountainviewCalifornia",
        latLng: {
            lat: 37.3894,
            lng: -122.0819
        },
    }, {
        cityName: "Kananaskis Country, AB",
        cityDescript: "Where Leonardo DiCaprio filmed The Revenant",
        cityStr: "Kananaskis Country",
        streetView: "http://maps.googleapis.com/maps/api/streetview?size=175x175&location=Kananaskis",
        latLng: {
            lat: 50.83,
            lng: -115.21
        }
    }];

    var ViewModel = function() {

        var self = this;
        // self.googleMap is a reference storing the Google Map Object.
        self.googleMap = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 55.513299,
                lng: -97.1628807
            },
            zoom: 4
        });

        // Create empty array to temporarily create and store place objects.
        // The forEach loop will loop through the cityData array above.
        // The push method will execute after each time creating a new "Place"
        // object for each index.

        self.allPlaces = [];
        cityData.forEach(function(place) {
            self.allPlaces.push(new Place(place));
        });

        // loop through the self.allPlaces array and add a map marker
        // for each location.
        // set place marker infowindow and click settings.

        self.allPlaces.forEach(function(place) {
            var contentString = '<div class="infoBox text-center row">' + '<h1>' + place.cityName + '</h1>' + '<h2>' + place.cityDescript + '</h2>' +
                '<img class="img-responsive" src=" ' + place.streetView + '"> ' + "<div id='content'></div>" + '</div>';

            var markerOptions = {
                map: self.googleMap,
                position: place.latLng,
                draggable: false,
                animation: google.maps.Animation.DROP,
                content: contentString
            };
            place.marker = new google.maps.Marker(markerOptions);

            place.marker.infoWindow = new google.maps.InfoWindow({
                position: place.latLng,
                content: contentString
            });
            place.marker.infoWindow.setContent(place.marker.content);

            place.marker.addListener('click', function toggleBounce() {
                place.marker.infoWindow.open(self.googleMap);
                getApi();
                if (place.marker.getAnimation() !== null) {
                    place.marker.setAnimation(null);
                } else {
                    place.marker.setAnimation(google.maps.Animation.BOUNCE);
                }
                setTimeout(function() {
                    place.marker.setAnimation(null);
                }, 1400);
            });

            var getApi = function() {

                var $windowContent = $('#content');
                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + place.cityStr + '&format=json&callback=wikiCallback';
                var wikiRequestTimeout = setTimeout(function() {
                    $windowContent.text("failed to get wikipedia resources");
                }, 8000);

                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    jsonp: "callback",
                    success: function(response) {
                        var articleList = response[1];
                        var i;
                        var articleStr;
                        var url;
                        $windowContent.text('');
                        for (i = 0; i < articleList.length; i += 1) {
                            articleStr = articleList[i];
                            url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            $windowContent.append('<li class="text-center"><a href="' + url + '">' + articleStr + '</a></li>');
                        }
                        clearTimeout(wikiRequestTimeout);
                    }
                });
            };
        });
        // setting observable array to observe when to show the map marker on the map.
        self.visible = ko.observableArray();
        // looping through the self.allPlaces array and setting the marker when visible.
        self.allPlaces.forEach(function(place) {
            self.visible.push(place);
        });
        // this variable will store and observe the user input string of characters.
        self.userInput = ko.observable('');
        // The filter will look at the names of the places the Markers are standing
        // for, and look at the user input in the search box. If the user input string
        // can be found in the place name, then the place is allowed to remain
        // visible. All other markers are removed.

        self.filterMarkers = function() {

            var searchInput = self.userInput().toLowerCase();

            self.visible.removeAll();

            // This looks at the name of each places and then determines if the user
            // input can be found within the place name.

            self.allPlaces.forEach(function(place) {
                place.marker.setMap(null);

                if (place.cityName.toLowerCase().indexOf(searchInput) !== -1) {
                    self.visible.push(place);
                };
            });

            self.visible().forEach(function(place) {
                place.marker.setMap(self.googleMap);
            });
        };

        function Place(dataObj) {
            this.cityName = dataObj.cityName;
            this.cityDescript = dataObj.cityDescript;
            this.streetView = dataObj.streetView;
            this.latLng = dataObj.latLng;
            this.cityStr = dataObj.cityStr;
            // You will save a reference to the Places' map marker after you build the
            // marker:
            this.openInfoWindow = function() {
                this.marker.infoWindow.open(self.googleMap, this.marker);
            };
            this.marker = null;
        };
    };
    ko.applyBindings(new ViewModel());
};