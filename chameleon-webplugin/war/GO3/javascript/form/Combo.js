/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: Combo.js 2845 2009-07-16 13:00:15Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.form.ComboBox = Ext.extend(Ext.form.ComboBox, {

	/**
	 * A combobox is often loaded remotely on demand. But you want to display the
	 * correct text even before the store is loaded. When a form loads I also
	 * supply the text and call this function to display it when the record is not
	 * available.
	 *
	 * @param {String} remote text
	 */
	setRemoteText : function(text)
	{
		var r = this.findRecord(this.valueField, this.value);
		if(!r)
		{
			var comboRecord = Ext.data.Record.create([{
				name: this.valueField
			},{
				name: this.displayField
			}]);

			var recordData = {};
			recordData[this.valueField]=this.value;
			recordData[this.displayField]=text;

			var currentRecord = new comboRecord(recordData);
			this.store.add(currentRecord);
            
			this.setValue(this.value);
		}
	},

	/**
	 * Small override to help the setRemoteText value when it is called before
	 * rendering.
	 */

	initValue : function(){
		GO.form.ComboBox.superclass.initValue.call(this);
		this.setRawValue(this.lastSelectionText);
	},

	/**
	 * Selects the first record of the associated store
	 */
	
	selectFirst : function(){
		if(this.store.getCount())
		{
			var records = this.store.getRange(0,1);
			this.setValue(records[0].get(this.valueField));
		}
	},

	/**
	 * Clears the last search action. Usefull when you change a baseParam of the
	 * combo store and the cache prevents you searching the server.
	 */
	clearLastSearch : function(){
		this.lastQuery=false;
		this.hasSearch=false;
	}
});

Ext.reg('combo', GO.form.ComboBox);