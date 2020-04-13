function createIndustryBenchmarkChart(elementId, dataSource, max) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        rotated: true,
        commonSeriesSettings: {
            label: {
                visible: true,
                format: {
                    type: "fixedPoint",
                    precision: 2
                },
                backgroundColor: "none",
                font: {
                    color: "#252B35",
                    size: 12,
                    weight: 500
                }
            }
        },
        valueAxis: {
            max: max,
            label: {
                format: function (value) {
                    return value + '%';
                }
            }
        },
        series: {
            argumentField: "argument",
            valueField: "stats",
            type: "bar",
            color: '#C0C9CE'
        },
        legend: {
            visible: false
        },
        tooltip: {
            enabled: true,
            format: {
                type: "fixedPoint",
                precision: 2
            },
            customizeTooltip: function (arg) {
                var tooltip;
                var value = arg.value;
                if (value % 1 === 0) {
                    tooltip = value.toFixed(0) + "%";
                } else {
                    tooltip = value.toFixed(2) + "%";
                }

                var delta = arg.point.data.delta;
                if (delta && delta != 0) {
                    tooltip += " (";
                    if (delta > 0) {
                        tooltip += "+";
                    }
                    var fractionDigits = 2;
                    if (value % 1 === 0) {
                        fractionDigits = 0;
                    }
                    tooltip += delta.toFixed(fractionDigits) + "%)";
                }

                return {
                    text: tooltip
                }
            }
        },
        customizePoint: function (point) {
            if (point.argument != "Benchmark") {
                var pointColor = "#98A7A9";
                var delta = point.data.delta;
                if (delta > 0) {
                    pointColor = "#D1260F";
                } else if (delta < 0) {
                    pointColor = "#76A321";
                }
                return {
                    color: pointColor
                }
            }
        },
        customizeLabel: function () {
            return {
                customizeText: function (arg) {
                    var tooltip;
                    var value = arg.value;
                    if (value % 1 === 0) {
                        tooltip = value.toFixed(0) + "%";
                    } else {
                        tooltip = value.toFixed(2) + "%";
                    }

                    var delta = arg.point.data.delta;
                    if (delta && delta != 0) {
                        tooltip += " (";
                        if (delta > 0) {
                            tooltip += "+";
                        }
                        var fractionDigits = 2;
                        if (value % 1 === 0) {
                            fractionDigits = 0;
                        }
                        tooltip += delta.toFixed(fractionDigits) + "%)";
                    }

                    return tooltip;
                }
            }
        }
    });
}