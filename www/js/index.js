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
            // barcodeScan();
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
    jQuery('.button-retrieve-scan').on('click', function() {
        var barcodeElement = jQuery(this);
        var barcodeID = barcodeElement.attr('data-id');
        viewPreviousScan(barcodeID);
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
            var scannedID = barcodeID.slice(0,-1);
            barcodeID = productCodes[scannedID];
            $.ajax({
                url: 'https://api.gfs.com/ordering/rest/nutritionService/getNutritionInfo?offeringId=' + barcodeID + '&offeringGroupId=' + group + '&languageTypeCode=' + language,
                type: 'GET',
                data: {
                    format: 'json'
                },
                success: function(response) {
                    if (Object.keys(response).length === 0) {
                        nutritionTable.empty();
                        jQuery('#nutritionTable').append('<div class="nutrition-container"><h3>Hey! It looks like this isn\'t one of ours. We might be wrong though, feel free to try again!</h3></div>');
                        cordova.plugins.firebase.analytics.logEvent("barcode_scanned", {valid: "false", id: scannedID});
                    }
                    var container = parseNutritionInfo(response);
                    nutritionTable.empty();
                    nutritionTable.append(container);
                    var cache_array = JSON.parse(window.localStorage.getItem('cachedScans')) || [];
                    cache_array.push(barcodeID);
                    if (cache_array.length > 5) {
                        cache_array.shift();
                    }
                    window.localStorage.setItem('cachedScans', JSON.stringify(cache_array));
                    retrieveCache();
                    cordova.plugins.firebase.analytics.logEvent("barcode_scanned", {valid: "true", id: barcodeID});
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
        jQuery(cache_array.reverse()).each(function(){
            searchesTable.append('<div class="button-retrieve-scan" data-id="' + this +'" >'+ this +'</div>');
        });
    }
}

function clearCache() {
    window.localStorage.clear('cachedScans');
    searchesTable.empty();
}

function viewPreviousScan(barcodeID) {
    var group = '00001';
    var language = 'eng';
    $.ajax({
        url: 'https://api.gfs.com/ordering/rest/nutritionService/getNutritionInfo?offeringId=' + barcodeID + '&offeringGroupId=' + group + '&languageTypeCode=' + language,
        type: 'GET',
        data: {
            format: 'json'
        },
        success: function(response) {
            var nutritionTable = jQuery('#nutritionTable');
            var container = parseNutritionInfo(response);
            nutritionTable.empty();
            nutritionTable.append(container);
            cordova.plugins.firebase.analytics.logEvent("scan_retrieved", {valid: "true", id: barcodeID});
        },
        error: function() {
            alert('Error');
        }
    });
}

var searchesTable = jQuery('#recentSearches');

function success() {
    console.log('Camera permission granted');
}

function error() {
    console.log('Camera permission denied');
}

function parseNutritionInfo(response) {

    var itemCode = response[0].itemCode,
        itemDesc = response[0].itemDesc,
        itemIngredients = response[0].itemIngredients,

        analysisType = response[0].analysisType,

        servingSize = response[0].servingSize,
        servingSizeUnit = response[0].servingSizeUnit,

        cholesterolAmt = response[0].cholesterolAmt,
        cholesterolUnitOfMeasure = response[0].cholesterolUnitOfMeasure,
        cholesterolRDIAmt = response[0].cholesterolRDIAmt,
        cholesterolNLEAAmt = response[0].cholesterolNLEAAmt,

        proteinAmt = response[0].proteinAmt,
        proteinUnitOfMeasure = response[0].proteinUnitOfMeasure,
        proteinRDIAmt = response[0].proteinRDIAmt,
        proteinNLEAAmt = response[0].proteinNLEAAmt,

        carbohydrateAmt = response[0].carbohydrateAmt,
        carbohydrateUnitOfMeasure = response[0].carbohydrateUnitOfMeasure,
        carbohydrateRDIAmt = response[0].carbohydrateRDIAmt,
        carbohydrateNLEAAmt = response[0].carbohydrateNLEAAmt,

        fiberAmt = response[0].fiberAmt,
        fiberUnitOfMeasure = response[0].fiberUnitOfMeasure,
        fiberRDIAmt = response[0].fiberRDIAmt,
        fiberNLEAAmt = response[0].fiberNLEAAmt,

        sugarsAmt = response[0].sugarsAmt,
        sugarsUnitOfMeasure = response[0].sugarsUnitOfMeasure,
        sugarsRDIAmt = response[0].sugarsRDIAmt,
        sugarsNLEAAmt = response[0].sugarsNLEAAmt,

        caloriesKCLAmt = response[0].caloriesKCLAmt,
        caloriesKCLUnitOfMeasure = response[0].caloriesKCLUnitOfMeasure,
        caloriesKCLNLEAAmt = response[0].caloriesKCLNLEAAmt,

        fatAmt = response[0].fatAmt,
        fatUnitOfMeasure = response[0].fatUnitOfMeasure,
        fatRDIAmt = response[0].fatRDIAmt,
        fatNLEAAmt = response[0].fatNLEAAmt,

        saturatedFatAmt = response[0].saturatedFatAmt,
        saturatedFatUnitOfMeasure = response[0].saturatedFatUnitOfMeasure,
        saturatedFatRDIAmt = response[0].saturatedFatRDIAmt,
        saturatedFatNLEAAmt = response[0].saturatedFatNLEAAmt,

        polyUnsaturatedFatAmt = response[0].polyUnsaturatedFatAmt,
        polyUnsaturatedFatUnitOfMeasure = response[0].polyUnsaturatedFatUnitOfMeasure,
        polyUnsaturatedFatRDIAmt = response[0].polyUnsaturatedFatRDIAmt,
        polyUnsaturatedFatNLEAAmt = response[0].polyUnsaturatedFatNLEAAmt,

        monoUnsaturatedFatAmt = response[0].monoUnsaturatedFatAmt,
        monoUnsaturatedFatUnitOfMeasure = response[0].monoUnsaturatedFatUnitOfMeasure,
        monoUnsaturatedFatRDIAmt = response[0].monoUnsaturatedFatRDIAmt,
        monoUnsaturatedFatNLEAAmt = response[0].monoUnsaturatedFatNLEAAmt,

        transFattyAcidAmt = response[0].transFattyAcidAmt,
        transFattyAcidUnitOfMeasure = response[0].transFattyAcidUnitOfMeasure,
        transFattyAcidRDIAmt = response[0].transFattyAcidRDIAmt,
        transFattyAcidNLEAAmt = response[0].transFattyAcidNLEAAmt,

        caloriesFromFatAmt = response[0].caloriesFromFatAmt,
        caloriesFromFatNLEAAmt = response[0].caloriesFromFatNLEAAmt,

        sodiumAmt = response[0].sodiumAmt,
        sodiumUnitOfMeasure = response[0].sodiumUnitOfMeasure,
        sodiumRDIAmt = response[0].sodiumRDIAmt,
        sodiumNLEAAmt = response[0].sodiumNLEAAmt,

        potassiumAmt = response[0].potassiumAmt,
        potassiumUnitOfMeasure = response[0].potassiumUnitOfMeasure,
        potassiumRDIAmt = response[0].potassiumRDIAmt,
        potassiumNLEAAmt = response[0].potassiumNLEAAmt,

        calciumAmt = response[0].calciumAmt,
        calciumUnitOfMeasure = response[0].calciumUnitOfMeasure,
        calciumRDIAmt = response[0].calciumRDIAmt,
        calciumNLEAAmt = response[0].calciumNLEAAmt,

        ironAmt = response[0].ironAmt,
        ironUnitOfMeasure = response[0].ironUnitOfMeasure,
        ironRDIAmt = response[0].ironRDIAmt,
        ironNLEAAmt = response[0].ironNLEAAmt,

        phosphorousAmt = response[0].phosphorousAmt,
        phosphorousUnitOfMeasure = response[0].phosphorousUnitOfMeasure,
        phosphorousRDIAmt = response[0].phosphorousRDIAmt,
        phosphorousNLEAAmt = response[0].phosphorousNLEAAmt,

        magnesiumAmt = response[0].magnesiumAmt,
        magnesiumUnitOfMeasure = response[0].magnesiumUnitOfMeasure,
        magnesiumRDIAmt = response[0].magnesiumRDIAmt,
        magnesiumNLEAAmt = response[0].magnesiumNLEAAmt,

        zincAmt = response[0].zincAmt,
        zincUnitOfMeasure = response[0].zincUnitOfMeasure,
        zincRDIAmt = response[0].zincRDIAmt,
        zincNLEAAmt = response[0].zincNLEAAmt,

        copperAmt = response[0].copperAmt,
        copperUnitOfMeasure = response[0].copperUnitOfMeasure,
        copperRDIAmt = response[0].copperRDIAmt,
        copperNLEAAmt = response[0].copperNLEAAmt,

        seleniumAmt = response[0].seleniumAmt,
        seleniumUnitOfMeasure = response[0].seleniumUnitOfMeasure,
        seleniumRDIAmt = response[0].seleniumRDIAmt,
        seleniumNLEAAmt = response[0].seleniumNLEAAmt,

        manganeseAmt = response[0].manganeseAmt,
        manganesenitOfMeasure = response[0].manganesenitOfMeasure,
        manganeseRDIAmt = response[0].manganeseRDIAmt,
        manganeseNLEAAmt = response[0].manganeseNLEAAmt,

        iodineAmt = response[0].iodineAmt,
        iodineUnitOfMeasure = response[0].iodineUnitOfMeasure,
        iodineRDIAmt = response[0].iodineRDIAmt,
        iodineNLEAAmt = response[0].iodineNLEAAmt,

        thiaminAmt = response[0].thiaminAmt,
        thiaminUnitOfMeasure = response[0].thiaminUnitOfMeasure,
        thiaminRDIAmt = response[0].thiaminRDIAmt,
        thiaminNLEAAmt = response[0].thiaminNLEAAmt,

        riboflavinAmt = response[0].riboflavinAmt,
        riboflavinUnitOfMeasure = response[0].riboflavinUnitOfMeasure,
        riboflavinRDIAmt = response[0].riboflavinRDIAmt,
        riboflavinNLEAAmt = response[0].riboflavinNLEAAmt,

        niacinMgAmt = response[0].niacinMgAmt,
        niacinMgUnitOfMeasure = response[0].niacinMgUnitOfMeasure,
        niacinMgRDIAmt = response[0].niacinMgRDIAmt,
        niacinMgNLEAAmt = response[0].niacinMgNLEAAmt,

        pantothenicAcidAmt = response[0].pantothenicAcidAmt,
        pantothenicAcidUnitOfMeasure = response[0].pantothenicAcidUnitOfMeasure,
        pantothenicAcidRDIAmt = response[0].pantothenicAcidRDIAmt,
        pantothenicAcidNLEAAmt = response[0].pantothenicAcidNLEAAmt,

        folicAcidAmt = response[0].folicAcidAmt,
        folicAcidUnitOfMeasure = response[0].folicAcidUnitOfMeasure,
        folicAcidRDIAmt = response[0].folicAcidRDIAmt,
        folicAcidNLEAAmt = response[0].folicAcidNLEAAmt,

        vitaminAIUAmt = response[0].vitaminAIUAmt,
        vitaminAIUUnitOfMeasure = response[0].vitaminAIUUnitOfMeasure,
        vitaminAIURDIAmt = response[0].vitaminAIURDIAmt,
        vitaminAIUNLEAAmt = response[0].vitaminAIUNLEAAmt,

        vitaminAREAmt = response[0].vitaminAREAmt,
        vitaminAREUnitOfMeasure = response[0].vitaminAREUnitOfMeasure,
        vitaminARERDIAmt = response[0].vitaminARERDIAmt,
        vitaminARENLEAAmt = response[0].vitaminARENLEAAmt,

        vitaminB6Amt = response[0].vitaminB6Amt,
        vitaminB6UnitOfMeasure = response[0].vitaminB6UnitOfMeasure,
        vitaminB6RDIAmt = response[0].vitaminB6RDIAmt,
        vitaminB6NLEAAmt = response[0].vitaminB6NLEAAmt,

        vitaminB12Amt = response[0].vitaminB12Amt,
        vitaminB12UnitOfMeasure = response[0].vitaminB12UnitOfMeasure,
        vitaminB12RDIAmt = response[0].vitaminB12RDIAmt,
        vitaminB12NLEAAmt = response[0].vitaminB12NLEAAmt,

        vitaminCAmt = response[0].vitaminCAmt,
        vitaminCUnitOfMeasure = response[0].vitaminCUnitOfMeasure,
        vitaminCRDIAmt = response[0].vitaminCRDIAmt,
        vitaminCNLEAAmt = response[0].vitaminCNLEAAmt,

        vitaminDMcgAmt = response[0].vitaminDMcgAmt,
        vitaminDMcgUnitOfMeasure = response[0].vitaminDMcgUnitOfMeasure,
        vitaminDMcgRDIAmt = response[0].vitaminDMcgRDIAmt,
        vitaminDMcgNLEAAmt = response[0].vitaminDMcgNLEAAmt,

        vitaminDIUAmt = response[0].vitaminDIUAmt,
        vitaminDIUUnitOfMeasure = response[0].vitaminDIUUnitOfMeasure,
        vitaminDIURDIAmt = response[0].vitaminDIURDIAmt,
        vitaminDIUNLEAAmt = response[0].vitaminDIUNLEAAmt,

        vitaminEMgAmt = response[0].vitaminEMgAmt,
        vitaminEMgUnitOfMeasure = response[0].vitaminEMgUnitOfMeasure,
        vitaminEMgRDIAmt = response[0].vitaminEMgRDIAmt,
        vitaminEMgNLEAAmt = response[0].vitaminEMgNLEAAmt,

        vitaminKAmt = response[0].vitaminKAmt,
        vitaminKUnitOfMeasure = response[0].vitaminKUnitOfMeasure,
        vitaminKRDIAmt = response[0].vitaminKRDIAmt,
        vitaminKNLEAAmt = response[0].vitaminKNLEAAmt,

        parsedNutritionContent;

    // Sometimes items with a zero value are returned as null rather than zero - this accounts for that

    if(monoUnsaturatedFatAmt === null) {
        monoUnsaturatedFatAmt = '0';
    }
    if(polyUnsaturatedFatAmt === null) {
        polyUnsaturatedFatAmt = '0';
    }
    if(vitaminAIUAmt === null) {
        vitaminAIUAmt = '0';
    }
    if(vitaminB6Amt === null) {
        vitaminB6Amt = '0';
    }
    if(vitaminB12Amt === null) {
        vitaminB12Amt = '0';
    }
    if(vitaminCAmt === null) {
        vitaminCAmt = '0';
    }
    if(vitaminDMcgAmt === null) {
        vitaminDMcgAmt = '0';
    }
    if(vitaminEMgAmt === null) {
        vitaminEMgAmt = '0';
    }
    if(vitaminKAmt === null) {
        vitaminKAmt = '0';
    }

    // Setting the container variable
    parsedNutritionContent = jQuery('<table class="nutrition-container" />');

    // Description
    parsedNutritionContent.append('<tr class="title-row"><td colspan="2"><h3>' + itemDesc + ' ('+ itemCode + ')</h3></td></tr>');
    // Serving Information
    parsedNutritionContent.append('<tr><td><strong>Serving Size</strong></td><td>' + servingSize +  ' (' + servingSizeUnit + ')</td></tr>');
    // Calories - Calories from Fat
    parsedNutritionContent.append('<tr><td><strong>Calories</strong></td><td>' + caloriesKCLAmt +' '+ caloriesKCLUnitOfMeasure + '</td></tr>');
    parsedNutritionContent.append('<tr><td><strong>Calories from Fat</strong></td><td> ' + caloriesFromFatAmt + ' ' + caloriesKCLUnitOfMeasure + '</td></tr>');
    // Total Fat
    parsedNutritionContent.append('<tr><td><strong>Total Fat</strong></td><td>' + fatAmt + fatUnitOfMeasure + '</td></tr>');
    //  Saturated Fat
    parsedNutritionContent.append('<tr><td><strong>Saturated Fat</strong></td><td>' + saturatedFatAmt + saturatedFatUnitOfMeasure + '</td></tr>');
    //  Trans Fat
    parsedNutritionContent.append('<tr><td><strong>Trans Fat</strong></td><td>' + transFattyAcidAmt + transFattyAcidUnitOfMeasure + '</td></tr>');
    //  Mono Fat
    parsedNutritionContent.append('<tr><td><strong>Monounsaturated Fat</strong></td><td>' + monoUnsaturatedFatAmt + monoUnsaturatedFatUnitOfMeasure + '</td></tr>');
    //  Mono Fat
    parsedNutritionContent.append('<tr><td><strong>Polyunsaturated Fat</strong></td><td>' + polyUnsaturatedFatAmt + polyUnsaturatedFatUnitOfMeasure + '</td></tr>');
    // Cholesterol
    parsedNutritionContent.append('<tr><td><strong>Cholesterol</strong></td><td>' + cholesterolAmt + cholesterolUnitOfMeasure + '</td></tr>');
    // Sodium
    parsedNutritionContent.append('<tr><td><strong>Sodium</strong></td><td>' + sodiumAmt + sodiumUnitOfMeasure + '</td></tr>');
    // Total Carbohydrates
    parsedNutritionContent.append('<tr><td><strong>Total Carbohydrate</strong></td><td>' + carbohydrateAmt + carbohydrateUnitOfMeasure + '</td></tr>');
    //  Dietary Fiber
    parsedNutritionContent.append('<tr><td><strong>Dietary Fiber</strong></td><td>' + fiberAmt + fiberUnitOfMeasure + '</td></tr>');
    //  Sugars
    parsedNutritionContent.append('<tr><td><strong>Sugars</strong></td><td>' + sugarsAmt + sugarsUnitOfMeasure + '</td></tr>');
    // Protein
    parsedNutritionContent.append('<tr><td><strong>Protein</strong></td><td>' + proteinAmt + proteinUnitOfMeasure + '</td></tr>');
    // Vitamins
    // Black Bar Here
    parsedNutritionContent.append('<tr class="vitamin-row"><td>Vitamin A ' + vitaminAIUAmt + vitaminAIUUnitOfMeasure + '</td><td>Vitamin B6 ' + vitaminB6Amt + vitaminB6UnitOfMeasure + '</td></tr>');
    parsedNutritionContent.append('<tr class="vitamin-row"><td>Vitamin B12 ' + vitaminB12Amt + vitaminB12UnitOfMeasure + '</td><td>Vitamin C ' + vitaminCAmt + vitaminCUnitOfMeasure + '</td></tr>');
    parsedNutritionContent.append('<tr class="vitamin-row"><td>Vitamin D ' + vitaminDMcgAmt + vitaminDMcgUnitOfMeasure + '</td><td>Vitamin E ' + vitaminEMgAmt + vitaminEMgUnitOfMeasure + '</td></tr>');
    parsedNutritionContent.append('<tr class="vitamin-row"><td>Vitamin K ' + vitaminKAmt + vitaminKUnitOfMeasure + '</td><td></td></tr>');
    // Ingredients
    parsedNutritionContent.append('<tr class="ingredients-row"><td colspan="2">Ingredients: ' + itemIngredients + '</td></tr>');

    // Allergy Information
    // TODO: Allergy Information

    return parsedNutritionContent;
}