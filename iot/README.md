# SMB.io // IoT Scenario
An IoT app that uses bluetooth (BLE) to connect the SensorTag and stream sensor data (Accelerometer, Luxometer, Humidity & Temperature).
With the sensor data, you can configure your ERP system (SAP Business One / SAP Business ByDesign) to get triggers.
In this repository, you will be guided on how to deploy it in your device (iOS / Android).
You will be using Cordova to package this web application and build it for mobile device.
What you need is a mobile device and a SensorTag.
Optionally, you may acquire SAP's IoT platform (SAP Leonardo IoT 4.0), so to collect the IoT Sensor Data.
If not, the sensor data will just be streaming to your mobile device. This is what you will achieve at the end.

<p align="center">
<img src="https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-app.gif" width="300">
</p>

## Prerequisite
- Purchase Hardware: [Texas Instruments CC2650STK SensorTag](https://www.ti.com/tool/TIDC-CC2650STK-SENSORTAG)
- Install [Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/#installing-the-cordova-cli)
- Install [Xcode](https://developer.apple.com/xcode/) or/and [Android Studio](https://developer.android.com/studio)

## How to compile/deploy this application source code?
This is a SAPUI5 app that will be wrapped in a Hybrid mobile application through cordova packaging tool.
It is using your mobile bluetooth (BLE Technology) to connect to the sensortag and starts to stream sensor data into the mobile phone.
From the mobile phone, you have the option to configure an IoT platform (SAP Cloud Platform IoT 2.0 / Leonardo 4.0) to stream IoT data.

Make sure you have completed the prerequisite before the following steps.
1. Download the contents in this page's folder (/smb.io/iot).

2. Prepare a Cordova package to your own namespace identifier using terminal / command prompt.
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

4. Add the plugins into your Cordova App.
```sh
$ cordova plugin add cordova-plugin-geolocation cordova-plugin-ble cordova-plugin-dialogs cordova-plugin-document-viewer cordova-plugin-inappbrowser cordova-plugin-device
```
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-7.png)

5. Add device of your choice into your Cordova App.
```sh
$ cordova platform add ios
$ cordova platform add android
```
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-4.png)

6. Open the iOS / Android project.
<br>For iOS, open the .xcodeproj extension in the ios folder.</br>
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-8.png)
<br></br>
<br>For Android, Open Android Studio, Open Existing Android Project, Select the android folder.</br>
![](https://github.com/jacobtan89/smb.io/blob/master/archive/media/iot-9.png)
<br></br>
7. Run the project in the IDE.

# Connected Assets scenario
Several actions can be configured in this application. 
Let’s have a look to each one of them more in detail.

## Visualize your sensor data
After turning on your Texas Instruments CC2650STK SensorTag you can connect this mobile application to your device in order to get the measures via Bluetooth. 
Turn on your Texas Instruments CC2650STK SensorTag and then press the Sensor button to run on scanning for available Bluetooth devices. Select your device to start getting measures.

## Stream sensor data to SAP Cloud Platform
You can visualize the measures received from your sensor in real time. If we put our hand in top of the device the light measure will then go to a low level and be shown in red color.
You can also turn on the “Stream to SCP” option to send your sensor data to SAP Cloud Platform and take advantage of aggregations, analysis and many other IoT Leonardo services we talked about in previous blogs.

## Visualize the location of your sensor in a map
You can visualize in a map the current location of your sensor.

## Define Rules
You can define rules and activate them in your application to:
•	Send alerts to your ERP system (SAP Business One and/or SAP Business ByDesign) 
•	Send SMS alerts sent to a mobile phone number
based on one of your sensor measured values thresholds.

## Technical logs
In this tab you can see the logs of the mobile application and can help you troubleshoot any issues your application may have while connecting to the different components.

# Configuration
Remember to press Save after doing any changes of the configuration!

## SAP Business One
Specify the SAP Business One Service Layer URL and credentials:
*	URL: Your Service Layer URL including the port number.
Ex: https://MyServerIP:50000 (port 5000 needs to be open)
*	Company: B1 Company database.
Ex: SBODEMOUS
*	User: B1 user
Ex: manager
*	Password

## SAP Business ByDesign
Enter your SAP Business ByDesign user credentials:
*	BYD Server URL
Ex: https://myByDServer.sapbydesign.com 
*	User.
Ex: ADMINISTRATION01
*	Password.
*	Default Business Partner ID: The Service Request will be created against this business partner, please check your ByD tenant to get a valid business partner ID.

## IoT 2.0 (deprecated)
This configuration step was required for sending the sensor measures to SAP IoT 2.0 that has been deprecated. Unless you worked with IoT 2.0 in the past and you still have an IoT 2.0 system please ignore this section.

## IoT4.0
This section allows you to configure a URL where your sensor measures will be sent. In our scenario we put the URL of a Cloud Foundry application running on SAP Cloud Platform. This application acts as a router forwarding the measures to SAP Leonardo IoT for further storage, analysis and other advanced services.
You can find more details about this SCP application in the Bring Your Own Device scenario detailed instructions document shared as a component of the Build Blocks for the SMB Summits Hackathons.  

## SMS
You can configure a mobile telephone number where SMS alerts must be sent after your rules get activated on the Connected Assets scenario.

## GMap
A Google Map API Key is required to access some implemented Google Map features from the mobile application. You can get your API Key from Google Map, follow the instructions here.

## Sensor
Once the application connected to your sensor you can do some operations in the sensor like turning on the red or green lights, making a sound or turning of the sensor. Just play with the different options!


# Change Log
11.19 - Distribution version of SMB.io on IoT solution.

# License
This repository is released under the terms of the MIT license. 
<br>See [LICENSE](https://github.com/jacobtan89/smb.io/blob/master/LICENSE) for more information or see https://opensource.org/licenses/MIT.

## Author
* [Tan, Jacob](https://github.com/jacobtan89)
