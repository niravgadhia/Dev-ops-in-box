function createRequestRespondTimeBarChart(elementId, dataSource) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: "argument",
            type: "bar",
            hoverMode: "allSeriesPoints",
            label: {
                visible: true,
                format: "fixedPoint",
                precision: 0
            }
        },
        series: [
            { valueField: "myOrg", name: "My Organization" }
        ],
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        }
    });
}