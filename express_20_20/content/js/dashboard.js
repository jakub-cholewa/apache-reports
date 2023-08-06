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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9961372415360146, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DELETE /api/user/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/category"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/order/{order_id}/orderItem/{item_id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/user/{user_id}/addRate/{item_id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /api/user/{user_id}"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /api/item/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "DELETE /api/category/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/item"], "isController": false}, {"data": [0.9575, 500, 1500, "POST /api/user"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/user/{user_id}/order"], "isController": false}, {"data": [1.0, 500, 1500, "POST /api/category/{category_id}/item/{item_id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4401, 0, 0.0, 71.87139286525807, 2, 1009, 36.0, 181.0, 227.89999999999964, 441.97999999999956, 136.9918446118409, 53.04273116011953, 30.92924150221005], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE /api/user/{id}", 400, 0, 0.0, 3.9800000000000018, 2, 17, 4.0, 5.0, 6.0, 11.980000000000018, 391.7727717923604, 66.95335455435848, 82.25697845249756], "isController": false}, {"data": ["POST /api/category", 400, 0, 0.0, 10.372499999999997, 3, 82, 6.0, 21.900000000000034, 41.94999999999999, 61.97000000000003, 172.488141440276, 62.32481673134972, 38.23711729193618], "isController": false}, {"data": ["POST /api/order/{order_id}/orderItem/{item_id}", 400, 0, 0.0, 135.58000000000004, 10, 235, 149.5, 187.0, 193.0, 207.97000000000003, 105.04201680672269, 38.57011554621849, 22.465040703781515], "isController": false}, {"data": ["POST /api/user/{user_id}/addRate/{item_id}", 400, 0, 0.0, 99.99500000000002, 10, 227, 107.0, 134.80000000000007, 159.89999999999998, 204.99, 138.36042891732964, 53.506572120373576, 32.69846074022829], "isController": false}, {"data": ["GET /api/user/{user_id}", 400, 0, 0.0, 32.667499999999976, 3, 88, 34.0, 51.0, 57.94999999999999, 68.99000000000001, 257.56600128783003, 257.26416613007086, 32.4472794591114], "isController": false}, {"data": ["DELETE /api/item/{id}", 400, 0, 0.0, 3.1675000000000013, 2, 10, 3.0, 4.0, 5.0, 6.0, 396.03960396039605, 67.6825495049505, 83.15284653465346], "isController": false}, {"data": ["Debug Sampler", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 150.390625, 0.0], "isController": false}, {"data": ["DELETE /api/category/{id}", 400, 0, 0.0, 2.9149999999999987, 2, 7, 3.0, 4.0, 4.0, 5.0, 392.54170755642787, 67.08476447497547, 83.95179097154073], "isController": false}, {"data": ["POST /api/item", 400, 0, 0.0, 38.717499999999966, 3, 178, 16.0, 98.90000000000003, 124.89999999999998, 158.93000000000006, 145.50745725718443, 68.34871771553291, 50.444479810840306], "isController": false}, {"data": ["POST /api/user", 400, 0, 0.0, 266.1774999999996, 9, 1009, 214.0, 456.2000000000003, 617.1499999999999, 915.7100000000003, 62.804207881928086, 26.54459098759617, 17.522619327994978], "isController": false}, {"data": ["POST /api/user/{user_id}/order", 400, 0, 0.0, 124.95999999999992, 5, 370, 122.0, 219.80000000000007, 255.89999999999998, 342.6600000000003, 102.7221366204417, 38.92205957883924, 24.276129943502823], "isController": false}, {"data": ["POST /api/category/{category_id}/item/{item_id}", 400, 0, 0.0, 72.22750000000003, 7, 151, 74.0, 110.0, 123.0, 133.99, 170.50298380221653, 61.60752344416027, 32.46882992327365], "isController": false}]}, function(index, item){
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
