function createSecurityRiskOverTimeAreaChart(elementId, dataSource) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            type: "stackedsplinearea",
            argumentField: "argument"
        },
        commonPaneSettings: {
            border: {
                visible: false
            }
        },
        series: [
            { valueField: "low", name: "Low Severity", color: "#FFE100", opacity: 0.8 },
            { valueField: "medium", name: "Medium Severity", color: "#F6A21A", opacity: 0.8 },
            { valueField: "high", name: "High Severity", color: "#D1260F", opacity: 0.8 }
        ],
        argumentAxis: {
            valueMarginsEnabled: false
        },
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        },
        valueAxis: [
            {
                title: {
                    text: "Vulnerabilities"
                },
                allowDecimals: false,
                showZero: true
            }],
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
                var seriesName = arg.seriesName;
                if (seriesName === "High Severity") {
                    return {
                        text: arg.point.data.highTooltip
                    };
                } else if (seriesName === "Medium Severity") {
                    return {
                        text: arg.point.data.mediumTooltip
                    };
                } else if (seriesName === "Low Severity") {
                    return {
                        text: arg.point.data.lowTooltip
                    };
                }
            }
        }
    });
}