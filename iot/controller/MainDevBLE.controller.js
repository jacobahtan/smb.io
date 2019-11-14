sap.ui.define([
    'jquery.sap.global',
    'jt/resolute/iot/controller/BaseController',
    'sap/m/MessageToast'
], function (jQuery, BaseController, MessageToast) {
    "use strict";
    var ResetCount = 1;
    var StreamFreq = 1000;
    var StreamStatus = false;
    var StreamStatusCall = null;
    var StreamAccX = "";
    var StreamAccY = "";
    var StreamAccZ = "";
    var StreamLux = "";
    var StreamLat = "";
    var StreamLng = "";
    var StreamAlt = "";

    var onGetSensorDataStreamToSCP = function () {
        var options = {
            enableHighAccuracy: true
        };
        navigator.geolocation.getCurrentPosition(function (pos) {
            if (pos.coords.latitude == null) {
                StreamLat = "0";
            } else {
                StreamLat = pos.coords.latitude;
            }
            if (pos.coords.longitude == null) {
                StreamLng = "0";
            } else {
                StreamLng = pos.coords.longitude;
            }
            if (pos.coords.altitude == null) {
                StreamAlt = "0";
            } else {
                StreamAlt = pos.coords.altitude;
            }
        }, function () {
            // error
            console.log("error");
        }, options);

        StreamAccX = sap.ui.getCore().byId("xTileDevBLE").getValue();
        StreamAccY = sap.ui.getCore().byId("yTileDevBLE").getValue();
        StreamAccZ = sap.ui.getCore().byId("zTileDevBLE").getValue();
        StreamLux = sap.ui.getCore().byId("luxNumDevBLE").getValue();

        var msgPayload = {};
        msgPayload.timestamp = Math.floor(Date.now() / 1000);
        msgPayload.dev = "0";
        msgPayload.accx = StreamAccX;
        msgPayload.accy = StreamAccY;
        msgPayload.accz = StreamAccZ;
        msgPayload.alt = StreamAlt;
        msgPayload.long = StreamLng;
        msgPayload.lat = StreamLat;
        msgPayload.lux = StreamLux;

        var msgPayloadIoT4 = {};
        msgPayloadIoT4.dev = "0";
        msgPayloadIoT4.accx = StreamAccX;
        msgPayloadIoT4.accy = StreamAccY;
        msgPayloadIoT4.accz = StreamAccZ;
        msgPayloadIoT4.alt = StreamAlt;
        msgPayloadIoT4.lng = StreamLng;
        msgPayloadIoT4.lat = StreamLat;
        msgPayloadIoT4.lux = StreamLux;

        var SCPIOTURL = localStorage.getItem("SCPIOTURL");
        var SCPIOTMDE = localStorage.getItem("SCPIOTMDE");
        var SCPIOTMTY = localStorage.getItem("SCPIOTMTY");
        var SCPIOTMSG = [msgPayload];
        var SCPIOTCTY = localStorage.getItem("SCPIOTCTY");
        var SCPIOTBRB = localStorage.getItem("SCPIOTBRB");
        var payload = {};
        payload.mode = SCPIOTMDE;
        payload.messageType = SCPIOTMTY;
        payload.messages = SCPIOTMSG;

        // Make sure URLs are of correct standard
        if (SCPIOTURL.slice(-1) == '/') {
            SCPIOTURL = SCPIOTURL.slice(0, -1);
        }

        var SCPIOT4URL = localStorage.getItem("SCPIOT4URL");

        // Make sure URLs are of correct standard
        if (SCPIOT4URL.slice(-1) == '/') {
            SCPIOT4URL = SCPIOT4URL.slice(0, -1);
        }

        $.ajax({
            type: "POST",
            url: SCPIOTURL,
            xhrFields: {
                withCredentials: true
            },
            headers: {
                "Authorization": SCPIOTBRB,
                "Content-Type": SCPIOTCTY
            },
            data: JSON.stringify(payload),
            success: function (data, textStatus, jQxhr) {
                app.addActivity("Payload stream successfully. " + data.msg + ".", "{i18n>scpLogActivitySuccess}");
            },
            error: function (jqXhr, textStatus, errorThrown) {
                sap.m.MessageToast.show("Something is wrong with IoT 2.0. Check logs in app.");
                app.addActivity("Status: " + textStatus + ". " + errorThrown + ".", "{i18n>scpLogActivityError}");
            }
        });

        $.ajax({
            type: "POST",
            crossDomain: true,
            url: SCPIOT4URL + "/stream",
            xhrFields: {
                withCredentials: true
            },
            data: msgPayloadIoT4,
            success: function (result) {
                app.addActivity("Data: " + result.lux + ".", "{i18n>scp4LogActivitySuccess}");
            },
            error: function (error) {
                sap.m.MessageToast.show("Something is wrong with IoT 4.0. Check logs in app.");
                app.addActivity("Status: " + error.status + ". " + error.statusText + ".", "{i18n>scp4LogActivityError}");
            }
        });
    };

    var CController = BaseController.extend("jt.resolute.iot.controller.MainDevBLE", {
        onInit: function () {
            localStorage.setItem("B1SLCONNECTED", "NO");

            sap.ui.getCore().loadLibrary("openui5.googlemaps", "dist/openui5/googlemaps/");

            var oBusy = new sap.m.BusyDialog({
                title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("dialogLoadingTitle"),
                text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("dialogLoadingText"),
                showCancelButton: false
            });
            oBusy.open();

            if (sap.ui.Device.system.phone) {
                //this.getView().byId("oBrandLogoDevBLE").setWidth("20%");
                //this.getView().byId("oBrandB1IOTLogoDevBLE").setWidth("10%");
                //this.getView().byId("oBrandLogoRight").setWidth("15%");
            }

            this._oNavContainer = this.getView().byId("pageContainerDevBLE");
            this._oHomePage = sap.ui.xmlfragment("jt.resolute.iot.fragment.HomeDevBLE", this);
            this._oConfigPage = sap.ui.xmlfragment("jt.resolute.iot.fragment.ConfigDevBLE", this);
            this._oScenarioSelectionPage = sap.ui.xmlfragment("jt.resolute.iot.fragment.ScenarioSelectionDevBLE", this);
            this._oScenarioRetailSmartAssetPage = sap.ui.xmlfragment("jt.resolute.iot.fragment.ScenarioRetailSmartAssetDevBLE", this);

            /*Adding Fragment to View Dependency*/
            this.getView().addDependent(this._oHomePage);
            this.getView().addDependent(this._oConfigPage);
            this.getView().addDependent(this._oScenarioSelectionPage);
            this.getView().addDependent(this._oScenarioRetailSmartAssetPage);

            this._oNavContainer.addPage(this._oHomePage);
            this._oNavContainer.addPage(this._oConfigPage);
            this._oNavContainer.addPage(this._oScenarioSelectionPage);
            this._oNavContainer.addPage(this._oScenarioRetailSmartAssetPage);

            jQuery.sap.delayedCall(1000, this, function () {
                //                this._getWelcome().open();
                oBusy.close();
                sap.ui.core.BusyIndicator.hide();
            });

            this._oNavContainer.to(this._oHomePage);

            this.onScenario1MapLocationStart();
        },

        /*
         * ######################################
         * ######################################
         * ######################################
         * [START] IoT Functions
         * ######################################
         * ######################################
         * ######################################*/

        onBrandLogoPressDevBLE: function () {
            if (ResetCount > 4) {
                MessageToast.show(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appResetMessage"));
                localStorage.clear();

                if (app.device !== null) {
                    app.onStopButton();
                }

                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setType("Default");
                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setIcon("sap-icon://disconnected");
                sap.ui.getCore().byId("btnConfigSaveDevBLE").setType("Default");
                sap.ui.getCore().byId("switchSensorDevBLE").setState(false);
                sap.ui.getCore().byId("switchRuleDevBLE").setState(false);
                sap.ui.getCore().byId("switchSCPStreamDevBLE").setState(false);

                StreamStatus = false;
                clearInterval(StreamStatusCall);

                jQuery.sap.delayedCall(2000, this, function () {
                    this._oNavContainer.to(this._oHomePage);
                    this.getRouter().navTo("appLogin");
                });
                ResetCount = 0;
            } else if (ResetCount < 5) {
                MessageToast.show(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appResetWarning1") +
                    ResetCount + this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appResetWarning2"));
            }
            ResetCount++;
        },

        onScenarioToRetailAssetPressDevBLE: function () {
            this._oNavContainer.to(this._oScenarioRetailSmartAssetPage);
        },

        onBtnLedRed: function () {
            app.onRed();
        },
        onBtnLedGreen: function () {
            app.onGreen();
        },
        onBtnBuzzer: function () {
            app.onBuz();
        },
        onBtnOff: function () {
            app.onOff();
        },

        onSCPStreamFreqChange: function () {
            var freq = sap.ui.getCore().byId("btnSCPStreamFreqDevBLE").getSelectedKey();
            if (freq === "2s") {
                StreamFreq = 2000;
            } else if (freq === "5s") {
                StreamFreq = 5000;
            } else {
                StreamFreq = 10000;
            }

            // Start only if sensor is on
            if (localStorage.getItem("SENSORCONNECTED") === "streaming") {
                if (sap.ui.getCore().byId("switchSCPStreamDevBLE").getState()) {
                    // stop & start interval to new freq
                    clearInterval(StreamStatusCall);
                    StreamStatusCall = setInterval(onGetSensorDataStreamToSCP, StreamFreq);
                }
            }

        },

        onSCPStreamSwitch: function (oEvent) {
            var freq = sap.ui.getCore().byId("btnSCPStreamFreqDevBLE").getSelectedKey();
            if (freq === "2s") {
                StreamFreq = 2000;
            } else if (freq === "5s") {
                StreamFreq = 5000;
            } else {
                StreamFreq = 10000;
            }

            if (localStorage.getItem("B1SLURL") === null) {
                MessageToast.show("Opps, configuration not setup yet. Get started with your configuration now.");
                this.getView().byId("fixedNavListMainDevBLE").setSelectedItem(this.getView().byId("fixedNavListMainDevBLE").getItems()[2]);
                this._oNavContainer.to(this._oConfigPage);
                oEvent.getSource().setState(false);
            } else if (localStorage.getItem("SENSORCONNECTED") === "streaming") {
                var state = oEvent.getParameters().state;
                switch (state) {
                    case true:
                        StreamStatus = true;
                        StreamStatusCall = setInterval(onGetSensorDataStreamToSCP, StreamFreq);
                        break;
                    case false:
                        StreamStatus = false;
                        clearInterval(StreamStatusCall);
                        break;
                    default:
                        break;
                }
            } else {
                oEvent.getSource().setState(false);
                MessageToast.show("Opps! Sensor is not connected yet.");
            }

        },

        onSwitch: function (oEvent) {
            //  1. Config Check
            //  2. Pass > Proceed
            sap.ui.core.BusyIndicator.show(0);
            var swtch = oEvent.getSource();
            if (localStorage.getItem("B1SLURL") === null && localStorage.getItem("B1SLCONNECTED") !== "YES") {
                this._oNavContainer.to(this._oConfigPage);
                oEvent.getSource().setState(false);
                sap.ui.getCore().byId("switchRuleDevBLE").setState(false);
                sap.ui.getCore().byId("switchSCPStreamDevBLE").setState(false);
                sap.ui.core.BusyIndicator.hide();
                this.getView().byId("fixedNavListMainDevBLE").setSelectedItem(this.getView().byId("fixedNavListMainDevBLE").getItems()[2]);
                MessageToast.show("Opps, configuration not setup yet. Get started with your configuration now.");
            } else {
                app.view = sap.ui.getCore();
                var state = oEvent.getParameters().state;
                switch (state) {
                    case true:
                        app.onStartButton();
                        break;
                    case false:
                        app.onStopButton();
                        sap.ui.getCore().byId("switchRuleDevBLE").setState(false);
                        sap.ui.getCore().byId("switchSCPStreamDevBLE").setState(false);
                        StreamStatus = false;
                        clearInterval(StreamStatusCall);
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("SensorTag is now disconnected.");
                        break;
                    default:
                        app.onStopButton();
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("SensorTag is now disconnected.");
                }
            }
        },

        onRuleSwitch: function () {},
        scenario1InfoScenarioRuleSliderChange: function (oEvent) {
            sap.ui.getCore().byId("scenario1InfoScenarioRuleLimitDevBLE").setValue(sap.ui.getCore().byId("scenario1InfoScenarioRuleSliderDevBLE").getValue() * 2.5);
        },

        onScenario1StatsMsgStripLinkTo: function (oEvent) {
            sap.ui.getCore().byId("idIconTabBarDevBLE").setSelectedKey("Info");
        },

        onScenario1MapLocationStart: function (oEvent) {
            var options = {
                enableHighAccuracy: true
            };
            var position = navigator.geolocation.getCurrentPosition(this.onS1MapLocateSuccess, this.onS1MapLocateError, options);
        },
        onS1MapLocateSuccess: function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            sap.ui.getCore().byId("scenario1LocationMap").setLat(lat);
            sap.ui.getCore().byId("scenario1LocationMap").setLng(lng);
            sap.ui.getCore().byId("scenario1LocationMarker").setLat(lat);
            sap.ui.getCore().byId("scenario1LocationMarker").setLng(lng);
            var country;

            //            $.ajax('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=AIzaSyD6EmAk92gaGzjYVYU-ebd_BK-rgejSoZ0')
            //                .then(
            //                    function success(response) {
            //                        for (var i = 0; i < response.results[0].address_components.length; i++) {
            //                            var shortname = response.results[0].address_components[i].short_name;
            //                            var longname = response.results[0].address_components[i].long_name;
            //                            var type = response.results[0].address_components[i].types;
            //                            if (type.indexOf("country") != -1) {
            //                                country = longname;
            //                                if (localStorage.getItem("SMSALERTPHONENOKEY") == null || localStorage.getItem("SMSALERTPHONENOKEY") == "undefined") {}
            //                            }
            //                        }
            //                    },
            //                    function fail(status) {
            //                        console.log('Request failed.  Returned status of',
            //                            status)
            //                    }
            //                );

        },

        // Execute on failure - when calling this function invoke with this. prefixed
        onS1MapLocateError: function (error) {},
        onSCPIOTHelpDevBLE: function () {
            var y = window.location.href;
            var x = y.length - 22;
            var res = y.substring(0, x);
            var url = res + encodeURI("doc/B1 IoT - Setup SCP IoT Services.pdf");
            var mimeType = "application/pdf";
            var options = {
                title: "B1 IoT SCP Setup",
                documentView: {
                    closeLabel: "Close"
                },
                navigationView: {
                    closeLabel: "Close"
                },
                email: {
                    enabled: true
                },
                print: {
                    enabled: false
                },
                openWith: {
                    enabled: true
                },
                bookmarks: {
                    enabled: false
                },
                search: {
                    enabled: false
                },
                autoClose: {
                    onPause: true
                }
            };

            function onShow() {
                window.console.log('document shown');
                //e.g. track document usage
            }

            function onClose() {
                window.console.log('document closed');
                //e.g. remove temp files
            }

            function onMissingApp(appId, installer) {
                if (confirm("Do you want to install the free PDF Viewer App " +
                        appId + " for Android?")) {
                    installer();
                }
            }

            function onError(error) {
                window.console.log(error);
                alert("Sorry! Cannot view document.");
            }

            var linkHandlers = [];
            if (sap.ui.Device.system.phone) {
                cordova.plugins.SitewaertsDocumentViewer.viewDocument(url, mimeType, options, onShow, onClose, onMissingApp, onError, linkHandlers);
            } else {
                var url = "doc/B1 IoT - Setup SCP IoT Services.pdf";
                var win = window.open(url, '_blank');
                win.focus();
            }
        },

        onSCPIOT4HelpDevBLE: function () {
            var y = window.location.href;
            var x = y.length - 22;
            var res = y.substring(0, x);
            var url = res + encodeURI("doc/IoT 4.0-SMBIoT SensorTag.pdf");
            var mimeType = "application/pdf";
            var options = {
                title: "IoT 4.0 SCP Setup",
                documentView: {
                    closeLabel: "Close"
                },
                navigationView: {
                    closeLabel: "Close"
                },
                email: {
                    enabled: true
                },
                print: {
                    enabled: false
                },
                openWith: {
                    enabled: true
                },
                bookmarks: {
                    enabled: false
                },
                search: {
                    enabled: false
                },
                autoClose: {
                    onPause: true
                }
            };

            function onShow() {
                window.console.log('document shown');
                //e.g. track document usage
            }

            function onClose() {
                window.console.log('document closed');
                //e.g. remove temp files
            }

            function onMissingApp(appId, installer) {
                if (confirm("Do you want to install the free PDF Viewer App " +
                        appId + " for Android?")) {
                    installer();
                }
            }

            function onError(error) {
                window.console.log(error);
                alert("Sorry! Cannot view document.");
            }

            var linkHandlers = [];
            if (sap.ui.Device.system.phone) {
                cordova.plugins.SitewaertsDocumentViewer.viewDocument(url, mimeType, options, onShow, onClose, onMissingApp, onError, linkHandlers);
            } else {
                var url = "doc/IoT 4.0-SMBIoT SensorTag.pdf";
                var win = window.open(url, '_blank');
                win.focus();
            }
        },

        onConfigSaveDevBLE: function (oEvent) {
            // B1 Configuration
            var B1SLURL = sap.ui.getCore().byId("ConfigSLURLDevBLE").getValue();
            var B1SLCOY = sap.ui.getCore().byId("ConfigSLCOYDevBLE").getValue();
            var B1SLUSR = sap.ui.getCore().byId("ConfigSLUSERDevBLE").getValue();
            var B1SLPWD = sap.ui.getCore().byId("ConfigSLPASSWORDDevBLE").getValue();

            localStorage.setItem("B1SLURL", B1SLURL);
            localStorage.setItem("B1SLCOY", B1SLCOY);
            localStorage.setItem("B1SLUSR", B1SLUSR);
            localStorage.setItem("B1SLPWD", B1SLPWD);

            // ByD Configuration
            var BYDURL = sap.ui.getCore().byId("ConfigByDURLDevBLE").getValue();
            var BYDUSR = sap.ui.getCore().byId("ConfigByDUSERDevBLE").getValue();
            var BYDPWD = sap.ui.getCore().byId("ConfigByDPASSWORDDevBLE").getValue();
            var BYDBP = sap.ui.getCore().byId("ConfigByDDefaultBPDevBLE").getValue();

            localStorage.setItem("BYDURL", BYDURL);
            localStorage.setItem("BYDUSR", BYDUSR);
            localStorage.setItem("BYDPWD", BYDPWD);
            localStorage.setItem("BYDBP", BYDBP);

            // SCP IoT 2.0 Configuration
            var SCPIOTURL = sap.ui.getCore().byId("configSCPIOTURLDevBLE").getValue();
            var SCPIOTMDE = sap.ui.getCore().byId("configSCPIOTMODEDevBLE").getValue();
            var SCPIOTMTY = sap.ui.getCore().byId("configSCPIOTMSGTYPEDevBLE").getValue();
            var SCPIOTMSG = sap.ui.getCore().byId("configSCPIOTMSGDevBLE").getValue();
            var SCPIOTCTY = sap.ui.getCore().byId("configSCPIOTCONTENTTYPEDevBLE").getValue();
            var SCPIOTBRB = sap.ui.getCore().byId("configSCPIOTBEARERDevBLE").getValue();

            // SCP IoT 4.0 Configuration
            var SCPIOT4URL = sap.ui.getCore().byId("configSCPIOT4URLDevBLE").getValue();

            localStorage.setItem("SCPIOTURL", SCPIOTURL);
            localStorage.setItem("SCPIOTMDE", SCPIOTMDE);
            localStorage.setItem("SCPIOTMTY", SCPIOTMTY);
            localStorage.setItem("SCPIOTMSG", SCPIOTMSG);
            localStorage.setItem("SCPIOTCTY", SCPIOTCTY);
            localStorage.setItem("SCPIOTBRB", SCPIOTBRB);

            localStorage.setItem("SCPIOT4URL", SCPIOT4URL);

            // Google Map API Key
            var GMAPAPIKEY = sap.ui.getCore().byId("ConfigGMAPAPIKEYDevBLE").getValue();
            localStorage.setItem("GMAPAPIKEY", GMAPAPIKEY);

            // Indicator of Config Saved
            localStorage.setItem("B1IOTCONFIG", true);

            MessageToast.show("Hurray! You're all set!");
            oEvent.getSource().setType("Accept");
        },

        /*
         * ######################################
         * ######################################
         * ######################################
         * [END] IoT Functions
         * ######################################
         * ######################################
         * ######################################*/

        hideBusyIndicator: function () {
            sap.ui.core.BusyIndicator.hide();
        },

        showBusyIndicator: function (iDuration, iDelay) {
            sap.ui.core.BusyIndicator.show(iDelay);

            if (iDuration && iDuration > 0) {
                if (this._sTimeoutId) {
                    jQuery.sap.clearDelayedCall(this._sTimeoutId);
                    this._sTimeoutId = null;
                }

                this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function () {
                    this.hideBusyIndicator();
                });
            }
        },

        onBeforeRendering: function () {},
        onAfterRendering: function () {
            if (localStorage.getItem("B1IOTCONFIG") === "true") {
                // B1 Configuration
                var B1SLURL = localStorage.getItem("B1SLURL");
                var B1SLCOY = localStorage.getItem("B1SLCOY");
                var B1SLUSR = localStorage.getItem("B1SLUSR");
                var B1SLPWD = localStorage.getItem("B1SLPWD");

                sap.ui.getCore().byId("ConfigSLURLDevBLE").setValue(B1SLURL);
                sap.ui.getCore().byId("ConfigSLCOYDevBLE").setValue(B1SLCOY);
                sap.ui.getCore().byId("ConfigSLUSERDevBLE").setValue(B1SLUSR);
                sap.ui.getCore().byId("ConfigSLPASSWORDDevBLE").setValue(B1SLPWD);

                // SCP IoT Configuration
                var SCPIOTURL = localStorage.getItem("SCPIOTURL");
                var SCPIOTMDE = localStorage.getItem("SCPIOTMDE");
                var SCPIOTMTY = localStorage.getItem("SCPIOTMTY");
                var SCPIOTMSG = localStorage.getItem("SCPIOTMSG");
                var SCPIOTCTY = localStorage.getItem("SCPIOTCTY");
                var SCPIOTBRB = localStorage.getItem("SCPIOTBRB");

                sap.ui.getCore().byId("configSCPIOTURLDevBLE").setValue(SCPIOTURL);
                sap.ui.getCore().byId("configSCPIOTMODEDevBLE").setValue(SCPIOTMDE);
                sap.ui.getCore().byId("configSCPIOTMSGTYPEDevBLE").setValue(SCPIOTMTY);
                sap.ui.getCore().byId("configSCPIOTMSGDevBLE").setValue(SCPIOTMSG);
                sap.ui.getCore().byId("configSCPIOTCONTENTTYPEDevBLE").setValue(SCPIOTCTY);
                sap.ui.getCore().byId("configSCPIOTBEARERDevBLE").setValue(SCPIOTBRB);

                var SCPIOT4URL = localStorage.getItem("SCPIOT4URL");
                sap.ui.getCore().byId("configSCPIOT4URLDevBLE").setValue(SCPIOT4URL);

                // Google Map API Key
                var GMAPAPIKEY = localStorage.getItem("GMAPAPIKEY");
                sap.ui.getCore().byId("ConfigGMAPAPIKEYDevBLE").setValue(GMAPAPIKEY);

                // ByD Configuration
                var BYDURL = localStorage.getItem("BYDURL");
                var BYDUSR = localStorage.getItem("BYDUSR");
                var BYDPWD = localStorage.getItem("BYDPWD");
                var BYDBP = localStorage.getItem("BYDBP");

                sap.ui.getCore().byId("ConfigByDURLDevBLE").setValue(BYDURL);
                sap.ui.getCore().byId("ConfigByDUSERDevBLE").setValue(BYDUSR);
                sap.ui.getCore().byId("ConfigByDPASSWORDDevBLE").setValue(BYDPWD);
                sap.ui.getCore().byId("ConfigByDDefaultBPDevBLE").setValue(BYDBP);
            }

        },

        onItemSelect: function (oEvent) {
            var item = oEvent.getParameter('item');
            var viewId = this.getView().getId();

            if (item.getKey() === "Configuration") {
                this._oNavContainer.to(this._oConfigPage);
            } else if (item.getKey() === "Home") {
                this._oNavContainer.to(this._oHomePage);
            } else if (item.getKey() === "Scenario") {
                this._oNavContainer.to(this._oScenarioSelectionPage);
            } else if (item.getKey() === "Scenario1") {
                this._oNavContainer.to(this._oScenarioRetailSmartAssetPage);
            } else {
                sap.ui.getCore().byId(viewId + "--pageContainerDevBLE").to(viewId + "--" + item.getKey());
            }

            var toolPage = sap.ui.getCore().byId(viewId + "--toolPageDevBLE");
            toolPage.setSideExpanded(false);
        },

        onSideNavButtonPress: function () {
            var viewId = this.getView().getId();
            var toolPage = sap.ui.getCore().byId(viewId + "--toolPageDevBLE");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        }

    });

    return CController;
});

// JavaScript code for the TI SensorTag Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};
app.device = null;
app.view = null;

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the SensorTag wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds SensorTag UUIDs.
 */
app.sensortag = {};

// UUIDs for movement services and characteristics.
app.sensortag.MOVEMENT_SERVICE = 'f000aa80-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_DATA = 'f000aa81-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_CONFIG = 'f000aa82-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_PERIOD = 'f000aa83-0451-4000-b000-000000000000';
app.sensortag.MOVEMENT_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.IO_SERVICE = 'f000aa64-0451-4000-b000-000000000000';
app.sensortag.IO_DATA = 'f000aa65-0451-4000-b000-000000000000';
app.sensortag.IO_CONFIG = 'f000aa66-0451-4000-b000-000000000000';

app.sensortag.LUXOMETER_SERVICE = 'f000aa70-0451-4000-b000-000000000000';
app.sensortag.LUXOMETER_DATA = 'f000aa71-0451-4000-b000-000000000000';
app.sensortag.LUXOMETER_CONFIG = 'f000aa72-0451-4000-b000-000000000000';
app.sensortag.LUXOMETER_PERIOD = 'f000aa73-0451-4000-b000-000000000000';
app.sensortag.LUXOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.BAROMETER_SERVICE = 'f000aa40-0451-4000-b000-000000000000';
app.sensortag.BAROMETER_DATA = 'f000aa41-0451-4000-b000-000000000000';
app.sensortag.BAROMETER_CONFIG = 'f000aa42-0451-4000-b000-000000000000';
app.sensortag.BAROMETER_CALIBRATION = 'f000aa43-0451-4000-b000-000000000000';
app.sensortag.BAROMETER_PERIOD = 'f000aa44-0451-4000-b000-000000000000';
app.sensortag.BAROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.TEMPERATURE_SERVICE = 'f000aa00-0451-4000-b000-000000000000';
app.sensortag.TEMPERATURE_DATA = 'f000aa01-0451-4000-b000-000000000000';
app.sensortag.TEMPERATURE_CONFIG = 'f000aa02-0451-4000-b000-000000000000';
app.sensortag.TEMPERATURE_PERIOD = 'f000aa03-0451-4000-b000-000000000000';
app.sensortag.TEMPERATURE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.HUMIDITY_SERVICE = 'f000aa20-0451-4000-b000-000000000000';
app.sensortag.HUMIDITY_DATA = 'f000aa21-0451-4000-b000-000000000000';
app.sensortag.HUMIDITY_CONFIG = 'f000aa22-0451-4000-b000-000000000000';
app.sensortag.HUMIDITY_PERIOD = 'f000aa23-0451-4000-b000-000000000000';
app.sensortag.HUMIDITY_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

/**
 * Initialise the application.
 */
app.initialize = function () {
    document.addEventListener(
        'deviceready',
        function () {
            evothings.scriptsLoaded(app.onDeviceReady)
        },
        false);
};

app.B1SLSessionActiveCheck = function () {
    var URL = sap.ui.getCore().byId("ConfigSLURLDevBLE").getValue();

    // Make sure URLs are of correct standard
    if (URL.slice(-1) == '/') {
        URL = URL.slice(0, -1);
    }

    var B1SLSession = false;
    $.ajax({
        type: "GET",
        crossDomain: true,
        url: URL + "/b1s/v1/",
        xhrFields: {
            withCredentials: true
        },
        async: false,
        success: function () {
            B1SLSession = true;
        },
        error: function () {
            B1SLSession = false;
        }
    });

    return B1SLSession;
};

app.B1SLSessionRenewWithCallback = function (status, callback) {
    if (status) {
        callback();
    } else {
        var loginInfo = {};
        loginInfo.UserName = sap.ui.getCore().byId("ConfigSLUSERDevBLE").getValue();
        loginInfo.Password = sap.ui.getCore().byId("ConfigSLPASSWORDDevBLE").getValue();
        loginInfo.CompanyDB = sap.ui.getCore().byId("ConfigSLCOYDevBLE").getValue();
        var URL = sap.ui.getCore().byId("ConfigSLURLDevBLE").getValue();

        // Make sure URLs are of correct standard
        if (URL.slice(-1) == '/') {
            URL = URL.slice(0, -1);
        }

        $.ajax({
            type: "POST",
            crossDomain: true,
            url: URL + "/b1s/v1/Login",
            async: false,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(loginInfo),
            success: function (result) {
                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setType("Accept");
                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setIcon("sap-icon://connected");
                sap.m.MessageToast.show("B1 Session Renewed!");
                localStorage.setItem("B1SLCONNECTED", "YES");
            },
            error: function (error) {
                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setType("Reject");
                sap.ui.getCore().byId("btnConfigSBOSLTestDevBLE").setIcon("sap-icon://disconnected");
                sap.m.MessageToast.show("Something is wrong with your B1 configuration details. Please try again.");
            }
        });
        callback();
    }
};

app.onDeviceReady = function () {
    app.showInfo('Activate the SensorTag and tap Start.');
};

app.showInfo = function (info) {
    //     app.view.byId("statusDevBLE").setText(info);
};

app.addLog = function (log, stage) {
    var date = new Date().toLocaleString();

    // add notification item
    var x = new sap.m.NotificationListItem({
        title: stage,
        datetime: date,
        description: log,
        showCloseButton: false,
        unread: true,
        priority: "None",
        press: ""
    });
    sap.ui.getCore().byId("alertSensorLogGroupDevBLE").addItem(x);
};

app.addActivity = function (log, stage) {
    var date = new Date().toLocaleString();

    // add notification item
    var x = new sap.m.NotificationListItem({
        title: stage,
        datetime: date,
        description: log,
        showCloseButton: false,
        unread: true,
        priority: "Low",
        press: ""
    });
    sap.ui.getCore().byId("alertSensorActivityGroupDevBLE").addItem(x);
};

app.InsightToAction = function (value) {
    var insight = sap.ui.getCore().byId("InsightDevBLE").getValue();
    var action = sap.ui.getCore().byId("ActionDevBLE").getValue();
    var lowerCheck = sap.ui.getCore().byId("RB2-1DevBLE").getSelected();
    var limit = sap.ui.getCore().byId("scenario1InfoScenarioRuleLimitDevBLE").getValue();

    var B1URL = localStorage.getItem("B1SLURL");
    var SMSURL = localStorage.getItem("SMSALERTPHONENO");
    var ByDURL = localStorage.getItem("BYDURL");
    var ByDMsg = insight + " " + action;

    // Make sure URLs are of correct standard
    if (B1URL.slice(-1) == '/') {
        B1URL = B1URL.slice(0, -1);
    }

    if (ByDURL.slice(-1) == '/') {
        ByDURL = ByDURL.slice(0, -1);
    }

    var activity = {};
    var serviceCall = {};
    var scID = "";
    var msg = {};
    msg.Message = {};

    //  Rules Switch Activation State
    var rulesSwitchState = sap.ui.getCore().byId("switchRuleDevBLE").getState();

    if (rulesSwitchState) {
        switch (lowerCheck) {
            case true:
                // Lower Than
                if (value < limit) {
                    // 1. Trigger Sensor IO
                    app.onRed();

                    // 2. Add Activity & Message Alert in SAP Business One
                    // 2a. B1 Activity Payload
                    activity.Notes = insight;
                    activity.Details = action + " Lower Limit Triggered.";
                    activity.Priority = "pr_Normal";
                    activity.Activity = "cn_Task";

                    // 2b. Service Call Payload
                    serviceCall.CustomerCode = "C99998";
                    serviceCall.Subject = insight;
                    serviceCall.Description = action + " Lower Limit Triggered.";

                    function callback() {
                        $.ajax({
                            type: "POST",
                            crossDomain: true,
                            url: B1URL + "/b1s/v1/ServiceCalls",
                            xhrFields: {
                                withCredentials: true
                            },
                            async: false,
                            data: JSON.stringify(serviceCall),
                            success: function (result) {
                                scID = result.ServiceCallID;
                            }
                        });

                        $.ajax({
                            type: "POST",
                            crossDomain: true,
                            url: B1URL + "/b1s/v1/Activities",
                            xhrFields: {
                                withCredentials: true
                            },
                            data: JSON.stringify(activity),
                            success: function (result) {
                                var date = new Date().toLocaleString();
                               // Add Activity Log into App
                               app.addActivity("Limit: " + limit + ". Insight: " + insight + ". Action: " + action + ".", "B1 - Lower Limit Triggered");

                                // B1 Message Alert Payload
                                msg.Message.MessageDataColumns = [{
                                    "ColumnName": "Activity",
                                    "Link": "tYES",
                                    "MessageDataLines": [{
                                        "Object": "33",
                                        "ObjectKey": result.ActivityCode,
                                        "Value": "Activity " + result.ActivityCode + ". Open for more details."
                                    }]
                                }, {
                                    "ColumnName": "Service Call",
                                    "Link": "tYES",
                                    "MessageDataLines": [{
                                        "Object": "191",
                                        "ObjectKey": scID,
                                        "Value": "Service Call " + scID + ". Open for more details."
                                    }]
                                }];
                                msg.Message.RecipientCollection = [{
                                    "SendInternal": "tYES",
                                    "UserCode": "manager"
                                }];
                                msg.Message.Subject = "Activity and Service Call has been created";
                                msg.Message.Text = "Refer below for more info.";

                                $.ajax({
                                    type: "POST",
                                    crossDomain: true,
                                    url: B1URL + "/b1s/v1/MessagesService_SendMessage",
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    data: JSON.stringify(msg),
                                    success: function () {},
                                    error: function () {}
                                });

                                // add notification item
                                var x = new sap.m.NotificationListItem({
                                    title: "Asset Attention Required",
                                    datetime: date,
                                    description: "Activity Task #" + result.ActivityCode + " and Service Call #" + scID + " has been created. Please proceed to location to fix asset. Revert once completed.",
                                    showCloseButton: false,
                                    unread: true,
                                    priority: "High",
                                    press: "",
                                    buttons: [new sap.m.Button({
                                        text: "Complete",
                                        type: "Accept",
                                        press: function () {
                                            // 4. IO Switch back to Green
                                            app.onGreen();

                                            // 5. Update Activity when complete fixing
                                            var update = {};
                                            update.Closed = "tYES";
                                            $.ajax({
                                                type: "PATCH",
                                                crossDomain: true,
                                                url: B1URL + "/b1s/v1/Activities(" + result.ActivityCode + ")",
                                                xhrFields: {
                                                    withCredentials: true
                                                },
                                                data: JSON.stringify(update),
                                                success: function () {
                                                    // B1 Message Alert Payload
                                                    msg.Message.MessageDataColumns = [{
                                                        "ColumnName": "Activity",
                                                        "Link": "tYES",
                                                        "MessageDataLines": [{
                                                            "Object": "33",
                                                            "ObjectKey": result.ActivityCode,
                                                            "Value": "Activity " + result.ActivityCode + ". Open for more details."
                                                        }]
                                                    }];
                                                    msg.Message.RecipientCollection = [{
                                                        "SendInternal": "tYES",
                                                        "UserCode": "manager"
                                                    }];
                                                    msg.Message.Subject = "Alert Activity #" + result.ActivityCode + " has been resolved";
                                                    msg.Message.Text = "Refer to activity for more info.";

                                                    $.ajax({
                                                        type: "POST",
                                                        crossDomain: true,
                                                        url: B1URL + "/b1s/v1/MessagesService_SendMessage",
                                                        xhrFields: {
                                                            withCredentials: true
                                                        },
                                                        data: JSON.stringify(msg),
                                                        success: function () {},
                                                        error: function () {}
                                                    });

                                                    sap.ui.getCore().byId("alertSensorRemedyGroupDevBLE").removeItem(x); // set icon tab bar alert count
                                                    var count = parseInt(sap.ui.getCore().byId("scenario1AlertTab").getCount(), 10) - 1;
                                                    sap.ui.getCore().byId("scenario1AlertTab").setCount(count);
                                                    if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 5) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Negative");
                                                    } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 3) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Critical");
                                                    } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() < 3) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Default");
                                                    }
                                                },
                                                error: function () {}
                                            });

                                        }
                                    })]
                                });

                                sap.ui.getCore().byId("alertSensorRemedyGroupDevBLE").addItem(x);
                                // set icon tab bar alert count
                                var count = parseInt(sap.ui.getCore().byId("scenario1AlertTab").getCount(), 10) + 1;
                                sap.ui.getCore().byId("scenario1AlertTab").setCount(count);
                                if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 5) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Negative");
                                } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 3) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Critical");
                                } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() < 3) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Default");
                                }
                            },
                            error: function (error) {
                                
                            }
                        });
                    }

                    app.B1SLSessionRenewWithCallback(app.B1SLSessionActiveCheck(), callback);

                    // ByD Service Request Creation
                    var ByDFULLURL = ByDURL + "/sap/bc/srt/scs/sap/manageservicerequestin_v1";
                    var payload = '<?xml version="1.0" encoding="UTF-8"?> <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gdt="http://sap.com/xi/AP/Common/GDT" xmlns:glo="http://sap.com/xi/SAPGlobal20/Global" xmlns:glo2="http://sap.com/xi/A1S/Global" xmlns:glo4="http://sap.com/xi/DocumentServices/Global" xmlns:glo5="http://sap.com/xi/AP/CRM/Global"> <x:Header /> <x:Body> <glo:ServiceRequestBundleMaintainRequest_sync> <BasicMessageHeader /> <ServiceRequest ActionCode="01"> <BuyerID>' + localStorage.getItem("BYDBP") + '</BuyerID> <Name languageCode="EN">' + ByDMsg + '</Name> <BuyerParty> <PartyKey> <PartyID>' + localStorage.getItem("BYDBP") + '</PartyID> </PartyKey> </BuyerParty> <ServiceTerms> <ServicePriorityCode>3</ServicePriorityCode> </ServiceTerms> </ServiceRequest> </glo:ServiceRequestBundleMaintainRequest_sync> </x:Body> </x:Envelope>';

                    function b64EncodeUnicode(str) {
                        // first we use encodeURIComponent to get percent-encoded UTF-8,
                        // then we convert the percent encodings into raw bytes which
                        // can be fed into btoa.
                        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                            function toSolidBytes(match, p1) {
                                return String.fromCharCode('0x' + p1);
                            }));
                    }

                    var auth;
                    var UserName = sap.ui.getCore().byId("ConfigByDUSERDevBLE").getValue();
                    var Password = sap.ui.getCore().byId("ConfigByDPASSWORDDevBLE").getValue();

                    var auth = "Basic " + b64EncodeUnicode(UserName + ":" + Password);
                    $.ajax({
                        type: "POST",
                        url: ByDFULLURL,
                        xhrFields: {
                            withCredentials: true
                        },
                        headers: {
                            "Authorization": auth,
                            "Content-Type": "text/xml"
                        },
                        data: payload,
                        success: function (data, textStatus, jQxhr) {
                            app.addActivity("Limit: " + limit + ". Insight: " + insight + ". Action: " + action + ".", "ByD - Lower Limit Triggered");

                        },
                        error: function (jqXhr, textStatus, errorThrown) {

                        }
                    }).done(function (results) {
                    });
                }
                break;
            case false:
                // Higher Than
                if (value > limit) {
                    // 1. Trigger Sensor IO
                    app.onRed();
                    //  app.onBuz();

                    // 2a. Add Activity & Message Alert in SAP Business One
                    activity.Notes = insight;
                    activity.Details = action + " Higher Limit Triggered.";
                    activity.Priority = "pr_Normal";
                    activity.Activity = "cn_Task";

                    // 3b. Service Call Payload
                    serviceCall.CustomerCode = "C99998";
                    serviceCall.Subject = insight;
                    serviceCall.Description = action + " Higher Limit Triggered.";

                    function callback() {
                        $.ajax({
                            type: "POST",
                            crossDomain: true,
                            url: B1URL + "/b1s/v1/ServiceCalls",
                            xhrFields: {
                                withCredentials: true
                            },
                            async: false,
                            data: JSON.stringify(serviceCall),
                            success: function (result) {
                                scID = result.ServiceCallID;
                            }
                        });

                        $.ajax({
                            type: "POST",
                            crossDomain: true,
                            url: B1URL + "/b1s/v1/Activities",
                            xhrFields: {
                                withCredentials: true
                            },
                            data: JSON.stringify(activity),
                            success: function (result) {
                                var date = new Date().toLocaleString();
                               
                               // Add Activity Log into App
                               app.addActivity("Limit: " + limit + ". Insight: " + insight + ". Action: " + action + ".", "B1 - Higher Limit Triggered");

                                // B1 Message Alert Payload
                                msg.Message.MessageDataColumns = [{
                                    "ColumnName": "Activity",
                                    "Link": "tYES",
                                    "MessageDataLines": [{
                                        "Object": "33",
                                        "ObjectKey": result.ActivityCode,
                                        "Value": "Activity " + result.ActivityCode + ". Open for more details."
                                    }]
                                }, {
                                    "ColumnName": "Service Call",
                                    "Link": "tYES",
                                    "MessageDataLines": [{
                                        "Object": "191",
                                        "ObjectKey": scID,
                                        "Value": "Service Call " + scID + ". Open for more details."
                                    }]
                                }];
                                msg.Message.RecipientCollection = [{
                                    "SendInternal": "tYES",
                                    "UserCode": "manager"
                                }];
                                msg.Message.Subject = "Activity and Service Call has been created";
                                msg.Message.Text = "Refer below for more info.";

                                $.ajax({
                                    type: "POST",
                                    crossDomain: true,
                                    url: B1URL + "/b1s/v1/MessagesService_SendMessage",
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    data: JSON.stringify(msg),
                                    success: function () {},
                                    error: function () {}
                                });

                                // add notification item
                                var x = new sap.m.NotificationListItem({
                                    title: "Asset Attention Required",
                                    datetime: date,
                                    description: "Activity Task #" + result.ActivityCode + " and Service Call #" + scID + " has been created. Please proceed to location to fix asset. Revert once completed.",
                                    showCloseButton: false,
                                    unread: true,
                                    priority: "High",
                                    press: "",
                                    buttons: [new sap.m.Button({
                                        text: "Complete",
                                        type: "Accept",
                                        press: function () {
                                            // 4. IO Switch back to Green
                                            app.onGreen();

                                            // 5. Update Activity when complete fixing
                                            var update = {};
                                            update.Closed = "tYES";
                                            $.ajax({
                                                type: "PATCH",
                                                crossDomain: true,
                                                url: B1URL + "/b1s/v1/Activities(" + result.ActivityCode + ")",
                                                xhrFields: {
                                                    withCredentials: true
                                                },
                                                data: JSON.stringify(update),
                                                success: function () {
                                                    // B1 Message Alert Payload
                                                    msg.Message.MessageDataColumns = [{
                                                        "ColumnName": "Activity",
                                                        "Link": "tYES",
                                                        "MessageDataLines": [{
                                                            "Object": "33",
                                                            "ObjectKey": result.ActivityCode,
                                                            "Value": "Activity " + result.ActivityCode + ". Open for more details."
                                                        }]
                                                    }];
                                                    msg.Message.RecipientCollection = [{
                                                        "SendInternal": "tYES",
                                                        "UserCode": "manager"
                                                    }];
                                                    msg.Message.Subject = "Alert Activity #" + result.ActivityCode + " has been resolved";
                                                    msg.Message.Text = "Refer to activity for more info.";

                                                    $.ajax({
                                                        type: "POST",
                                                        crossDomain: true,
                                                        url: B1URL + "/b1s/v1/MessagesService_SendMessage",
                                                        xhrFields: {
                                                            withCredentials: true
                                                        },
                                                        data: JSON.stringify(msg),
                                                        success: function () {},
                                                        error: function () {}
                                                    });

                                                    sap.ui.getCore().byId("alertSensorRemedyGroupDevBLE").removeItem(x);
                                                    // set icon tab bar alert count
                                                    var count = parseInt(sap.ui.getCore().byId("scenario1AlertTab").getCount(), 10) - 1;
                                                    sap.ui.getCore().byId("scenario1AlertTab").setCount(count);
                                                    if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 5) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Negative");
                                                    } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 3) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Critical");
                                                    } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() < 3) {
                                                        sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Default");
                                                    }
                                                },
                                                error: function () {}
                                            });

                                        }
                                    })]
                                });

                                sap.ui.getCore().byId("alertSensorRemedyGroupDevBLE").addItem(x);
                                // set icon tab bar alert count
                                var count = parseInt(sap.ui.getCore().byId("scenario1AlertTab").getCount(), 10) + 1;
                                sap.ui.getCore().byId("scenario1AlertTab").setCount(count);
                                if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 5) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Negative");
                                } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() > 3) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Critical");
                                } else if (sap.ui.getCore().byId("scenario1AlertTab").getCount() < 3) {
                                    sap.ui.getCore().byId("scenario1AlertTab").setIconColor("Default");
                                }
                            },
                            error: function (error) {
                                //                               console.log(error);
                            }
                        });
                    }

                    app.B1SLSessionRenewWithCallback(app.B1SLSessionActiveCheck(), callback);

                    // ByD Service Request Creation
                    var ByDFULLURL = ByDURL + "/sap/bc/srt/scs/sap/manageservicerequestin_v1";
                    var payload = '<?xml version="1.0" encoding="UTF-8"?> <x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gdt="http://sap.com/xi/AP/Common/GDT" xmlns:glo="http://sap.com/xi/SAPGlobal20/Global" xmlns:glo2="http://sap.com/xi/A1S/Global" xmlns:glo4="http://sap.com/xi/DocumentServices/Global" xmlns:glo5="http://sap.com/xi/AP/CRM/Global"> <x:Header /> <x:Body> <glo:ServiceRequestBundleMaintainRequest_sync> <BasicMessageHeader /> <ServiceRequest ActionCode="01"> <BuyerID>' + localStorage.getItem("BYDBP") + '</BuyerID> <Name languageCode="EN">' + ByDMsg + '</Name> <BuyerParty> <PartyKey> <PartyID>' + localStorage.getItem("BYDBP") + '</PartyID> </PartyKey> </BuyerParty> <ServiceTerms> <ServicePriorityCode>3</ServicePriorityCode> </ServiceTerms> </ServiceRequest> </glo:ServiceRequestBundleMaintainRequest_sync> </x:Body> </x:Envelope>';

                    function b64EncodeUnicode(str) {
                        // first we use encodeURIComponent to get percent-encoded UTF-8,
                        // then we convert the percent encodings into raw bytes which
                        // can be fed into btoa.
                        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                            function toSolidBytes(match, p1) {
                                return String.fromCharCode('0x' + p1);
                            }));
                    }

                    var auth;

                    var UserName = sap.ui.getCore().byId("ConfigByDUSERDevBLE").getValue();
                    var Password = sap.ui.getCore().byId("ConfigByDPASSWORDDevBLE").getValue();

                    var auth = "Basic " + b64EncodeUnicode(UserName + ":" + Password); // "Basic X29zOkluaWNpbzAx"
                    //                    console.log(auth);
                    $.ajax({
                        type: "POST",
                        url: ByDFULLURL,
                        xhrFields: {
                            withCredentials: true
                        },
                        headers: {
                            "Authorization": auth,
                            "Content-Type": "text/xml"
                        },
                        data: payload,
                        success: function (data, textStatus, jQxhr) {
                            app.addActivity("Limit: " + limit + ". Insight: " + insight + ". Action: " + action + ".", "ByD - Higher Limit Triggered");

                        },
                        error: function (jqXhr, textStatus, errorThrown) {

                        }
                    }).done(function (results) {});

                }
                break;
            default:
                //
                break;
        }
    }
};

app.onStartButton = function () {
    app.onStopButton();
    app.startScan();
    app.addLog("Scanning...", "Start Button");
    app.startConnectTimer();
};

app.onStopButton = function () {
    // Stop any ongoing scan and close devices.
    app.stopConnectTimer();
    evothings.easyble.stopScan();
    evothings.easyble.closeConnectedDevices();

    // Sensor Connection Info & Button
    sap.ui.getCore().byId("scenario1FeedMsgConnectionOffDevBLE").setVisible(true);
    sap.ui.getCore().byId("scenario1FeedMsgConnectionOnDevBLE").setVisible(false);
    sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOffDevBLE").setVisible(true);
    sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOnDevBLE").setVisible(false);
    // sap.ui.getCore().byId("sensorTagStreamingDevBLE").setVisible(false);
    sap.ui.getCore().byId("sensorTagStreamingDevBLE").setColor("#C04A4A");

    // Tile State
    sap.ui.getCore().byId("luxTileDevBLE").setState("Loading");
    sap.ui.getCore().byId("moveTileDevBLE").setState("Loading");
    sap.ui.getCore().byId("posTileDevBLE").setState("Loading");
    sap.ui.getCore().byId("tempTileDevBLE").setState("Loading");
    sap.ui.getCore().byId("humidTileDevBLE").setState("Loading");

    app.addLog("Stopping...", "Stop Button");

    localStorage.setItem("SENSORCONNECTED", "off");
};

app.onRed = function () {
    app.device.writeCharacteristic(app.sensortag.IO_DATA,
        new Uint8Array([1]),
        function () {
            app.addLog("Writing Characteristics Ok.", "On Red Button");
        },
        function (errorCode) {
            app.addLog("Error on writing Characteristics. Error Code: " + errorCode, "On Red Button");
        });
};

app.onGreen = function () {
    app.device.writeCharacteristic(app.sensortag.IO_DATA,
        new Uint8Array([2]),
        function () {
            app.addLog("Writing Characteristics Ok.", "On Green Button");
        },
        function (errorCode) {
            app.addLog("Error on writing Characteristics. Error Code: " + errorCode, "On Green Button");
        });
};

app.onBuz = function () {
    app.device.writeCharacteristic(app.sensortag.IO_DATA,
        new Uint8Array([4]),
        function () {
            app.addLog("Writing Characteristics Ok.", "On Buz Button");
        },
        function (errorCode) {
            app.addLog("Error on writing Characteristics. Error Code: " + errorCode, "On Buz Button");
        });
};

app.onOff = function () {
    app.device.writeCharacteristic(app.sensortag.IO_DATA,
        new Uint8Array([0]),
        function () {
            app.addLog("Writing Characteristics Ok.", "On Off Button");
        },
        function (errorCode) {
            app.addLog("Error on writing Characteristics. Error Code: " + errorCode, "On Off Button");
        });
};

app.startConnectTimer = function () {
    // If connection is not made within the timeout
    // period, an error message is shown.
    app.connectTimer = setTimeout(
        function () {
            app.addLog("Waiting for SensorTag to be On.", "On Timer Started");
        },
        app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function () {
    clearTimeout(app.connectTimer);
}

app.startScan = function () {
    var oSensors = [];
    var oSensorsDevices = [];
    var oModel = new sap.ui.model.json.JSONModel();

    var oScanDialog = new sap.m.Dialog({
        title: 'List of Nearby Sensor Tag',

        content: new sap.m.List({
            //headerToolbar: new sap.m.Toolbar({content:[new sap.m.Title({text:"test2"}), new sap.m.Button({text:"test2"}), new sap.m.Button({text:"test2"})]}),
            infoToolbar: new sap.m.Toolbar({
                content: new sap.m.Label({
                    text: "Make sure your SensorTag is switched on."
                })
            }),
            items: {
                path: '/sensors',
                template: new sap.m.StandardListItem({
                    icon: "images/sensortag.png",
                    description: "{Address}",
                    title: "{SensorName}",
                    counter: "{Strength}",
                    type: "Active",
                    press: function (oEvent) {
                        //                                                                                          console.log(this.getDescription());
                        app.addLog("Device found: " + device.name + ".", "On Started Scan");
                        evothings.easyble.stopScan();
                        //                                                                                          console.log(oSensorsDevices[0]);
                        var sensorIndex = oSensors.findIndex(obj => obj.Address == this.getDescription());
                        app.device = oSensorsDevices[sensorIndex];
                        app.connectToDevice(oSensorsDevices[sensorIndex]);
                        app.stopConnectTimer();
                        oScanDialog.close();
                    }
                })
            }

        }),
        beginButton: new sap.m.Button({
            text: 'Stop Scan',
            press: function () {
                sap.ui.core.BusyIndicator.hide();
                //                                                           sap.m.MessageToast.show("");
                sap.ui.getCore().byId("switchSensorDevBLE").setState(false);
                oScanDialog.close();
                evothings.easyble.stopScan();

            }.bind(this)
        })
    });


    oScanDialog.open();
    evothings.easyble.startScan(
        function (device) {
            var newSensor = new Object();
            var sensorList = new Object();
            newSensor.SensorName = device.name;
            newSensor.Strength = device.rssi;
            newSensor.Address = device.address;

            if (device.name.indexOf('Sensor Tag') > -1 || device.name.indexOf('SensorTag') > -1) {
                if (oSensors.findIndex(obj => obj.Address == device.address) < 0) {
                    oSensors.push(newSensor);
                    oSensorsDevices.push(device);
                }
            }
            app.view.setModel(oModel);
            sensorList.sensors = oSensors;
            oModel.setData(sensorList);
        },
        function (errorCode) {
            app.addLog("Error: startScan on ErrorCode: " + errorCode + ".", "On Started Scan");
        }
    );
};

app.deviceIsSensorTag = function (device) {
    return (device != null) &&
        (device.name != null) &&
        (device.name.indexOf('Sensor Tag') > -1 ||
            device.name.indexOf('SensorTag') > -1);
};

/**
 * Read services for a device.
 */
app.connectToDevice = function (device) {
    app.addLog("Connecting to Device...", "On ConnectToDevice");
    device.connect(
        function (device) {
            app.addLog("Connected. About to Read Services...", "On ConnectToDevice");
            // Successfully connected
            // Sensor Connection Info & Button
            sap.ui.getCore().byId("scenario1FeedMsgConnectionOffDevBLE").setVisible(false);
            sap.ui.getCore().byId("scenario1FeedMsgConnectionOnDevBLE").setVisible(true);
            sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOffDevBLE").setVisible(false);
            sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOnDevBLE").setVisible(true);
            // sap.ui.getCore().byId("sensorTagStreamingDevBLE").setVisible(true);
            sap.ui.getCore().byId("sensorTagStreamingDevBLE").setColor("#4AC05E");

            sap.m.MessageToast.show("Connected to SensorTag. Started Streaming.");
            sap.ui.core.BusyIndicator.hide();

            // Tile State
            sap.ui.getCore().byId("luxTileDevBLE").setState("Loaded");
            sap.ui.getCore().byId("moveTileDevBLE").setState("Loaded");
            sap.ui.getCore().byId("posTileDevBLE").setState("Loaded");
            sap.ui.getCore().byId("tempTileDevBLE").setState("Loaded");
            sap.ui.getCore().byId("humidTileDevBLE").setState("Loaded");

            app.readServices(device);
        },
        function (errorCode) {
            app.addLog("Error: Connection failed: " + errorCode + ".", "On ConnectToDevice");
            // Unsuccessfully connected
            // Sensor Connection Info & Button
            sap.ui.getCore().byId("scenario1FeedMsgConnectionOffDevBLE").setVisible(true);
            sap.ui.getCore().byId("scenario1FeedMsgConnectionOnDevBLE").setVisible(false);
            sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOffDevBLE").setVisible(true);
            sap.ui.getCore().byId("btnScenario1StatsInfoConnectionOnDevBLE").setVisible(false);
            // sap.ui.getCore().byId("sensorTagStreamingDevBLE").setVisible(false);
            sap.ui.getCore().byId("sensorTagStreamingDevBLE").setColor("#C04A4A");

            sap.m.MessageToast.show("Error Connecting to SensorTag. Please try again.");

            // Tile State
            sap.ui.getCore().byId("luxTileDevBLE").setState("Loading");
            sap.ui.getCore().byId("moveTileDevBLE").setState("Loading");
            sap.ui.getCore().byId("posTileDevBLE").setState("Loading");
            sap.ui.getCore().byId("tempTileDevBLE").setState("Loading");
            sap.ui.getCore().byId("humidTileDevBLE").setState("Loading");

            evothings.ble.reset();
        });
};

app.readServices = function (device) {
    device.readServices(
        [
            app.sensortag.IO_SERVICE,
            app.sensortag.MOVEMENT_SERVICE,
            app.sensortag.BAROMETER_SERVICE,
            app.sensortag.LUXOMETER_SERVICE,
            app.sensortag.TEMPERATURE_SERVICE,
            app.sensortag.HUMIDITY_SERVICE
        ],

        app.startNotifications,
        function (errorCode) {
            app.addLog("Error: Failed to read services: " + errorCode + ".", "On ReadServices");
        }

    );

};

app.startNotifications = function (device) {
    app.addLog("Success: Read Services.", "On Before Starting Notifications");
    app.startIONotification(device);
    app.startLuxometerNotification(device);
    app.startAccelerometerNotification(device);
    app.startTempNotification(device);
    app.startHumidNotification(device);
    localStorage.setItem("SENSORCONNECTED", "streaming");
};

app.startIONotification = function (device) {
    app.device.writeCharacteristic(app.sensortag.IO_DATA,
        new Uint8Array([2]),
        function () {
            app.addLog("Success: Written Characteristic.", "On IO Note, Write IO_DATA");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On IO Note, Write IO_DATA");
        });

    // Config: remote mode.
    device.writeCharacteristic(app.sensortag.IO_CONFIG,
        new Uint8Array([1]),
        function () {
            app.addLog("Success: Written Characteristic.", "On IO Note, Write IO_CONFIG");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On IO Note, Write IO_CONFIG");
        });

    // Data values
    //1 = red
    //2 = green
    //3 = red + green
    //4 = buzzer
    //5 = red + buzzer
    //6 = green + buzzer
    //7 = all
};

app.startTempNotification = function (device) {
    device.writeCharacteristic(
        app.sensortag.TEMPERATURE_CONFIG,
        new Uint8Array([1]),
        function () {
            app.addLog("Success: Written Characteristic.", "On TENP Note, Write TEMP_CONFIG");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On TEMP Note, Write TEMP_CONFIG");
        });

    device.writeCharacteristic(
        app.sensortag.TEMPERATURE_PERIOD,
        new Uint8Array([500]),
        function () {
            app.addLog("Success: Written Characteristic.", "On TEMP Note, Write TEMP_PERIOD");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On TEMP Note, Write TEMP_PERIOD");
        });

    device.writeDescriptor(
        app.sensortag.TEMPERATURE_DATA,
        app.sensortag.TEMPERATURE_NOTIFICATION, // Notification descriptor.
        new Uint8Array([1, 0]),
        function () {
            app.addLog("Success: Written Descriptor.", "On TEMP Note, Write TEMP_DATA");
        },
        function (errorCode) {
            // This error will happen on iOS, since this descriptor is not
            // listed when requesting descriptors. On iOS you are not allowed
            // to use the configuration descriptor explicitly. It should be
            // safe to ignore this error.
            app.addLog("Error on writeDescriptor. ErrorCode: " + errorCode + ".", "On TEMP Note, Write TEMP_DATA");
        });

    device.enableNotification(
        app.sensortag.TEMPERATURE_DATA,
        function (data) {
            var dataArray = new Uint8Array(data);
            //  app.addLog("Success: Enabled Notification. Starting to get LUX Values.","On LUX Note, Write LUXOMETER_DATA");
            var values = app.getTempValues(dataArray);
        },
        function (errorCode) {
            app.addLog("Error on enableNotification. ErrorCode: " + errorCode + ".", "On TEMP Note, Write TEMP_DATA");
        });
};

app.startHumidNotification = function (device) {
    device.writeCharacteristic(
        app.sensortag.HUMIDITY_CONFIG,
        new Uint8Array([1]),
        function () {
            app.addLog("Success: Written Characteristic.", "On HUMID Note, Write HUMIDITY_CONFIG");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On HUMID Note, Write HUMIDITY_CONFIG");
        });

    device.writeCharacteristic(
        app.sensortag.HUMIDITY_PERIOD,
        new Uint8Array([300]),
        function () {
            app.addLog("Success: Written Characteristic.", "On HUMID Note, Write HUMIDITY_PERIOD");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On HUMID Note, Write HUMIDITY_PERIOD");
        });

    device.writeDescriptor(
        app.sensortag.HUMIDITY_DATA,
        app.sensortag.HUMIDITY_NOTIFICATION, // Notification descriptor.
        new Uint8Array([1, 0]),
        function () {
            app.addLog("Success: Written Descriptor.", "On HUMID Note, Write HUMIDITY_DATA");
        },
        function (errorCode) {
            // This error will happen on iOS, since this descriptor is not
            // listed when requesting descriptors. On iOS you are not allowed
            // to use the configuration descriptor explicitly. It should be
            // safe to ignore this error.
            app.addLog("Error on writeDescriptor. ErrorCode: " + errorCode + ".", "On HUMID Note, Write HUMIDITY_DATA");
        });

    device.enableNotification(
        app.sensortag.HUMIDITY_DATA,
        function (data) {
            var dataArray = new Uint8Array(data);
            //  app.addLog("Success: Enabled Notification. Starting to get LUX Values.","On LUX Note, Write LUXOMETER_DATA");
            var values = app.getHumidValues(dataArray);
        },
        function (errorCode) {
            app.addLog("Error on enableNotification. ErrorCode: " + errorCode + ".", "On HUMID Note, Write HUMIDITY_DATA");
        });
};

app.startLuxometerNotification = function (device) {
    // Luxometer Configuration

    device.writeCharacteristic(
        app.sensortag.LUXOMETER_CONFIG,
        new Uint8Array([1]),
        function () {
            app.addLog("Success: Written Characteristic.", "On LUX Note, Write LUXOMETER_CONFIG");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On LUX Note, Write LUXOMETER_CONFIG");
        });

    device.writeCharacteristic(
        app.sensortag.LUXOMETER_PERIOD,
        new Uint8Array([200]),
        function () {
            app.addLog("Success: Written Characteristic.", "On LUX Note, Write LUXOMETER_PERIOD");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On LUX Note, Write LUXOMETER_PERIOD");
        });

    device.writeDescriptor(
        app.sensortag.LUXOMETER_DATA,
        app.sensortag.LUXOMETER_NOTIFICATION, // Notification descriptor.
        new Uint8Array([1, 0]),
        function () {
            app.addLog("Success: Written Descriptor.", "On LUX Note, Write LUXOMETER_DATA");
        },
        function (errorCode) {
            // This error will happen on iOS, since this descriptor is not
            // listed when requesting descriptors. On iOS you are not allowed
            // to use the configuration descriptor explicitly. It should be
            // safe to ignore this error.
            app.addLog("Error on writeDescriptor. ErrorCode: " + errorCode + ".", "On LUX Note, Write LUXOMETER_DATA");
        });

    device.enableNotification(
        app.sensortag.LUXOMETER_DATA,
        function (data) {
            var dataArray = new Uint8Array(data);
            //  app.addLog("Success: Enabled Notification. Starting to get LUX Values.","On LUX Note, Write LUXOMETER_DATA");
            var values = app.getLuxometerValues(dataArray);
        },
        function (errorCode) {
            app.addLog("Error on enableNotification. ErrorCode: " + errorCode + ".", "On LUX Note, Write LUXOMETER_DATA");
        });
};

app.startAccelerometerNotification = function (device) {
    // Set accelerometer configuration to ON.
    // magnetometer on: 64 (1000000) (seems to not work in ST2 FW 0.89)
    // 3-axis acc. on: 56 (0111000)
    // 3-axis gyro on: 7 (0000111)
    // 3-axis acc. + 3-axis gyro on: 63 (0111111)
    // 3-axis acc. + 3-axis gyro + magnetometer on: 127 (1111111)
    device.writeCharacteristic(
        app.sensortag.MOVEMENT_CONFIG,
        new Uint8Array([56, 0]),
        function () {
            app.addLog("Success: Written Characteristic.", "On MOVE Note, Write MOVEMENT_CONFIG");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On MOVE Note, Write MOVEMENT_CONFIG");
        });

    // Set accelerometer period to 100 ms.
    device.writeCharacteristic(
        app.sensortag.MOVEMENT_PERIOD,
        new Uint8Array([100]),
        function () {
            app.addLog("Success: Written Characteristic.", "On MOVE Note, Write MOVEMENT_PERIOD");
        },
        function (errorCode) {
            app.addLog("Error on writeCharacteristic. ErrorCode: " + errorCode + ".", "On MOVE Note, Write MOVEMENT_PERIOD");
        });

    // Set accelerometer notification to ON.
    device.writeDescriptor(
        app.sensortag.MOVEMENT_DATA,
        app.sensortag.MOVEMENT_NOTIFICATION, // Notification descriptor.
        new Uint8Array([1, 0]),
        function () {
            app.addLog("Success: Written Descriptor.", "On MOVE Note, Write MOVEMENT_DATA");
        },
        function (errorCode) {
            // This error will happen on iOS, since this descriptor is not
            // listed when requesting descriptors. On iOS you are not allowed
            // to use the configuration descriptor explicitly. It should be
            // safe to ignore this error.
            app.addLog("Error on writeDescriptor. ErrorCode: " + errorCode + ".", "On MOVE Note, Write MOVEMENT_DATA");
        });

    // Start accelerometer notification.
    device.enableNotification(
        app.sensortag.MOVEMENT_DATA,
        function (data) {
            //  app.addLog("Success: Enabled Notification. Starting to get MOVE Values.","On MOVE Note, Write MOVEMENT_DATA");
            var dataArray = new Uint8Array(data);
            var values = app.getAccelerometerValues(dataArray);
        },
        function (errorCode) {
            app.addLog("Error on enableNotification. ErrorCode: " + errorCode + ".", "On MOVE Note, Write MOVEMENT_DATA");
        });
};

app.getHumidValues = function (data) {
    // Calculate the humidity temperature (Celsius).
    //    var tData = evothings.util.littleEndianToInt16(data, 0);
    //    var tc = -46.85 + 175.72 / 65536.0 * tData;

    // Calculate the relative humidity.
    var hData = (evothings.util.littleEndianToInt16(data, 2) & ~0x03);
    var h = -6.0 + 125.00 / 65536.0 * hData;

    // Return result.
    // return { humidityTemperature: tc, relativeHumidity: h }
    //    alert("H " + tc.toFixed(2));
    app.view.byId("humidNumDevBLE").setValue(h.toFixed(0));
};

app.getTempValues = function (data) {
    // Calculate ambient temperature (Celsius).
    var ac = evothings.util.littleEndianToUint16(data, 2) / 128.0;

    // Calculate target temperature (Celsius).
    var tc = evothings.util.littleEndianToInt16(data, 0);
    tc = (tc >> 2) * 0.03125;

    // Return result.
    // return { ambientTemperature: ac, targetTemperature: tc }
    // alert("T " + tc.toFixed(2) + "A " + ac.toFixed(2) + '&deg; C ');
    app.view.byId("tempNumDevBLE").setValue(ac.toFixed(2));

    if (app.view.byId("selectTriggerType").getSelectedKey() == "temp") {
        app.InsightToAction(ac.toFixed(2));
    }
};

/**
 * Calculate accelerometer values from raw data for SensorTag 2.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function (data) {
    var divisors = {
        x: -16384.0,
        y: 16384.0,
        z: -16384.0
    };

    // Calculate accelerometer values.
    var ax = evothings.util.littleEndianToInt16(data, 6) / divisors.x;
    var ay = evothings.util.littleEndianToInt16(data, 8) / divisors.y;
    var az = evothings.util.littleEndianToInt16(data, 10) / divisors.z;

    var axx = ax.toFixed(3);
    var ayy = ay.toFixed(3);
    var azz = az.toFixed(3);

    app.view.byId("xTileDevBLE").setValue(parseFloat(axx));
    app.view.byId("yTileDevBLE").setValue(parseFloat(ayy));
    app.view.byId("zTileDevBLE").setValue(parseFloat(azz));

    if (ax > 0 && ay > 0 && az < 0) {
        app.view.byId("posNumDevBLE").setSrc("sap-icon://arrow-bottom");
    } else if (ax < 0 && ay > 0 && az > 0) {
        app.view.byId("posNumDevBLE").setSrc("sap-icon://arrow-top");
    } else if (ax > 0 && ay < 0 && az > 0) {
        app.view.byId("posNumDevBLE").setSrc("sap-icon://arrow-right");
    } else if (ax > 0 && ay > 0 && az > 0) {
        app.view.byId("posNumDevBLE").setSrc("sap-icon://arrow-left");
    }

    // Return result.
    return {
        x: ax,
        y: ay,
        z: az
    };
};

app.getLuxometerValues = function (data) {
    // Calculate the light level.
    var value = evothings.util.littleEndianToUint16(data, 0)

    // Extraction of luxometer value, based on sfloatExp2ToDouble
    // from BLEUtility.m in Texas Instruments TI BLE SensorTag
    // iOS app source code.
    var mantissa = value & 0x0FFF;
    var exponent = value >> 12;
    var magnitude = Math.pow(2, exponent);
    var output = (mantissa * magnitude);
    var lux = output / 100.0;

    var oldVal = sap.ui.getCore().byId("luxNumDevBLE").getValue();

    if (oldVal < lux) {
        app.view.byId("luxNumDevBLE").setIndicator("Down");
    } else {
        app.view.byId("luxNumDevBLE").setIndicator("Up");
    }

    if (lux < 50) {
        app.view.byId("luxNumDevBLE").setValueColor("Error");

    } else {
        app.view.byId("luxNumDevBLE").setValueColor("Good");
    }

    app.view.byId("luxNumDevBLE").setValue(lux);

    if (app.view.byId("selectTriggerType").getSelectedKey() == "light") {
        app.InsightToAction(lux);
    }

    // Return result.
    return lux;
};
