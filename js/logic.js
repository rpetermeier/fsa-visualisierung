var ViewModel = function() {

	this.fsa = null;
	this.stations = [];
	this.lines = [];

	this.init = function() {
		this.draw();
		this.initButtons();
		this.initCreateStationDialog();
		this.initCreateLineDialog();
	};

	this.draw = function() {
		d3.json("json/fsa.json", function(fsaDataJson) {
			vm.fsa = fsaDataJson;
			d3.json("json/map.json", function(mapDataJson) {
				vm.drawMap(mapDataJson);
				vm.drawFlag(mapDataJson);
			});
			d3.json("json/stations-and-lines.json", function(stationAndLineDataJson) {
				vm.stations = stationAndLineDataJson.stations;
				vm.lines = stationAndLineDataJson.lines;
				vm.initCreateFsaDialog(stationAndLineDataJson.stations, stationAndLineDataJson.lines);
				vm.drawLines(stationAndLineDataJson.lines);
				vm.drawStations(stationAndLineDataJson.stations);
			});
		});
	};

	this.drawMap = function(mapDataJson) {
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
	};

	this.drawFlag = function(mapDataJson) {
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
			.style("fill", function(d) { return d.color; });
			// .append("svg:title");
			// .text(function(d) { return d.text; });
		$('svg rect.flag').tipsy({
			gravity: 'w', 
			html: true, 
			title: function() {
				var d = this.__data__;
				return d.text;
			}
		});
	};

	this.drawStations = function(stations) {
		var svgContainer = d3.select("#map");
		var stationSymbols = svgContainer.selectAll("circle.station")
								.data(stations)
								.enter()
								.append("circle");
		stationSymbols.attr("cx", function(d) { return d.x })
			.attr("cy", function(d) { return d.y; })
			.attr("r", function(d) { return 5; })
			.attr("class", "station");
		stationSymbols.style("fill", this.colorForStation);

		$('svg circle.station').tipsy({
			gravity: 'w', 
			html: true, 
			title: function() {
				var d = this.__data__;
				var tooltip = 'Station: <span class="tipsy-station-name">' + d.name + '</span>';
				var relevantFsa = vm.findFsaForStation(d.id);
				if (relevantFsa.length > 0) {
					tooltip += vm.formatFsaInfo(relevantFsa);
				}
				return tooltip;
			}
		});
	};

	this.formatFsaInfo = function(relevantFsa) {
		var info = "";
		info += '<div class="tipsy-fsa-info">';
		info += 'Freigeschaltet durch:<ul class="tipsy-fsa-details">';
		for (var ii = 0; ii < relevantFsa.length; ++ii) {
			info += ("<li>" + relevantFsa[ii].fsaId + " (" + relevantFsa[ii].fsaName + ")<br />");
			info += relevantFsa[ii].from + " - " + relevantFsa[ii].until + "<br />";
			info += relevantFsa[ii].weekdayProfile + "<br />";
			info += relevantFsa[ii].timeWindow + "<br />";
			info += relevantFsa[ii].dailyOrContinuous;
			info += "</li>";
		}
		info += "</ul></div>";
		return info;
	};

	this.drawLines = function(lines) {
		var svgContainer = d3.select("#map");
		var lineSymbols = svgContainer.selectAll("line.line")
								.data(lines)
								.enter()
								.append("line");
		lineSymbols.attr("x1", function(d) { return vm.lookupStation(d.station1).x; })
			.attr("y1", function(d) { return vm.lookupStation(d.station1).y; })
			.attr("x2", function(d) { return vm.lookupStation(d.station2).x; })
			.attr("y2", function(d) { return vm.lookupStation(d.station2).y; })
			.attr("stroke-width", 2)
			.attr("stroke", this.colorForLine)
			.attr("class", "line");
			// .append("svg:title")
			// .text(function(d) { return d.name; });
			$('svg line.line').tipsy({
			gravity: 'w', 
			html: true, 
			title: function() {
				var d = this.__data__;
				var tooltip = 'Leitung: <span class="tipsy-line-name">' + d.name + '</span>';
				var relevantFsa = vm.findFsaForLine(d.id);
				if (relevantFsa.length > 0) {
					tooltip += vm.formatFsaInfo(relevantFsa);
				}
				return tooltip;
			}
		});
	};

	this.colorForStation = function (station) {
		var returnColor;
		if (vm.isStationDisconnected(station.id)) { returnColor = "Silver"; }
		else { returnColor = "SeaGreen"; }
		return returnColor;
	};

	this.lookupStation = function(stationId) {
		var station = null;
		for (var ii = 0; ii < this.stations.length; ++ii) {
			if (this.stations[ii] != null && this.stations[ii].id  == stationId) {
				station = this.stations[ii];
			}
		}
		return station;
	};

	this.lookupLine = function(lineId) {
		var line = null;
		for (var ii = 0; ii < this.lines.length; ++ii) {
			if (this.lines[ii] != null && this.lines[ii].id  == lineId) {
				line = this.lines[ii];
			}
		}
		return line;
	};

	this.isLineDisconnected = function(lineId) {
		return this.findFsaForLine(lineId).length > 0;
	};

	this.isStationDisconnected = function(stationId) {
		return this.findFsaForStation(stationId).length > 0;
	};

	this.colorForLine = function(line) {
		var returnColor;
		if (vm.isLineDisconnected(line.id)) { returnColor = "Silver"; }
		else { returnColor = "SeaGreen"; }
		return returnColor;
	};

	this.findFsaForStation = function(stationId) {
		var result = new Array();
		for (var ii = 0; ii < this.fsa.fsa.length; ++ii) {
			if ($.inArray(stationId, this.fsa.fsa[ii].stations) != -1) {
				result.push(this.fsa.fsa[ii]);
			}
		}
		return result;
	};

	 this.findFsaForLine = function(lineId) {
		var result = new Array();
		for (var ii = 0; ii < this.fsa.fsa.length; ++ii) {
			if ($.inArray(lineId, this.fsa.fsa[ii].lines) != -1) {
				result.push(this.fsa.fsa[ii]);
			}

		}
		return result;
	};

	this.initCreateStationDialog = function() {
		$("#create-station-form").dialog({
			autoOpen: false,
			height: 320,
			width: 450,
			modal: true,
			buttons: {
				"Speichern": function() {
					var name = $.trim($("#create-station-name").val());
					var error = name.length == 0;
					if (!error) {
						try {
							var x = parseInt($("#create-station-x").val());
							var y = parseInt($("#create-station-y").val());
							var newStation = new Station(vm.stations[vm.stations.length - 1].id + 1, name, x, y);
							vm.stations.push(newStation);
							vm.drawStations(vm.stations);
							vm.reinitMultiselects(vm.stations, vm.lines);
							$(this).dialog("close");
						} catch (exc) {
							error = true;
						}
					}
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function() {
			}
		});
	};
	
	this.initCreateLineDialog = function() {
		$("#create-line-form").dialog({
			autoOpen: false,
			height: 330,
			width: 540,
			modal: true,
			buttons: {
				"Speichern": function() {
					var name = $.trim($("#create-line-name").val());
					var error = name.length == 0;
					if (!error) {
						try {
							var numeric = vm.convertStationIds([$("#create-line-station1").val(), $("#create-line-station2").val()]);
							var stationId1 = numeric[0];
							var stationId2 = numeric[1];
							var newLine = new Line(vm.lines[vm.lines.length - 1].id + 1, name, stationId1, stationId2);
							vm.lines.push(newLine);
							vm.drawLines(vm.lines);
							vm.reinitMultiselects(vm.stations, vm.lines);
							$(this).dialog("close");
						} catch (exc) {
							error = true;
						}
					}
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function() {
			}
		});
	};

	this.initCreateFsaDialog = function(stations, lines) {
		var timeWindowFrom = $("#create-fsa-time-window-from");
		var timeWindowUntil = $("#create-fsa-time-window-until");
		for (var ii = 0; ii < 24; ++ii) {
			var val = ii < 10 ? "0" + ii : "" + ii;
			timeWindowFrom.append('<option value="' + val + '">' + val + '</option>');
			timeWindowUntil.append('<option value="' + val + '">' + val + '</option>');
		}
		timeWindowFrom.val("07");
		timeWindowUntil.val("17");

		$("#create-fsa-from").datepicker({ dateFormat: "dd.mm.yy" });
		$("#create-fsa-until").datepicker({ dateFormat: "dd.mm.yy" });
		
		this.reinitMultiselects(stations, lines);
		
		$("#create-fsa-form").dialog({
			autoOpen: false,
			height: 620,
			width: 550,
			modal: true,
			buttons: {
				"Speichern": function() {
					vm.addFsa();
					$(this).dialog("close");
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function() {
				// allFields.val("").removeClass( "ui-state-error" );
			}
		});
	};

	this.reinitMultiselects = function(stations, lines) {
		var stationsSorted = stations.slice();
		stationsSorted.sort(function(a, b) {
			return a.name.localeCompare(b.name);
			// return a < b;
		});
		var linesSorted = lines.slice();
		linesSorted.sort(function(a, b) {
			return a.name.localeCompare(b.name);
		});
		var selectStations1 = $("#create-fsa-stations");
		var selectStations2 = $("#create-line-station1");
		var selectStations3 = $("#create-line-station2");
		selectStations1.empty();
		selectStations2.empty();
		selectStations3.empty();
		for (var ii = 0; ii < stationsSorted.length; ++ii) {
			selectStations1.append('<option value="' + stationsSorted[ii].id + '">' + stationsSorted[ii].name + '</option>');
			selectStations2.append('<option value="' + stationsSorted[ii].id + '">' + stationsSorted[ii].name + '</option>');
			selectStations3.append('<option value="' + stationsSorted[ii].id + '">' + stationsSorted[ii].name + '</option>');
		}
		selectStations1.multiselect({
			checkAllText: "alle",
			uncheckAllText: "keine",
			selectedText: "# ausgewählt",
			noneSelectedText: "Station(en) auswählen...",
			minWidth: 300
		});
		selectStations2.multiselect({
			checkAllText: "alle",
			uncheckAllText: "keine",
			selectedText: function(numChecked, numTotal, checked) {
				if (checked != null && checked.length == 1) {
					return $(checked[0]).next().text();
				} else {
					return "";
				}
			},
			noneSelectedText: "Station auswählen...",
			multiple: false,
			minWidth: 300
		});
		selectStations3.multiselect({
			checkAllText: "alle",
			uncheckAllText: "keine",
			selectedText: function(numChecked, numTotal, checked) {
				if (checked != null && checked.length == 1) {
					return $(checked[0]).next().text();
				} else {
					return "";
				}
			},
			noneSelectedText: "Gegenstation auswählen...",
			multiple: false,
			minWidth: 300
		});
		// This has to be called to update the list of stations after a new station has been added
		$("#create-fsa-stations").multiselect("refresh");
		$("#create-line-station1").multiselect("refresh");
		$("#create-line-station2").multiselect("refresh");
		
		var selectLines = $("#create-fsa-lines");
		selectLines.empty();
		for (var ii = 0; ii < linesSorted.length; ++ii) {
			selectLines.append('<option value="' + linesSorted[ii].id + '">' + linesSorted[ii].name + '</option>');
		}
		selectLines.multiselect({
			checkAllText: "alle",
			uncheckAllText: "keine",
			selectedText: "# ausgewählt",
			noneSelectedText: "Leitung(en) auswählen...",
			minWidth: 300
		});
		// This has to be called to update the list of lines after a new line has been added
		$("#create-fsa-lines").multiselect("refresh");
	};

	this.initButtons = function() {
		$("#button-create-fsa")
			.button()
			.click(function() {
				$("#create-fsa-form").dialog("open");
			}
		);
		$("#button-create-station")
			.button()
			.click(function() {
				$("#create-station-form").dialog("open");
			}
		);
		$("#button-create-line")
			.button()
			.click(function() {
				$("#create-line-form").dialog("open");
			}
		);
		$("#button-zhongguo")
			.button()
			.click(function() {
				vm.zhongguo();
				$(this).remove();
			}
		);
	};

	this.addFsa = function() {
		var newFsa = new Fsa();
		newFsa.fsaName = $("#create-fsa-fsa-name").val();
		newFsa.from = $("#create-fsa-from").val();
		newFsa.until = $("#create-fsa-until").val();
		newFsa.setWeekdayProfile($('#create-fsa-weekday-profile-mo-fr').is(':checked'),
			$('#create-fsa-weekday-profile-sa').is(':checked'),
			$('#create-fsa-weekday-profile-so').is(':checked'));
		newFsa.dailyOrContinuous = $("#create-fsa-daily-continuous").val();
		newFsa.timeWindow = $("#create-fsa-time-window-from").val() + "-" + $("#create-fsa-time-window-until").val();
		
		if (this.fsa.fsa.length > 0) {
			var nextId = this.fsa.fsa[this.fsa.fsa.length - 1].id + 1;
		} else {
			var nextId = 1;
		}
		newFsa.id = nextId;
		if (nextId >= 1000) {
			newFsa.fsaId = "13-" + nextId;
		} else if (nextId >= 100) {
			newFsa.fsaId = "13-0" + nextId;
		} else if (nextId >= 10) {
			newFsa.fsaId = "13-00" + nextId;
		} else {
			newFsa.fsaId = "13-000" + nextId;
		}
		newFsa.stations = this.convertStationIds($("#create-fsa-stations").val());
		newFsa.lines = this.convertLineIds($("#create-fsa-lines").val());
		
		this.fsa.fsa.push(newFsa);
		
		// Update graph...
		for (var ii = 0; ii < newFsa.stations.length; ++ii) {
			var station = this.lookupStation(newFsa.stations[ii]);
			var sel = d3.selectAll("circle.station").filter(function(d, i) {
				if (station.id == d.id) {
					return this;
				} else {
					return null;
				}
			});
			sel.transition().duration(1000).delay(0).style("fill", this.colorForStation);
		}
		for (var ii = 0; ii < newFsa.lines.length; ++ii) {
			var line = this.lookupLine(newFsa.lines[ii]);
			var sel = d3.selectAll("line.line").filter(function(d, i) {
				if (line.id == d.id) {
					return this;
				} else {
					return null;
				}
			});
			sel.transition().duration(1000).delay(0).attr("stroke", this.colorForLine);
		}
	};

	this.convertStationIds = function(stationIds) {
		var selectedStations = new Array();
		if (stationIds != null) {
			for (var ii = 0; ii < stationIds.length; ++ii) {
				var stationId = parseInt(stationIds[ii]);
				selectedStations.push(stationId);
			}
		}
		return selectedStations;
	};

	this.convertLineIds = function(lineIds) {
		var selectedLines = new Array();
		if (lineIds != null) {
			for (var ii = 0; ii < lineIds.length; ++ii) {
				var lineId = parseInt(lineIds[ii]);
				selectedLines.push(lineId);
			}
		}
		return selectedLines;
	};
	
	this.zhongguo = function() {
		d3.json("json/chinese-cities-formatted.json", function(chineseCitiesJson) {
			// alert("中国!");
			var numStations = 30 + Math.floor(Math.random() * 10);
			var selected = new Array();
			for (var ii = 0; ii < numStations; ++ii) {
				var index = Math.floor(Math.random() * chineseCitiesJson.length);
				if ($.inArray(index, selected) == -1) {
					selected.push(index);
					var x = 100 + Math.floor(Math.random() * 250);
					var y = 100 + Math.floor(Math.random() * 600);
					vm.stations.push(
						new Station(vm.stations[vm.stations.length - 1].id + 1, 
							chineseCitiesJson[index].name_european + " (" + chineseCitiesJson[index].name_simplified + ")", 
							x, 
							y));
				}
			}
			vm.drawStations(vm.stations);
			var numLines = 50 + Math.floor(Math.random() * 10);
			var pairs = new Array();
			for (var ii = 0; ii < numLines; ++ii) {
				var index1 = Math.floor(Math.random() * vm.stations.length);
				var index2 = Math.floor(Math.random() * vm.stations.length);
				if (index1 != index2) {
					var dupe = false;
					for (var jj = 0; jj < pairs.length; ++jj) {
						if (pairs[jj][0] == index1 && pairs[jj][1] == index2
							|| pairs[jj][0] == index2 && pairs[jj][1] == index1) {
							dupe = true;
						}
					}
					if (!dupe) {
						pairs.push([ index1, index2 ]);
						vm.lines.push(new Line(vm.lines[vm.lines.length - 1].id + 1, vm.stations[index1].name + " --- " + vm.stations[index2].name, vm.stations[index1].id, vm.stations[index2].id));
					}
				}
			}
			vm.drawLines(vm.lines);
			vm.reinitMultiselects(vm.stations, vm.lines);
		});
	};
}

var vm = new ViewModel();

function init() {
	vm.init();
}

function Fsa(id, stations, lines, fsaId, fsaName, from, until, weekdayProfile, timeWindow, dailyOrContinuous) {
	this.id = id;
	this.stations = stations;
	this.lines = lines;
	this.fsaId = fsaId;
	this.fsaName = fsaName;
	this.from = from;
	this.until = until;
	this.weekdayProfile = weekdayProfile;
	this.timeWindow = timeWindow;
	this.dailyOrContinuous = dailyOrContinuous;
}

Fsa.prototype.setWeekdayProfile = function(moFr, sa, so) {
	if (moFr && sa && so) {
		this.weekdayProfile = "MDMDFSS";
	} else if (moFr && sa && !so) {
		this.weekdayProfile = "MDMDFS-";
	} else if (moFr && !sa && so) {
		this.weekdayProfile = "MDMDF-S";
	} else if (!moFr && sa && so) {
		this.weekdayProfile = "-----SS";
	} else if (moFr && !sa && !so) {
		this.weekdayProfile = "MDMDF--";
	} else if (!moFr && sa && !so) {
		this.weekdayProfile = "-----S-";
	} else if (!moFr && !sa && so) {
		this.weekdayProfile = "------S";
	} else {
		this.weekdayProfile = "MDMDF--";
	}
}

function Station(id, name, x, y) {
	this.id = id;
	this.name = name;
	this.x = x;
	this.y = y;
}

function Line(id, name, station1, station2) {
	this.id = id;
	this.name = name;
	this.station1 = station1;
	this.station2 = station2;
}
