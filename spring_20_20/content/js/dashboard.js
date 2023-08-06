/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DELETE /api/user/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/category"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/order/{order_id}/orderItem/{item_id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/user/{user_id}/addRate/{item_id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /api/user/{user_id}"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /api/item/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /api/category/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/item"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/user"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/user/{user_id}/order"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/category/{category_id}/item/{item_id}"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4401, 0, 0.0, 25.62758463985458, 1, 420, 7.0, 81.0, 148.0, 239.97999999999956, 183.95753218525329, 71.81546903736833, 41.53288799949841], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE /api/user/{id}", 400, 0, 0.0, 17.46999999999998, 4, 53, 16.0, 28.0, 33.0, 43.99000000000001, 311.7692907248636, 31.05514419329696, 65.45937256430243], "isController": false}, {"data": ["POST /api/category", 400, 0, 0.0, 4.300000000000004, 2, 28, 4.0, 6.0, 8.949999999999989, 19.99000000000001, 199.70044932601098, 60.456190713929104, 44.269533200199696], "isController": false}, {"data": ["POST /api/order/{order_id}/orderItem/{item_id}", 400, 0, 0.0, 15.222499999999993, 6, 86, 11.0, 28.800000000000068, 39.94999999999999, 60.97000000000003, 158.16528272044286, 87.57784697508897, 33.82636417556346], "isController": false}, {"data": ["POST /api/user/{user_id}/addRate/{item_id}", 400, 0, 0.0, 10.857499999999995, 4, 32, 10.0, 17.0, 20.0, 25.99000000000001, 346.0207612456747, 103.40073529411765, 81.77443771626298], "isController": false}, {"data": ["GET /api/user/{user_id}", 400, 0, 0.0, 5.757500000000005, 3, 18, 6.0, 7.0, 8.0, 13.0, 386.47342995169083, 521.8900966183576, 48.686594202898554], "isController": false}, {"data": ["DELETE /api/item/{id}", 400, 0, 0.0, 6.632499999999999, 4, 17, 6.0, 8.0, 9.0, 13.980000000000018, 378.7878787878788, 37.73082386363636, 79.53065814393939], "isController": false}, {"data": ["Debug Sampler", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 100.26041666666667, 0.0], "isController": false}, {"data": ["DELETE /api/category/{id}", 400, 0, 0.0, 1.5075000000000003, 1, 7, 1.0, 2.0, 2.0, 3.0, 405.26849037487335, 40.36854103343465, 86.67363221884499], "isController": false}, {"data": ["POST /api/item", 400, 0, 0.0, 5.3950000000000005, 2, 45, 4.0, 8.0, 13.949999999999989, 30.970000000000027, 186.65422305179655, 82.20806112925806, 64.70922771815214], "isController": false}, {"data": ["POST /api/user", 400, 0, 0.0, 115.205, 6, 420, 106.5, 200.90000000000003, 242.0, 377.98, 97.82342871117633, 38.00210931768158, 27.293118733186596], "isController": false}, {"data": ["POST /api/user/{user_id}/order", 400, 0, 0.0, 92.31750000000008, 4, 395, 70.0, 208.90000000000003, 241.0, 356.94000000000005, 116.04293588627793, 41.589606904554685, 27.424209457499273], "isController": false}, {"data": ["POST /api/category/{category_id}/item/{item_id}", 400, 0, 0.0, 7.294999999999999, 4, 19, 7.0, 9.0, 10.0, 16.0, 378.0718336483932, 114.45534026465027, 71.9961011342155], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4401, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
