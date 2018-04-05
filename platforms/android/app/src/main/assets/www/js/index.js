/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('deviceready', function() {
            $.support.cors=true;
            barcodeScan();
            retrieveCache();
            clickListen();
        });
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    barcodeScanEvent: function() {

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);

    }

};

function clickListen() {
    jQuery('#scanButton').on('click', function() {
        barcodeScan();
    });
    jQuery('#retrieveCache').on('click', function() {
        retrieveCache();
    });
    jQuery('#clearCache').on('click', function() {
        clearCache();
    });
}

/**
 * Barcode Scanner Function
 */

function barcodeScan() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var nutritionTable = jQuery('#nutritionTable');
            var barcodeID = result.text;
            // TODO: Retrieve group, language, and product codes dynamically or via user app settings.
            var group = '00001';
            var language = 'eng';
            var productCodes = {
                "93901100122": "100129",
                "93901165992": "115250",
                "93901430021": "143002",
                "93901600509": "600504",
                "93901806963": "806961",
                "93901768940": "176894",
                "50000811717": "111899",
                "93901757500": "175750",
                "93901411549": "411542",
                "93901698254": "698250"
            };
            barcodeID = barcodeID.slice(0,-1);
            barcodeID = productCodes[barcodeID];
            var container;
            $.ajax({
                url: 'https://api.gfs.com/ordering/rest/nutritionService/getNutritionInfo?offeringId=' + barcodeID + '&offeringGroupId=' + group + '&languageTypeCode=' + language,
                type: 'GET',
                data: {
                    format: 'json'
                },
                success: function(response) {
                    if (Object.keys(response).length === 0) {
                        nutritionTable.empty();
                        jQuery('#nutritionTable').append('<h3>Hey! It looks like this isn\'t one of ours. We might be wrong though, feel free to try again!</h3>');
                    }
                    container = jQuery('<div class="nutrition-container" />');
                    $.each(response[0], function (name, data) {
                        container.append('<div class="nutrition-row"><strong>' + name + ':</strong> ' + data + '</div>');
                    });
                    nutritionTable.empty();
                    nutritionTable.append(container);
                    var cache_array = JSON.parse(window.localStorage.getItem('cachedScans')) || [];
                    cache_array.push(barcodeID);
                    window.localStorage.setItem('cachedScans', JSON.stringify(cache_array));
                    retrieveCache();
                },
                error: function() {
                    alert('Error');
                }
            });
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}

/**
 * Pull any previous searches in the cache if they exist
 */

function retrieveCache() {
    var storage = window.localStorage;
    var cachedScans = storage.getItem('cachedScans');
    if(cachedScans === null) {
        console.log('No cache yet');
        searchesTable.empty();
    } else {
        searchesTable.empty();
        var cache_array = JSON.parse(window.localStorage.getItem('cachedScans')) || [];
        jQuery(cache_array).each(function(){
            searchesTable.append('<div>'+ this +'</div>');
        });
    }
}

function clearCache() {
    window.localStorage.clear('cachedScans');
    searchesTable.empty();
}

var searchesTable = jQuery('#recentSearches');

function success() {
    console.log('Camera permission granted');
}

function error() {
    console.log('Camera permission denied');
}