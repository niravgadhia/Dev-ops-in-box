function createRequestTrendLineChart(elementId, dataSource) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: "argument"
        },
        commonPaneSettings: {
            border: {
                visible: false
            }
        },
        commonAxisSettings: {
            grid: {
                visible: true
            }
        },
        series: [
            { valueField: "open", name: "Open" },
            { valueField: "close", name: "Closed" }
        ],
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        },
        tooltip:{
            enabled: true
        }
    });
}