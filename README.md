# GFS Nutrition Facts

A Cordova application developed to present users with relevant GFS Nutrition Facts

## Usage

The app can be staged in a browser, Android, or iOS. The root www environment is browser-friendly, while other platforms are delegated to the platforms directory. For instance, platforms/android/ is where we build and compile the apk.

This app will scan barcodes and cross reference them with provided GFS known barcodes and product ids. Once it finds a valid code, an API call is made to the GFS service and returns a Nutriton Facts table, formatted for legibility. 

Users can then share these results via text, social media, email, or whatever their preferred (and allowed) preference is on their mobile device.

#### Android app installation

If you would like to install the developer version of this app, please click here: [app-release.apk](https://github.com/chuckzee/gfsnutritionfacts/blob/master/platforms/android/app/release/app-release.apk)

NOTE: This application was tested in a browser and on Android 8.1 (Google Pixel XL). User experience on other platforms not guaranteed, and not all features are present on the browser version of the application - barcode scanning via camera, social sharing, etc. 

## Technologies

#### Cordova

GFS Nutrition facts was built using [Cordova](https://cordova.apache.org/), an open source mobile framework where web stack development can occur and then be ported out to various devices and operating systems, including Android, Blackberry, iOS, OSX, Ubuntu, Windows, and WP8.

Documentation for Cordova is available [here](https://cordova.apache.org/docs/en/latest/).

#### Phonegap CLI

It is recommended to install [Phonegap CLI](http://docs.phonegap.com/references/phonegap-cli/) globally via [npm](https://www.npmjs.com/) in order to continue development on this application. Phonegap was developed by Adobe as a means to build and compile Cordova applications, as well as run local development environments. 

Adobe's [Phonegap Build](https://build.phonegap.com/) service can be utilized, but for Android specifically I found fewer issues when compiling with Android Studio instead. 

Phonegap CLI can serve the application, and will provide a URL to access it by. You can then install the Phonegap application on your mobile device, which can access the served application. In this way, development can happen simultaneously on multiple devices. 

#### Gulp and Sass

A gulpfile is located in the www directory for continued local development. For the time being it is quite simple, and only includes a sass preprocessor and a watch process. In the future, minification and compression for various front end resources is recommended. 

After [installing gulp via npm](https://gulpjs.com/), you can begin local development with gulp sass:watch in the cli. 

## Cordova Packages in use

* Cordova Camera Plugin (Camera usage and access)
* Cordova Firebase Analytics (Analytics, action reporting, usage statistics)
* Cordova x Social Sharing (Sharing functionality and compatibility on various devices)
* Cordova Google Support Services (Dependency for Firebase)
* Cordova Barcodescanner (Barcode parsing)

#### Config

[config.xml](https://github.com/chuckzee/gfsnutritionfacts/blob/master/config.xml) in the root directory contains build information on the cordova plugin npm packages. If version updates need to occur, or plugins need to be removed or added, this is where this can occur. These functions can also occur via the phonegap cli.
