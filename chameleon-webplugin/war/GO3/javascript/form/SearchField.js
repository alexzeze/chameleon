/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: SearchField.js 2359 2009-04-16 10:02:25Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.form.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        GO.form.SearchField.superclass.initComponent.call(this);
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
        
        this.on('focus', function(){this.focus(true);}, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    //hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'query',

    onTrigger1Click : function(){
        if(this.hasSearch){
            //this.store.baseParams['start']=0;
            this.store.baseParams[this.paramName]='';
            this.store.load();
            this.el.dom.value = '';
            //this.triggers[0].hide();
            this.hasSearch = false;
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
        //this.store.baseParams['start']=0;
        this.store.baseParams[this.paramName]=v;
        this.store.load();
        this.hasSearch = true;
        //this.triggers[0].show();
    },afterRender:function(){
			GO.form.SearchField.superclass.afterRender.call(this);
			if(Ext.isIE8)this.el.setTop(1);
		},setValue : function(v){
			GO.form.SearchField.superclass.setValue.call(this, v);
			if(v!='')
			{					
				this.hasSearch=true;
				if(this.rendered)
				{
					//this.triggers[0].show();
				}
			}
		}
});