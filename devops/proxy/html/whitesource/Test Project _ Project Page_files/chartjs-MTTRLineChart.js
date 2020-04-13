function createMTTRLineChart(elementId, dataSource) {
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
        argumentAxis: {
            valueMarginsEnabled: false
        },
        valueAxis: {
            title: {
                text: "Days"
            }
        },
        series: [
            { valueField: "openDays", name: "Open Issues", tagField: 'openAlerts', color: "#F53319" },
            { valueField: "closedDays", name: "Closed Issues", tagField: 'closedAlerts', color: "#5493F8" }
        ],
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        },
        tooltip:{
            enabled: true,
            percentPrecision: 2,
            customizeTooltip: function (arg) {
                var seriesName = arg.seriesName;
                if (seriesName === "Open Issues") {
                    var value = arg.value;
                    if (value > 0) {
                        var days = value.toFixed(2);
                        if (value % 1 === 0) {
                            days = value.toFixed(0);
                        }
                        return {
                            text: 'Average Handling Time (Open Issues): ' + days + ' Days' +
                                '<br/>Open Issues: ' + arg.point.tag
                        };
                    } else {
                        return {
                            text: "No Open Issues"
                        }
                    }
                } else {
                    var value = arg.value;
                    if (value > 0) {
                        var days = value.toFixed(2);
                        if (value % 1 === 0) {
                            days = value.toFixed(0);
                        }
                        return {
                            text: 'Average Handling Time (Closed Issues): ' + days + ' Days' +
                                '<br/>Issues Closed: ' + arg.point.tag
                        };
                    } else {
                        return {
                            text: "No Issues Closed"
                        }
                    }
                }
            }
        },
        customizePoint: function (point) {
            var pointColor = "#E1E1E1";
            var pointSize = 0;
            if (point.value > 0) {
                if (point.seriesName === "Open Issues") {
                    pointColor = "#F53319";
                    pointSize = point.data.openSize;
                } else {
                    pointColor = "#5493F8";
                    pointSize = point.data.closedSize;
                }
            }
            return {
                color: pointColor,
                size: pointSize
            }
        }
    });
}