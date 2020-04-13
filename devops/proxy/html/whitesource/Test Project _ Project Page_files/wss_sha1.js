// referenced from http://www.ke-cai.net/2010/07/generate-sha1-file-checksum-using-html5.html
var ZIP_PATH = "zip/";

function processFile(file) {
    // 1. Read pom file, extract gav coordinates
    // 2. Calculate sha-1
    gavCoordinatesFromPom(file, function (gavCoordinates) {
        var sha1Reader = new FileReader();
        sha1Reader.onloadend = function (event) {
            // reading finished, do sha1 calculation.
            var sha1 = sha1Stream(event.target.result);

            var gavCoordinatesString = null;
            if (gavCoordinates != null) {
                gavCoordinatesString = gavCoordinates[0] + ":" + gavCoordinates[1] + ":" + gavCoordinates[2];
            }
            window.top.fileDropSha1Callback(file.name, sha1, gavCoordinatesString);
        };
        sha1Reader.readAsBinaryString(file);
    });
}

function sha1Stream(input) {
    var blocksize = 512;
    var h = naked_sha1_head();
    for (var i = 0; i < input.length; i += blocksize) {
        var len = Math.min(blocksize, input.length - i);
        var block = input.substr(i, len);
        naked_sha1(rstr2binb(block), len * chrsz, h);
    }
    var result = binb2hex(naked_sha1_tail(h));
    return result;
}

function binb2hex(binarray)	{
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for(var i = 0; i < binarray.length * 4; i++) {
        str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
        hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
    }
    return str;
}

function gavCoordinatesFromPom(file, callback) {
    // if not jar file, don't unzip
    if (!endsWith(file.name, ".jar")) {
        callback(null);
        return;
    }

    zip.workerScriptsPath = ZIP_PATH;
    var pomList = new Array();
    var fileNameRegex = new RegExp(file.name.substr(0, file.name.lastIndexOf('-')));

    //read all zip files and directories
    zip.createReader(new zip.BlobReader(file), function (reader) {
        reader.getEntries(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                // traverse all files till finding pom.xml
                if (endsWith(entries[i].filename, "pom.xml")) {
                    pomList.push(entries[i]);
                }
            }

            var length = pomList.length;
            if (length == 0) {
                // no pom found, return null
                reader.close();
                callback(null);
            } else if (length == 1) {
                // only 1 pom file
                pomList[0].getData(new zip.TextWriter(), function (data) {
                    reader.close();
                    var gavCoordinates = parseXml(data);
                    callback(gavCoordinates);
                })
            } else if (length > 1) {
                // more than 1 pom, traverse all pom till matched file name to artifactID
                var foundGav = false;
                for (var j = 0; j < length; j++) {
                    pomList[j].getData(new zip.TextWriter(), function (data) {
                        var gavCoordinates = parseXml(data);
                        if (gavCoordinates[1].match(fileNameRegex) != null){
                            reader.close();
                            callback(gavCoordinates);
                            foundGav = true;
                        }
                    })
                }

                if (!foundGav) {
                    reader.close();
                    callback(null);
                }
            }
            reader.close();
        });
    }, function (error) {
        alert("Reading didn't work");
    });
}

function parseXml(data) {
    // create the xml jquery object from a string
    var xmlDoc = $.parseXML(data);
    var xml = $(xmlDoc);

    // select project and parent tags from xml
    var project = xml.find("project");
    var parent = xml.find("parent");

    // find gav coordinates within given tags
    return gavCoordinatesFind(project, parent);
}

function gavCoordinatesFind(projectTag, parentTag) {
    // an array that will have groupId, artifactId and version indexed respectively
    var gavCoordinates = new Array(3);

    projectTag.each(function () {
        // the highest level artifactID
        gavCoordinates[1] = projectTag.children("artifactId").text();

        // text of first level G&V tags (if exists)
        gavCoordinates[0] = projectTag.children("groupId").text();
        gavCoordinates[2] = projectTag.children("version").text();

        // check for G&V if exists if not extract them from the parent tag
        if (!gavCoordinates[0]) {
            gavCoordinates[0] = parentTag.children("groupId").text();
        }
        if (!gavCoordinates[2]) {
            gavCoordinates[2] = parentTag.children("version").text();
        }
    });
    return gavCoordinates;
}

function endsWith(filename, suffix) {
    return filename.indexOf(suffix, filename.length - suffix.length) !== -1;
}