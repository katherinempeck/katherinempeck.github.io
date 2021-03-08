window.onload = function(){

// create map 
    // set view to Leeward Kohala, zoomed in 12 (whole peninsula in view)
    var map = L.map('mapId').setView([20.153192739527213, -155.80060841475205], 12);
    
    //create variable for ESRI World Imagery tiles
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    // add tiles to map variable
    Esri_WorldImagery.addTo(map);

// Set layer styles
    // Documentation: Styling geojson data in Leaflet: https://leafletjs.com/examples/geojson/

    // Boundary style
    var boundStyle = {
        "fillOpacity": 0,
        "weight": 1,
        "opacity": 1,
        "color": "white"
    }

    // set Leaflet style for temperature
    var tempStyle = {
        "fillOpacity": .25,
        "fillColor": "#8ee6a6",
        "weight": 1,
        "opacity": 1,
        "color": "#8ee6a6"
        }

    // set Leaflet style for isohyet lines
    var annIsoStyle = {
        "color": "#42adff",
        "weight": 1,
        "opacity": 1 
    }

    // set Leaflet style for field system polygon
    var styleFS = {
        "fillOpacity": 0,
        "weight": 1,
        "opacity": 1,
        "color": "#ffffff"
    }

    // style rain station points
    function pointToCircle(feature, latlng) {
        var geojsonMarkerOptions = {
          radius: 5,
          fillColor: "blue",
          color: "black",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
          
        };
  
        var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
  
        return circleMarker;
      }

    // style archaeological data
    var archStyle = {
        "fillOpacity": 0,
        "weight": 0,
        "opacity": 0,
    }

// Create Tooltip Functions

    // Temperature tooltips
    function tempPopups(feature, layer) {
        var tempValue = "&#8805;18&#176; Annual Temperature"
        if (feature.properties && feature.properties.Temp) {
            layer.bindPopup(tempValue)
        }
    }

    // Function to set tooltip popup for individual isohyets
    function isoPopups(feature, layer) {
        // adds popup when you click on an isohyet
        var popupValue = "<b>Annual Rainfall:</b> " + feature.properties.CONTOUR + " mm"
        if (feature.properties && feature.properties.CONTOUR) {
            layer.bindPopup(popupValue)
        }
    }
    
    // Function to set tooltip popup for field systems
    function fsPopups(feature, layer) {
        // adds popup when you click on a field system boundary
        var fsPValue = "<b>Field System:</b> " + feature.properties.System
        if (feature.properties && feature.properties.System) {
            layer.bindPopup(fsPValue)
        }

    }

    // geology popups
    function lithoPopup(feature, layer) {
        var lithoValue = "<b>Surface Geology: </b>" + feature.properties.NAME
        if (feature.properties && feature.properties.NAME) {
            layer.bindPopup(lithoValue)
        }
    }

    function ualaPopup(feature, layer) {
        var ualaValue = feature.properties.No_Months + " month(s) with sufficient rainfall<sup><a href='http://rainfall.geography.hawaii.edu/downloads.html' target=_blank>1</a></sup> (&ge; 90 mm) for sweet potato cultivation<sup><a href='https://www.jstor.org/stable/pdf/26799143.pdf' target=_blank>2<a/></sup>"
        if (feature.properties && feature.properties.No_Months) {
            layer.bindPopup(ualaValue)
        };
    };    


// Create layer variables
    // "onEachFeature" to access popup functions defined above
    // Creating these as variables allow them to be included in the layer control function below

    // Kohala District Boundary
    var mokuBound = L.geoJSON(kohalaBound, {
        style: boundStyle
    });

    // Temperature
    var uala18 = L.geoJSON(temp18, {
        style: tempStyle,
        onEachFeature: tempPopups
    });

    // Rainfall isohyet layers
    var isohyets = L.geoJSON(annIso, {
        onEachFeature: isoPopups,
        style: annIsoStyle
    });

    // Surface geology layers 
    // switch statement colors polygons conditionally
    var geology = L.geoJSON(kohalaGeo, {
        onEachFeature: lithoPopup,
        style: function(feature) {
            switch (feature.properties.NAME) {
                case 'Hawi Volcanics': return {"color": "#ff0000", "fillOpacity": .1, "weight": 1, "opacity": .5};
                case 'Pololu Volcanics': return {"color": "#a742f5", "fillOpacity": .1, "weight": 1, "opacity": .5};
                case 'Alluvium': return {color: "#de7e10", "fillOpacity": .1, "weight": 1, "opacity": .5};
                case 'Hamakua Volcanics': return {color: "#faf323", "fillOpacity": .1, "weight": 1, "opacity": .5};
            }
        }
    });

    // Field System boundary polygons
    var fSyst = L.geoJSON(lineSystems, {
        onEachFeature: fsPopups,
        style: styleFS
    });

    // Archaeology tooltip data (clipped by FS bounds, merged)
    // on mouseover, show tooltip
    // Inspired by discussions here: https://stackoverflow.com/questions/27748453/mouseover-actions-with-geojson-polygon and here: https://gis.stackexchange.com/questions/31951/showing-popup-on-mouse-over-not-on-click-using-leaflet
    var archTooltips = L.geoJSON(archData, {
        onEachFeature: function (feature, layer) {
            layer.on('mouseover', function(e) {
                var archPopup = L.popup()
                .setLatLng(e.latlng)
                .setContent("<dl><dt><b>Field System: </b></dt>" + feature.properties.FieldSyste + "<dt><b>Rainfall Range: </b></dt>" + feature.properties.MinRain + "-" + feature.properties.MaxRain + "<dt><b>Substrate Age: </b></dt>" + feature.properties.AGE_RANGE + "<dt><b>Slope Class: </b></dt>" + feature.properties.Ag_slope)
                .openOn(map);  
            }
            )},
        style: archStyle
    });

    // Sweet Potato Threshold layer (chloropleth style display)
    var uala = L.geoJSON(ualaRain, {
        onEachFeature: ualaPopup,
        style: function getColor(feature) {
            switch (feature.properties.No_Months) {
                case 1: return {"fillColor": "#f5faff", "fillOpacity": 1, "opacity": 0};
                case 2: return {"fillColor": "#f7fbff", "fillOpacity": 1, "opacity": 0};
                case 3: return {"fillColor": "#deebf7", "fillOpacity": 1, "opacity": 0};
                case 4: return {"fillColor": "#c6dbef", "fillOpacity": 1, "opacity": 0};
                case 5: return {"fillColor": "#9ecae1", "fillOpacity": 1, "opacity": 0};
                case 6: return {"fillColor": "#6baed6", "fillOpacity": 1, "opacity": 0};
                case 7: return {"fillColor": "#4292c6", "fillOpacity": 1, "opacity": 0};
                case 8: return {"fillColor": "#2171b5", "fillOpacity": 1, "opacity": 0};
                case 9: return {"fillColor": "#08519c", "fillOpacity": 1, "opacity": 0};
                case 10: return {"fillColor": "#08306b", "fillOpacity": 1, "opacity": 0};
                case 11: return {"fillColor": "#011d45", "fillOpacity": 1, "opacity": 0};
                case 12: return {"fillColor": "#010a17", "fillOpacity": 1, "opacity": 0};
             }
         }
    });
    
    // Sweet potato legend (an off-map button adds/removes this feature, it also removes automatically once the sweet potato layer is removed)
    // Legend style source: Leaflet legend by John https://codepen.io/haakseth/pen/KQbjdO

    var ualaLegend = L.control({position: 'bottomright'});

    ualaLegend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Months of Rainfall >90 mm</h4>";
        div.innerHTML += '<i style="background: #f5faff"></i><span>1 Month</span><br>';
        div.innerHTML += '<i style="background: #f7fbff"></i><span>2 Months</span><br>';
        div.innerHTML += '<i style="background: #deebf7"></i><span>3 Months</span><br>';
        div.innerHTML += '<i style="background: #c6dbef"></i><span>4 Months</span><br>';
        div.innerHTML += '<i style="background: #9ecae1"></i><span>5 Months</span><br>';
        div.innerHTML += '<i style="background: #6baed6"></i><span>6 Months</span><br>';
        div.innerHTML += '<i style="background: #4292c6"></i><span>7 Months</span><br>';
        div.innerHTML += '<i style="background: #2171b5"></i><span>8 Months</span><br>';
        div.innerHTML += '<i style="background: #08519c"></i><span>9 Months</span><br>';
        div.innerHTML += '<i style="background: #08306b"></i><span>10 Months</span><br>';
        div.innerHTML += '<i style="background: #011d45"></i><span>11 Months</span><br>';
        div.innerHTML += '<i style="background: #010a17"></i><span>12 Months</span><br>';
        return div;
    };


    // Rainfall Gauge Stations
    // Each station is a point; on click a bar chart of monthly rainfall pops up
    // d3 chart popup http://bl.ocks.org/Andrew-Reid/11602fac1ea66c2a6d7f78067b2deddb
    function chart(d) {
        var feature = d.feature;
        // adds variable with my data in the format this code is expecting
        var data = [+feature.properties.JanAvgMM,+feature.properties.FebAvgMM,+feature.properties.MarAvgMM,+feature.properties.AprAvgMM,+feature.properties.MayAvgMM,+feature.properties.JunAvgMM,+feature.properties.JulAvgMM,+feature.properties.AugAvgMM,+feature.properties.SepAvgMM,+feature.properties.OctAvgMM,+feature.properties.NovAvgMM,+feature.properties.DecAvgMM];
        // width/height adjusted from original to accommodate three digit numbers
        var width = 290;
        var height = 80;
        var margin = {left:25,right:25,top:40,bottom:40};
        var parse = d3.timeParse("%m");
        var format = d3.timeFormat("%b");
         
        var div = d3.create("div")
        var svg = div.append("svg")
          .attr("width", width+margin.left+margin.right)
          .attr("height", height+margin.top+margin.bottom);
        var g = svg.append("g")
          .attr("transform","translate("+[margin.left,margin.top]+")");
          
        var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return d; }) ])
          .range([height, 0]);
          
        var yAxis = d3.axisLeft()
          .ticks(6)
          .scale(y);
        g.append("g").call(yAxis);
          
        var x = d3.scaleBand()
          .domain(d3.range(12))
          .range([0,width]);
          
        var xAxis = d3.axisBottom()
          .scale(x)
          .tickFormat(function(d) { return format(parse(d+1)); });
          
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("text-anchor","end")
            .attr("transform","rotate(-90)translate(-12,-15)")
          
        var rects = g.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("y",height)
          .attr("height",0)
          .attr("width", x.bandwidth()-2 )
          .attr("x", function(d,i) { return x(i); })
          .attr("fill","steelblue")
          .transition()
          .attr("height", function(d) { return height-y(d); })
          .attr("y", function(d) { return y(d); })
          .duration(1000);
          
        var title = svg.append("text")
          .style("font-size", "10px")
          .text(feature.properties.Name + " Gauge Rainfall (mm) - " + feature.properties.MinYear + " - " + feature.properties.MaxYear)
          .attr("x", width/2 + margin.left)
          .attr("y", 15)
          .attr("text-anchor","middle");

        //   Adds threshold line explanation as "foreignObject" so that it can be styled with html
        if ((d3.max(data) >= 90)) {
            var caption = svg.append("foreignObject")
                // .style("font-size", "10px")
                .attr('height', 50)
                .attr('width', 250)
                .html('<i><font color=red size=1>Red line </font> <font size=1>= 90 mm rainfall (required for sweet potato)</font></i>')
                // .style('fill', 'red')
                .attr("x", 50)
                .attr("y", 17)
                .attr("text-anchor", "middle");
        }
        
        

        // Code adapted to add threshold line for sweet potato cultivation
        // Main Reference:
        // https://stackoverflow.com/questions/37705279/how-to-add-a-line-on-x-axis-on-a-horizontal-bar-chart-in-d3
        // Thank you to stack overflow user @mgraham for advice on how to append a line to this specific barplot code:
        // https://stackoverflow.com/questions/66381031/adding-a-horizontal-line-to-a-d3-js-barplot-function
        // added if conditional statement to make sure floating line not added to plots with max < 90
        
        if ((d3.max(data) >= 90)) {
            var line = g.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", function(){ return y(90)})
            .attr("y2", function(){ return y(90)})
            .attr("stroke-width", 2)
            .attr("stroke", "red");
        } else {};


        return div.node();
          
      }

// Add layers to the map and control when/how the user makes them appear

    // pass pointToCircle function to modify point appearance
    // add rain gauges to chart
    // bind D3 barplot popup to points (same reference as function above):
        // http://bl.ocks.org/Andrew-Reid/11602fac1ea66c2a6d7f78067b2deddb
    var rainPoints = L.geoJSON(cleanStations, {
        pointToLayer: pointToCircle})
        .bindPopup(chart);


    // Create layer on/off function using layer control
    // Layer control is a built in function in Leaflet which lets users add multiple overlay maps (or toggle between base layers - not utilized here)
        // Documentation: https://leafletjs.com/examples/layers-control/

    // Create overlayMaps variable - this will include all the layers that can be turned on and off in the "layers" panel (simultaneously)
    var overlayMaps = {
        "Kohala Moku Boundary": mokuBound,
        "Rainfall Isohyets": isohyets,
        "Field Systems": fSyst,
        "Geology": geology,
        "Rain Gauges": rainPoints,
        "Sweet Potato Sufficient Areas": uala,
        "Sufficient Annual Temperature": uala18
        // "Slope Suitability": slopes
    };

    // Add layer control to map (null is in place of a "baseMaps" layer which includes layers that can only be displayed one at a time, like tiles)
    L.control.layers(null, overlayMaps).addTo(map);

    // This function is tied to a bootstrap button on index page - this turns the mouseover tooltips on and off
    // Button is green when tooltips are on, red when they're off (needs to be removed from conditional to work)
    // Thanks to this StackExchange post! https://stackoverflow.com/questions/39149977/how-to-toggle-between-bootstrap-button-classes-onclick/39150158
    $("#togFS").click(function() {
        $(this).toggleClass('btn-success btn-danger');
        if(map.hasLayer(archTooltips)) {
            map.removeLayer(archTooltips);
        } else {
            map.addLayer(archTooltips);

        }
    });

    // The mouseover tooltips are added by default, turns on and off using function above
    archTooltips.addTo(map);

    // Add default scale to map
    L.control.scale().addTo(map);

    
// Functions for adding/removing legendss
    // The sweet potato rainfall legend is controlled by a button to the right which users can toggle if the layer has been added to the map

    // Hide bootstrap legend button until uala layer is added
    // Removes button when layer is removed
    $("#togPotato").hide();
    map.on("overlayadd", function(x) {
        if (x.name === 'Sweet Potato Sufficient Areas') {
            $("#togPotato").show()
        }});
    map.on("overlayremove", function(x) {
        if (x.name === 'Sweet Potato Sufficient Areas') {
            $("#togPotato").hide();
            $('.legend').hide();
        }
    });
    
    // Ties show/hide legend function to bootstrap button
        // Reference: https://gis.stackexchange.com/questions/232776/show-hide-button-for-leaflet-legend
    showLegend = false;
    $("#togPotato").click(function() {
        $(this).toggleClass('btn-danger btn-success');
        if (showLegend === false) {
            ualaLegend.addTo(map);
            showLegend = true;
        }
        else {
            $('.legend').hide();
            showLegend = false;
        }
    });

// Add Print/export Button to map

    // Adds button to map to allow download of .png map image
    // Uses Leaflet easyPrint plugin, source: https://github.com/rowanwins/leaflet-easyPrint
    // Code via example in index.html file: https://github.com/rowanwins/leaflet-easyPrint

    var printer = L.easyPrint({
        tileLayer: Esri_WorldImagery,
        sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
        filename: 'LeewardKohala',
        exportOnly: true,
        hideControlContainer: true
    }).addTo(map);

    function manualPrint () {
        printer.printMap('CurrentSize', 'MyManualPrint')
    }

// Intersection Functions

// Turf.js allows you to perform intersections between two polygons
// Set style for final layers

var styleModels = {
    "fillOpacity": .5,
    "weight": 1,
    "opacity": .5,
    "color": "green"
}

var buttonList = ["#pololu1", "#pololu2", "#hawi1", "#hawi2", "#rain1", "#rain2", "#temp1", "#temp2"]

// On click of item in dropdown list, assign features from that geoJSON to a variable
// Hide item in second list (and vice versa)

$("#pololu1").click(function () {
    f1 = pololu.features;
    $("#pololu2").hide()
})

$("#pololu2").click(function () {
    f2 = pololu.features;
    $("#pololu1").hide()
})

$("#hawi1").click(function () {
    f1 = hawi.features;
    $("#hawi2").hide()
})

$("#hawi2").click(function () {
    f2 = hawi.features;
    $("#hawi1").hide()
})

$("#rain1").click(function () {
    f1 = suitUala.features;
    $("#rain2").hide()
})

$("#rain2").click(function () {
    f2 = suitUala.features;
    $("#rain1").hide()
})

$("#temp1").click(function () {
    f1 = temp18.features;
    $("#temp2").hide()
})

$("#temp2").click(function () {
    f2 = temp18.features;
    $("#temp1").hide()
})

// This code based on https://gis.stackexchange.com/questions/129750/intersecting-featurecollections-in-turf-js iterates between each polygon between two feature classes
// Based on the variables set in the clicks above

$("#runIntersect").click(function () {
    conflictlist = [];
    // Based on the f1 and f2 variables defined by click above
    // Iterate through the polygons in each geoJSON file and perform and intersection
    for (var i = 0; i < f1.length; i++) {
        var parcel1 = f1[i];
        for (var j = 0; j < f2.length; j++) {
            var parcel2 = f2[j];
            console.log("Procesing",i,j);
                var conflict = turf.intersect(parcel1, parcel2);
                if (conflict != null) {
                    conflictlist.push(conflict);
                }
        }
    }
    // Add all intersected polygons to feature collection
    var intersection = turf.featureCollection(conflictlist);
    // interpret feature collection using leaflet, style using above
    var modelIntersect = L.geoJSON(intersection, {
        style: styleModels
    });
    // add intersected layer to map
    modelIntersect.addTo(map);
    // once the runIntersect button has been clicked, the clear button can be clicked
    $("#clearIntersect").click(function () {
        // removes added layer
        map.removeLayer(modelIntersect);
        // iterate through each button and show all buttons (because some would have been hidden in the previous clicks)
        for (var i = 0; i < buttonList.length; i++) {
            console.log(buttonList[i]);
            $(buttonList[i]).show();
        }
    });
});

}
