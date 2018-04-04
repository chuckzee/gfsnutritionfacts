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
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

    }

};

jQuery(document).ready(function() {
   jQuery('#scanButton').on('click',function() {
       cordova.plugins.barcodeScanner.scan(
           function (result) {
               var barcodeID = result.text;
               var group = '00001';
               var language = 'eng';
               // TODO: Retrieve group, language, and product codes dynamically or via user app settings.
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
                       container = jQuery('<div class="nutrition-container" />');
                       $.each(response[0], function(name, data) {
                           container.append('<div class="nutrition-row"><strong>' + name + ':</strong> ' + data + '</div>');
                       });
                       jQuery('#nutritionTable').append(container);
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
       // var barcodeID = result.text;
       // var group = '00001';
       // var language = 'eng';
       // // TODO: Retrieve group, language, and product codes dynamically or via user app settings.
       // var productCodes = {
       //     "93901100122": "100129",
       //     "93901165992": "115250",
       //     "93901430021": "143002",
       //     "93901600509": "600504",
       //     "93901806963": "806961",
       //     "93901768940": "176894",
       //     "50000811717": "111899",
       //     "93901757500": "175750",
       //     "93901411549": "411542",
       //     "93901698254": "698250"
       // };
       // if(!barcodeID) {
       //     alert('Doesn\'t look like a GFS product!');
       // }
       // else {
       //     console.log(barcodeID);
       //     var container;
       //     $.ajax({
       //         url: 'https://api.gfs.com/ordering/rest/nutritionService/getNutritionInfo?offeringId=' + barcodeID + '&offeringGroupId=' + group + '&languageTypeCode=' + language,
       //         type: 'GET',
       //         data: {
       //             format: 'json'
       //         },
       //         success: function(response) {
       //             container = jQuery('<div class="nutrition-container" />');
       //             $.each(response[0], function(name, data) {
       //                 container.append('<div class="nutrition-row"><strong>' + name + ':</strong> ' + data + '</div>');
       //             });
       //             jQuery('#nutritionTable').append(container);
       //         },
       //         error: function() {
       //             alert('Error');
       //         }
       //     });
       // }
   })
});