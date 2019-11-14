sap.ui.define(["jt/resolute/iot/controller/BaseController", "sap/m/MessageBox",
	"sap/m/MessageToast", 'sap/ui/model/Filter', 'sap/m/Dialog',
	'sap/m/Button',
], function (BaseController, MessageBox, MessageToast,
	Filter, Dialog, Button) {
	"use strict";

	return BaseController.extend("jt.resolute.iot.controller.Login", {

		onInit: function (oEvent) {},

		onAfterRendering: function () {
			var view = this.getView();
		},

		onWebBLE: function (oEvent) {
			jQuery.sap.delayedCall(1000, this, function () {
				this.getRouter().navTo("appMainWebBLE");
			});

		},

		onDevBLE: function (oEvent) {
			//  sap.ui.core.BusyIndicator.show(0);
			var firstPage = this.getView().byId("crsOnboard").getPages()[0].sId;
			jQuery.sap.delayedCall(1000, this, function () {
				this.getRouter().navTo("appMainDevBLE");
			});
			jQuery.sap.delayedCall(2000, this, function () {
				this.getView().byId("crsOnboard").setActivePage(firstPage);
			});
		}

	});

});