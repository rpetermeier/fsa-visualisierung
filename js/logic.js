var stations;
var lines;

function init() {
	draw();
}

function draw() {
	d3.json("json/map.json", function(mapDataJson) {
		drawMap(mapDataJson);
		drawFlag(mapDataJson);
	});
	d3.json("json/stations-and-lines.json", function(stationAndLineDataJson) {
		stations = stationAndLineDataJson.stations;
		lines = stationAndLineDataJson.lines;
		drawStations(stationAndLineDataJson);
		drawLines(stationAndLineDataJson);
	});
}

function drawMap(mapDataJson) {
	var svgContainer = d3.select("#map");
	var borders = svgContainer.selectAll("line.border")
							.data(mapDataJson.borders)
							.enter()
							.append("line");
	borders.attr("x1", function(d) { return d.x1 })
		.attr("y1", function(d) { return d.y1; })
		.attr("x2", function(d) { return d.x2; })
		.attr("y2", function(d) { return d.y2; })
		.attr("stroke-width", 2)
		.attr("stroke", "black")
		.attr("class", "border");
}

function drawFlag(mapDataJson) {
	var svgContainer = d3.select("#map");
	var flag = svgContainer.selectAll("rect.flag")
							.data(mapDataJson.flag)
							.enter()
							.append("rect");
	flag.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.attr("class", "flag")
		.style("fill", function(d) { return d.color; })
		.append("svg:title")
		.text(function(d) { return d.text; });;
}

function drawStations(stationAndLineDataJson) {
	var svgContainer = d3.select("#map");
	var stations = svgContainer.selectAll("circle")
							.data(stationAndLineDataJson.stations)
							.enter()
							.append("circle");
	stations.attr("cx", function(d) { return d.x })
		.attr("cy", function(d) { return d.y; })
		.attr("r", function(d) { return 5; })
		.attr("class", "station")
		.style("fill", function(d) {
                       var returnColor;
                       if (d.disconnected) { returnColor = "grey"; }
                       else { returnColor = "magenta"; }
                       return returnColor;
                     })
		.append("svg:title")
		.text(function(d) { return d.name; });
}

function drawLines(stationAndLineDataJson) {
	// TODO...
	var svgContainer = d3.select("#map");
	var lines = svgContainer.selectAll("line.line")
							.data(stationAndLineDataJson.lines)
							.enter()
							.append("line");
	lines.attr("x1", function(d) { return lookupStation(d.station1).x; })
		.attr("y1", function(d) { return lookupStation(d.station1).y; })
		.attr("x2", function(d) { return lookupStation(d.station2).x; })
		.attr("y2", function(d) { return lookupStation(d.station2).y; })
		.attr("stroke-width", 2)
		.attr("stroke", function(d) {
						var returnColor;
						if (d.disconnected) { returnColor = "grey"; }
						else { returnColor = "magenta"; }
						return returnColor;
					})
		.attr("class", "line")
		.append("svg:title")
		.text(function(d) { return d.name; });
}

function lookupStation(stationId) {
	var station = null;
	for (var ii = 0; ii < stations.length; ++ii) {
		if (stations[ii] != null && stations[ii].id  == stationId) {
			station = stations[ii];
		}
	}
	
	return station;
}

function drawStatic() {
	// var svgContainer = d3.select("body").append("svg")
    //                                .attr("width", 900)
    //                               .attr("height", 800);
	var svgContainer = d3.select("#map");

	var line = svgContainer.append("line")
                        .attr("x1", 50)
                        .attr("y1", 50)
                        .attr("x2", 25)
                        .attr("y2", 10)
						.attr("stroke-width", 2)
                        .attr("stroke", "black");
}