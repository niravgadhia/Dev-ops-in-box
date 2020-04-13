function createScmStatisticsLineChart(elementId, dataSource, selectedArg, selectedColor, selectedFontColor) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: "argument",
            type: "line",
            label: {
                visible: true,
                format: "fixedPoint",
                precision: 0
            }
        },
        commonAxisSettings: {
            minValueMargin: 100000
        },
        tooltip: {
            enabled: true,
            font: { size: 16, color: "white" },
            customizeText: function() {
                var tag = this.point.tag;
                if (tag) {
                    return tag + ": " + this.valueText;
                } else {
                    return this.valueText;
                }
            }
        },
        argumentAxis: {
            type: "discrete",
            grid: {
                visible: true
            },
            discreteAxisDivisionMode: 'crossLabels'
        },
        series: [
            { valueField: "val", name: "Commits" }
        ],
        legend: {
            visible: false
        },
        customizePoint: function (point) {
            var arg = point.argument;
            if (selectedArg != null && selectedArg === arg) {
                return {
                    color: selectedColor
                }
            }
        },
        customizeLabel: function (point) {
            var arg = point.argument;
            if (selectedArg != null && selectedArg === arg) {
                return {
                    backgroundColor: selectedColor,
                    font: { color: selectedFontColor }
                }
            }
        }
    });
}