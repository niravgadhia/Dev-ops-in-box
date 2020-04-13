function createBugStatisticsBarChart(elementId, dataSource) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: "argument",
            type: "bar",
            label: {
                visible: true,
                format: "fixedPoint",
                precision: 0
            },
            tooltip: {
                enabled: false
            }
        },
        series: [
            { valueField: "open", name: "Open", color: "#D1260F" },
            { valueField: "closed", name: "Closed", color: "#76A321" }
        ],
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        },
        customizeLabel: function(point) {
            if (point.value === 0) {
                return { visible: false }
            } else {
                return { visible: true }
            }
        }
    });
}