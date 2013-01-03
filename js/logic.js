function init() {
	draw();
}

function draw() {
	d3.json("json/map.json", function(json) {
		drawMap(json);
	});
}

function drawMap(mapDataJson) {
	var svgContainer = d3.select("#map");
	var borders = svgContainer.selectAll("line")
							.data(mapDataJson.lines)
							.enter()
							.append("line");
	borders.attr("x1", function(d) { return d.x1 })
		.attr("y1", function(d) { return d.y1; })
		.attr("x2", function(d) { return d.x2; })
		.attr("y2", function(d) { return d.y2; })
		.attr("stroke-width", 2)
		.attr("stroke", "black");

	alert(borders);
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