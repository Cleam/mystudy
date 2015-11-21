var map;
var infowindows = [];
var markers = [];
var jsonArr = [];
var path;
var lastLatLng;
var curMarker;
var curLocation;
var curAllData;
var curDay;

function initmap() {
   var mapOptions = {
      zoom: 12,
      scaleControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   };

   map = new google.maps.Map(document.getElementById("map"), mapOptions);

   google.maps.event.addListener(map, 'click', function() {
      closeInfoWindows();
   });

   // jsObject.show();
   show();
}

function showmap(jsondata, allData, day) {
   curAllData = allData;
   curDay = day;
   clearMap();
   jsonArr = eval(jsondata);
   if (jsonArr.length > 0) {
      setBounds();
      setInfoWindows();
      setPath(day);
      setMarkers(day);
      setTimeout(showFirstInfoWindow, 500);
   } else {
      var mapOptions = {
         center: lastLatLng,
         zoom: 12,
         scaleControl: false,
         zoomControl: false,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions); // markers can't be cleared unless create a new map
   }
}

function clearMap() {
   clearInfoWindows();
   clearMarkers();
   if (path != null) {
      path.setMap(null);
   }
}

function showLocation(index) {
   if (index >= 0 && index < jsonArr.length) {
      var lat = jsonArr[index].lat;
      var lng = jsonArr[index].lng;
      var day = jsonArr[index].day;
      changeMapFocus(day);
      var latlng = new google.maps.LatLng(lat, lng);
      lastLatLng = latlng;
      map.panTo(latlng);
      closeInfoWindows();
      infowindows[index].open(map, markers[index]);
   }

}

function showCurLocation(lat, lng) {
   if (typeof map != 'undefined') {
      if (typeof curMarker != 'undefined') {
         curMarker.setMap(null);
      }
      var pinIcon = new google.maps.MarkerImage(
         "img/flag.png",
         null, /* size is determined at runtime */
         null, /* origin is 0,0 */
         null, /* anchor is bottom center of the scaled image */
         new google.maps.Size(16, 16)
      );
      curLocation = new google.maps.LatLng(lat, lng);
      curMarker = new google.maps.Marker({
         position: curLocation,
         map: map,
         icon: pinIcon
      });
   }

}

function focusCurLocation() {
   if (typeof curLocation != 'undefined') {
      map.panTo(curLocation);
   }
}

function attachInfoToMarker(marker, index) {

   google.maps.event.addListener(marker, 'click', function() {
      var lat = jsonArr[index].lat;
      var lng = jsonArr[index].lng;
      var day = jsonArr[index].day;
      changeMapFocus(day);
      var latlng = new google.maps.LatLng(lat, lng);
      map.panTo(latlng);
      closeInfoWindows();
      infowindows[index].open(map, marker);
      jsObject.setIndex(index);
   });

}

function changeMapFocus(day){
   if(curAllData && curDay != day){
      curDay = day;
      clearMarkers();
      if(path!=null)
         path.setMap(null);
      setPath(day);
      setMarkers(day);
   }
}

function setBounds() {
   if (jsonArr.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < jsonArr.length; i++) {
         var lat = jsonArr[i].lat;
         var lng = jsonArr[i].lng;
         var latlng = new google.maps.LatLng(lat, lng);
         bounds = bounds.extend(latlng);
      }

      if (typeof bounds != 'undefined') {
         map.fitBounds(bounds);
      }
   }
}

function setEmptyMarker() {
   if (typeof lastLatLng != 'undefined') {
      var position = new google.maps.LatLng(lastLatLng);


      var marker = new google.maps.Marker({
         position: position,
         map: map
      });
      markers.push(marker);
   }
}

function setMarkers(curDay) {
   for (var i = 0; i < jsonArr.length; i++) {
      var lat = jsonArr[i].lat;
      var lng = jsonArr[i].lng;
      var index = jsonArr[i].index;
      var name = jsonArr[i].name;
      var image = jsonArr[i].image;
      var day = jsonArr[i].day;
      // if(curAllData){
      //    if(day > -1 && day < 99){
      //       if (day == curDay)
      //          image = 'markers/day/D' + (day + 1) + '.png';
      //       else
      //          image = 'markers/day/D' + (day + 1) + '_grey.png';
      //    }
      // }else{
      //    image = 'http://img.chufaba.me/markers/marker' + (index + 1) + '.png';
      //    if (index >= 999) {
      //       image = 'http://img.chufaba.me/markers/marker999.png';
      //    } else if (index < 60) {
      //       image = 'markers/marker' + (index + 1) + '.png';
      //    }
      // }
      image = 'img/flag.png';


      var position = new google.maps.LatLng(lat, lng);

      var pinIcon = new google.maps.MarkerImage(
         image,
         null, /* size is determined at runtime */
         null, /* origin is 0,0 */
         new google.maps.Point(14, 32), /* anchor is bottom center of the scaled image */
         new google.maps.Size(28, 34)
      );

      markers[i] = new google.maps.Marker({
         title: name,
         position: position,
         map: map,
         icon: pinIcon
      });
      attachInfoToMarker(markers[i], index);
   }
}

function setInfoWindows() {
   for (var i = 0; i < jsonArr.length; i++) {
      var infowindow = new InfoBubble({
         map: map,
         content: getInfoCotent(i),
         position: new google.maps.LatLng(jsonArr[i].lat, jsonArr[i].lng),
         shadowStyle: 1,
         padding: 12,
         backgroundColor: 'rgb(255,255,255)',
         borderRadius: 4,
         arrowSize: 8,
         borderWidth: 0,
         maxHeight: 144,
         minHeight: 40,
         disableAutoPan: true,
         // hideCloseButton: false,    // 是否隐藏/显示关闭按钮
         // closeSrc: 'img/flag.png', // 设置关闭按钮图片
         arrowPosition: 50,
         backgroundClassName: 'phoney',
         arrowStyle: 0
      });
      infowindows.push(infowindow);
   }
}

function showFirstInfoWindow() {
   if (jsonArr.length > 0) {
      lastLatLng = new google.maps.LatLng(jsonArr[0].lat, jsonArr[0].lng);
      infowindows[0].open(map, markers[0]);
   }
}

function clearMarkers() {
   for (var i = 0; i < markers.length; i++) {
      var marker = markers[i];
      marker.setMap(null);
   }
   markers = [];
}

function clearInfoWindows() {
   for (var i = 0; i < infowindows.length; i++) {
      var infowindow = infowindows[i];
      infowindow.setMap(null);
   }
   infowindows = [];
}

function closeInfoWindows() {
   for (var i = 0; i < infowindows.length; i++) {
      var infowindow = infowindows[i];
      infowindow.close();
   }
}

function setPath(curDay) {
   if (jsonArr.length > 0) {
      var coordinates = [];
      var lat;
      var lng;
      var position;
      var day;
      for (var i = 0; i < jsonArr.length; i++) {
         day = jsonArr[i].day;
         if ((curAllData && day == curDay) || !curAllData){
            lat = jsonArr[i].lat;
            lng = jsonArr[i].lng;
            position = new google.maps.LatLng(lat, lng);
            coordinates.push(position);
         }
      }
      path = new google.maps.Polyline({
         path: coordinates,
         geodesic: true,
         strokeColor: '#33cc99',
         strokeOpacity: 1.0,
         strokeWeight: 4
      });

      path.setMap(map);
   }
}

function getInfoCotent(index) {
   var divContent = '<div id="content" onclick="javascript:jsObject.detail(' + index + ');"><div class="left_container"><img src="img/flag.png" height="32" width="32"></img></div>';
   divContent += '<div class = "center_container">';
   divContent += '<div class = "name">' + jsonArr[index].name + '</div>';
   if(jsonArr[index].name_en != undefined && jsonArr[index].name_en.length > 0){
      divContent += '<div class = "name_en"> ' + jsonArr[index].name_en + '</div>';
   }
   var str = '<div class = "country">';
   if (jsonArr[index].city != undefined && jsonArr[index].city.length > 0) {
      str += jsonArr[index].city + " ";
   }
   if (jsonArr[index].country != undefined && jsonArr[index].country.length > 0) {
      str += jsonArr[index].country;
   }
   str += '</div>';
   divContent += str + "</div>";
   divContent += '<div class = "right_container"><img src = "img/flag.png" width="18" height="18"></img> </div>';
   divContent += '</div>';
   return divContent;
}

function show() {
   var json = [{
      "image": "img/flag.png",
      "category": "sight",
      "index": 0,
      "day": 0,
      "lng": 114.172173,
      "name_en": "Ocean Park",
      "lat": 22.234635,
      "name": "香港海洋公园"
   }, {
      "image": "img/flag.png",
      "category": "sight",
      "index": 1,
      "lng": 113.540985,
      "day": 0,
      "name_en": "Ruins Of St. Paul'S Cathedral ",
      "lat": 22.197488,
      "name": "大三巴牌坊"
   }, {
      "image": "img/flag.png",
      "category": "sight",
      "index": 2,
      "lng": 113.540377,
      "day": 2,
      "name_en": "St. Dominic'S Church ",
      "lat": 22.194878,
      "name": "玫瑰圣母堂"
   }];
   showmap(json, true, 0);
}
