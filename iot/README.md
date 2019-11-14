# SMB.io // IoT Scenario
An IoT app that uses bluetooth (BLE) to connect the SensorTag and stream sensor data (Accelerometer, Luxometer, Humidity & Temperature).
With the sensor data, you can configure your ERP system (SAP Business One / SAP Business ByDesign) to get triggers.

In this solution, you will be guided on how to deploy it in your device (iOS / Android).
We will be using Cordova to package this web application and build it for mobile device.
What you need is a mobile device and a SensorTag.
Optionally, you may acquire SAP's IoT platform (SAP Leonardo IoT 4.0), so to collect the IoT Sensor Data.
If not, the sensor data will just be streaming to your mobile device

## Prerequisite
- Hardware: CC2650STK SensorTag
- Install [Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/#installing-the-cordova-cli)
- Install [Xcode](https://developer.apple.com/xcode/) or/and [Android Studio](https://developer.android.com/studio)

## How to use this?
This is a SAPUI5 app that is wrapped in a Hybrid mobile application through cordova packaging tool.
It is using your mobile bluetooth (BLE Technology) to connect to the sensortag and starts to stream sensor data into the mobile phone.
From the mobile phone, you have the option to configure an IoT platform (SAP Cloud Platform IoT 2.0 / Leonardo 4.0) to stream IoT data.

Make sure you have completed the prerequisite before applying the following steps.
1. Download the contents in this page's folder (/smb.io/iot).

2. Prepare a cordova package to your own namespace identifier using terminal / command prompt.
> Syntax as follows:
```sh
cordova create <folder-name> <namespace-identifier-of-your-app> <app-name-or-project-name>
```
```sh
$ cordova create smbhybridappsmbiot sap.smbhybridappsmbiot SMBHybridAppSMBIoT
```
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-1.png)

3. Copy & paste the contents in the web app package into the cordova app's www folder & replace contents.
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-6.png)

4. Download the plugins.
```sh
$ cordova plugin add cordova-plugin-geolocation cordova-plugin-ble cordova-plugin-dialogs cordova-plugin-document-viewer cordova-plugin-inappbrowser cordova-plugin-device
```
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-7.png)

5. Run Cordova commands to add device.
```sh
$ cordova platform add ios
$ cordova platform add android
```
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-4.png)

6. Open your project in either OS dependent IDE.
<br>For iOS, open the .xcodeproj extension in the ios folder.
<br>![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-8.png)
<br>
<br>For Android, Open Android Studio, Open Existing Android Project, Select the android folder.
<br>![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-9.png)
<br>
7. Run the project in the IDE.

# Change Log
11.19 - Distribution version of SMB.io on IoT solution.

# License
This repository is released under the terms of the MIT license. 
<br>See [LICENSE](https://github.com/jacobtan89/smb.io/blob/master/LICENSE) for more information or see https://opensource.org/licenses/MIT.

## Author
* [Tan, Jacob](https://github.com/jacobtan89)