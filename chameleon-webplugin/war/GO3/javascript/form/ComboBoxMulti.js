/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: ComboBoxMulti.js 1109 2008-10-09 08:52:45Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
/**
 * @class GO.form.ComboBoxMulti
 * @extends GO.form.ComboBox
 * Adds freeform multiselect and duplicate entry prevention to the standard combobox
 * @constructor
 * Create a new ComboBoxMulti.
 * @param {Object} config Configuration options
 */
GO.form.ComboBoxMulti = function(config){
    /**
     * @cfg {String} sep is used to separate text entries
     */
    /**
     * @cfg {Boolean} preventDuplicates indicates whether repeated selections of the same option will generate extra entries
     */

		if(!config.sep)
		{
			config.sep=',';
		}
    
    // this option will interfere will expected operation
    config.typeAhead = false;
    // these options customize behavior
    config.minChars = 2;
    config.hideTrigger = true;
    config.defaultAutoCreate = {
        tag: "textarea",
        autocomplete: "off"
    };
    
    GO.form.ComboBoxMulti.superclass.constructor.call(this, config);
    
    this.on('focus', function(){this.focused=true;}, this);
    this.on('blur', function(){this.focused=false;}, this);
};

Ext.extend(GO.form.ComboBoxMulti, Ext.form.ComboBox, {
		focused : false,
		
    getCursorPosition: function(){
		
	    if (document.selection) { // IE
	        var r = document.selection.createRange();
	        var d = r.duplicate();
	        d.moveToElementText(this.el.dom);
	        d.setEndPoint('EndToEnd', r);
	        return d.text.length;            
	    }
	    else {
	        return this.el.dom.selectionEnd;
	    }
    },
    
    getActiveRange: function(){
        var s = this.sep;
        var p = this.getCursorPosition();
        var v = this.getRawValue();
        var left = p;
        while (left > 0 && v.charAt(left) != s) {
            --left;
        }
        if (left > 0) {
            left++;
        }
        return {
            left: left,
            right: p
        };
    },
    
    getActiveEntry: function(){
        var r = this.getActiveRange();
        return this.getRawValue().substring(r.left, r.right).replace(/^s+|s+$/g, '');
    },
    
    replaceActiveEntry: function(value){
        var r = this.getActiveRange();
        var v = this.getRawValue();
        if (this.preventDuplicates && v.indexOf(value) >= 0) {
            return;
        }
        var pad = (this.sep == ' ' ? '' : ' ');
        this.setValue(v.substring(0, r.left) + (r.left > 0 ? pad : '') + value + this.sep + pad + v.substring(r.right));
        var p = r.left + value.length + 2 + pad.length;
        this.selectText.defer(200, this, [p, p]);
    },
    
    onSelect: function(record, index){
        if (this.fireEvent('beforeselect', this, record, index) !== false) {
            var value = Ext.util.Format.htmlDecode(record.data[this.valueField || this.displayField]);
            if (this.sep) {
                this.replaceActiveEntry(value);
            }
            else {
                this.setValue(value);
            }
            this.collapse();
            this.fireEvent('select', this, record, index);
        }
    },
    
    initQuery: function(){
    	if(this.focused)
			{
        this.doQuery(this.sep ? this.getActiveEntry() : this.getRawValue());
			}
    }
});
