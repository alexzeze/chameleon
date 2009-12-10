/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: SelectGroups.js 2300 2009-04-09 14:13:36Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
 /**
 * @class GO.dialog.SelectGroups
 * @extends Ext.Window
 * A window to select a number of Group-Office user groups.
 * 
 * @cfg {Function} handler A function called when the Add or Ok button is clicked. The grid will be passed as argument.
 * @cfg {Object} scope The scope of the handler
 * 
 * @constructor
 * @param {Object} config The config object
 */
 
GO.dialog.SelectGroups = function(config){
	
	Ext.apply(this, config);
	

	this.store = new GO.data.JsonStore({
       	url: BaseHref+'json.php',
        root: 'results',
		totalProperty: 'total',
		id: 'id',
		fields: ['id','name','user_id','user_name'],
		remoteSort: true,
        baseParams: {task: 'groups'}
    });
    
   
    
	
	this.grid = new GO.grid.GridPanel({
			paging:true,
			border:false,
		    store: this.store,
		    view: new Ext.grid.GridView({
	    		autoFill: true,
	    		forceFit: true}),
		    columns: [{
		       	header: GO.lang['strName'],
				dataIndex: 'name',
				css: 'white-space:normal;',
				sortable: true
		    }],
		    sm: new Ext.grid.RowSelectionModel()			
		});
		
	this.grid.on('rowdblclick', function(){this.callHandler(true);}, this);
		
	this.store.load();

	
	Ext.Window.superclass.constructor.call(this, {
    	layout: 'fit',
		modal:false,
		height:400,
		width:600,
		closeAction:'hide',
		title:GO.lang['strSelectGroups'],
		items: this.grid,
		buttons: [
			{
				text: GO.lang['cmdOk'],
				handler: function (){
					this.callHandler(true);
				},
				scope:this
			},
			{
				text: GO.lang['cmdAdd'],
				handler: function (){
					this.callHandler(false);
				},
				scope:this
			},
			{
				text: GO.lang['cmdClose'],
				handler: function(){this.hide();},
				scope: this
			}
		],
		keys: [{
            key: Ext.EventObject.ENTER,
            fn: function (){
				this.callHandler(true);
			},
            scope:this
        }]
    });
};

Ext.extend(GO.dialog.SelectGroups, Ext.Window, {

	//private
	callHandler : function(hide){
		if(this.handler)
		{
			if(!this.scope)
			{
				this.scope=this;
			}
			
			var handler = this.handler.createDelegate(this.scope, [this.grid]);
			handler.call();
		}
		if(hide)
		{
			this.hide();
		}
	}	
	
});


