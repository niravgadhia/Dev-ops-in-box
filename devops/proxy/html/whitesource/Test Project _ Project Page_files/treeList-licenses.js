function createTreeListLicenses(elementId, dataSource, chartWidth, chartHeight) {
    $("#" + elementId).dxTreeList({
        dataSource: dataSource,
        itemsExpr: "items",
        dataStructure: "tree",
        showColumnLines: false,
        showRowLines: true,
        columnAutoWidth: true,
        width: chartWidth,
        height: chartHeight,
        autoExpandAll: true,
        loadPanel: {
            enabled: true
        },
        scrolling: {
            mode: "virtual"
        },
        columns: [{
            dataField: "Library_Name",
            caption: "Library Name",
            calculateSortValue: "Library_Name",
            sortOrder: "asc",
            // Setting LibraryName + Url
            cellTemplate: function (container, options) {
                if (options.displayValue) {
                    $('<a>' + options.value + '</a>')
                        .attr('href', options.displayValue)
                        .attr('style', "text-decoration: none; font-size: 11px;")
                        .appendTo(container);
                } else {
                    // no link
                    var data = options.data;
                    var module = data.module;
                    if (module) {
                        var title = "";
                        if (data.groupId) {
                            title += "groupId: " + data.groupId;
                        }
                        if (data.artifactId) {
                            if (title.length > 0) {
                                title += "\n";
                            }
                            title += "artifactId: " + data.artifactId;
                        }
                        if (data.version) {
                            if (title.length > 0) {
                                title += "\n";
                            }
                            title += "version: " + data.version;
                        }
                        $('<div class="bold-text" title="' + title + '">' + options.value + '</div>')
                            .appendTo(container);
                    } else {
                        $('<div>' + options.value + '</div>')
                            .appendTo(container);
                    }
                }
            },
            // Setting "displayValue" as a URL
            calculateDisplayValue: function (rowData) {
                return rowData.Url;
            }
        }, {
            dataField: "Licenses",
            caption: "Licenses"
        }]
    });
}