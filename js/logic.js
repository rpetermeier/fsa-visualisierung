function init() {
	draw();
}

function draw() {
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
	alert(line);
}