function createStNewSecurityVulnerabilitiesBubbleChart(elementId, dataSource) {
    $("#" + elementId).empty();
    $("#" + elementId).removeData();
    $("#" + elementId).dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            type: 'bubble'
        },
        tooltip: {
            enabled: true,
            location: "edge",
            customizeTooltip: function (arg) {
                if (arg.value > 0) {
                    return {
                        text: 'Newly Published Security Vulnerabilities: ' + arg.valueText +
                            '<br/>' + arg.point.tag +
                            '<br/>------------------------------' +
                            '<br/>Vulnerable Libraries Affected: ' + arg.size
                    };
                } else {
                    return {
                        text: 'No Newly Published Security Vulnerabilities'
                    };
                }
            }
        },
        argumentAxis: {
            valueMarginsEnabled: false
        },
        valueAxis: {
            title: {
                text: "Vulnerabilities"
            },
            allowDecimals: false
        },
        legend: {
            visible: false
        },
        series: [{
            name: 'CVE',
            argumentField: 'argument', // dates
            valueField: 'val', // new cves
            sizeField: 'libraryOccurrences',
            tagField: 'tag', // top 5 cves
            opacity: 1,
            color: "#5B9BD5"
        }],
        customizePoint: function (point) {
            const value = point.value;
            if (value > 0) {
                if (point.data.severity === "high") {
                    return {
                        color: "#D1260F"
                    }
                } else if (point.data.severity === "medium") {
                    return {
                        color: "#F6A21A"
                    }
                } else if (point.data.severity === "low") {
                    return {
                        color: "#FFE100"
                    }
                }
            } else {
                return {
                    color: "#E1E1E1",
                    opacity: 1
                }
            }
        }
    });
}