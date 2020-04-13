function createLicensePieChart(elementId, dataSource, legendRowCount, withLegend, chartWidth) {
    // risk colors
    var highColors = [ "#D1260F", "#EA2A10", "#F03B24", "#F1513B" ];
    var medColors = [ "#F6A21A", "#F6AB31", "#F7B54A", "#F8BF63" ];
    var lowColors = [ "#76A321", "#83B625", "#93CB2A", "#9FD638" ];
    // var unknownRiskColors = [ "#919496", "#ADB0B2", "#BCBFC1", "#CBCDCF" ]
    var unknownRiskColors = [ "#98A7A9", "#A6B3B5", "#B4BFC0", "#C2CBCC" ];
    var highIndex = 0;
    var medIndex = 0;
    var lowIndex = 0;
    var unknownRiskIndex = 0;

    var otherColor = "#3AAA90";
    var unknownLicenseColor = "#D0CBA9";

    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxPieChart({
        size: {
            width: chartWidth
        },
        dataSource: dataSource,
        tooltip: {
            enabled: true,
            percentPrecision: 2,
            customizeTooltip: function(arg) {
                return {
                    text: "<b>" + arg.argumentText + "</b>: " + arg.valueText + " (" + arg.percentText + ")"
                };
            }
        },
        legend: {
            visible: withLegend,
            horizontalAlignment: "right",
            verticalAlignment: "top",
            rowItemSpacing: 5,
            rowCount: legendRowCount,
            columnCount: Math.floor(dataSource.length / legendRowCount),
            margin: 0,
            customizeText: function(arg) {
                var licenseName = arg.pointName;
                if (licenseName.length > 20) {
                    licenseName = licenseName.substring(0, 20) + "..";
                }
                return licenseName;
            }
        },
        series: [{
            type: "doughnut",
            argumentField: "argument",
            label: {
                visible: false
            }
        }],
        customizePoint: function (point) {
            var tag = point.tag;
            if (tag == null) {
                return {
                    color: unknownLicenseColor
                }
            } else if (tag === "high") {
                return {
                    color: highColors[highIndex++ % 4]
                }
            } else if (tag === "med") {
                return {
                    color: medColors[medIndex++ % 4]
                }
            } else if (tag === "low") {
                return {
                    color: lowColors[lowIndex++ % 4]
                }
            } else if (tag === "unknown") {
                return {
                    color: unknownRiskColors[unknownRiskIndex++ % 4]
                }
            } else if (tag === "others") {
                return {
                    color: otherColor
                }
            }
        },
        onPointClick: function (clickedPoint) {
            window.top.onPieSliceClick(clickedPoint.target.argument);
        },
        onLegendClick: function (clickedPoint) {
            window.top.onPieSliceClick(clickedPoint.target);
        }
    });
}