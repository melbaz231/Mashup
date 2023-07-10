/*global google,$,*/
(function () {
    'use strict';

    let data = {};
    const locations = [];
    let currentMarker;

    const un = '';
    const searchButton = $('#search');
    const searchBox = $('#input');
    searchButton.click(() => {
        inputBox();
    });
    searchBox.on('keypress', function (e) {
        if (e.which === 13) {
            inputBox();
        }
    });
    function inputBox() {
        let keyword = searchBox.val();
        applyGeo(keyword);
        searchBox.val('');
    }
    async function geoSearch(place) {
        try {
            const response = await fetch(`http://api.geonames.org/wikipediaSearch?q=${place}&maxRows=10&username=${un}&type=json`);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            data = await response.json();
            return data;
        } catch (e) {
            console.error('Unable To Process Request', e);
        }
    }
    async function applyGeo(keyword) {
        await geoSearch(keyword);
        const place = data.geonames[0];
        const lat = place.lat;
        const lng = place.lng;
        const title = place.title;
        const icon = place.thumbnailImg;
        const summary = place.summary;

        currentMarker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            summary: summary,
            icon: {
                url: icon,
                scaledSize: new google.maps.Size(50, 50)
            }
        });
        addContentSetters();
        $('#sidebarContainer').prepend(`<div class="sidebar">${currentMarker.title}${currentMarker.position}
        <p>${currentMarker.summary}</p></div>`);
        map.panTo({ lat: lat, lng: lng });
        currentMarker.addListener('click', () => {
            contentSetter();
            infoWindow.open(map, currentMarker);
        });
    }
    function addContentSetters() {
        if (locations) {
            locations.forEach(location => {
                location.addListener('click', () => {
                    contentSetter();
                });
            });
        }
    }

    const startingLoc = { lat: 40.09584720509516, lng: -74.22222707431865 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: startingLoc,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    const infoWindow = new google.maps.InfoWindow({
    });

    function contentSetter() {
        infoWindow.setContent(`${data.geonames[0].summary}
      <br>
      <a href="https://${data.geonames[0].wikipediaUrl}" target="_blank">more info</a>`);
    }
})();