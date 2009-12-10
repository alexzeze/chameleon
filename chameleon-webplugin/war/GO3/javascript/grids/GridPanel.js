/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: GridPanel.js 1456 2008-11-21 13:19:17Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
/**
 * @class GO.grid.GridPanel
 * @extends Ext.grid.GridPanel
 * This class represents the primary interface of a component based grid control.
 * 
 * This extension of the default Ext grid implements some basic Group-Office functionality
 * like deleting items.
 *  
 * <br><br>Usage:
 * <pre><code>var grid = new Ext.grid.GridPanel({
    store: new Ext.data.Store({
        reader: reader,
        data: xg.dummyData
    }),
    columns: [
        {id:'company', header: "Company", width: 200, sortable: true, dataIndex: 'company'},
        {header: "Price", width: 120, sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
        {header: "Change", width: 120, sortable: true, dataIndex: 'change'},
        {header: "% Change", width: 120, sortable: true, dataIndex: 'pctChange'},
        {header: "Last Updated", width: 135, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y'), dataIndex: 'lastChange'}
    ],
    viewConfig: {
        forceFit: true
    },
    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
    width:600,
    height:300,
    frame:true,
    title:'Framed with Checkbox Selection and Horizontal Scrolling',
    iconCls:'icon-grid'
});</code></pre>
 * <b>Note:</b> Although this class inherits many configuration options from base classes, some of them
 * (such as autoScroll, layout, items, etc) won't function as they do with the base Panel class.<br>
 * <br>
 * To access the data in a Grid, it is necessary to use the data model encapsulated
 * by the {@link #store Store}. See the {@link #cellclick} event.
 * @constructor
 * @param {Object} config The config object
 */
 
GO.grid.GridPanel = function(config)
{	
	if(!config)
	{
		config={};
	}
	
	if(!config.keys)
	{
		config.keys=[];
	}
	
	if(!config.store)
	{
		config.store=config.ds;
	}
	
	config.keys.push({
        key: Ext.EventObject.DELETE,
        fn: function(key, e){
        	//sometimes there's a search input in the grid, so dont delete when focus is on an input
        	if(e.target.tagName!='INPUT')               	
        		this.deleteSelected(this.deleteConfig);
        },
        scope:this
    });	
    
	if(config.paging)
  {
  	if(!config.bbar)
  	{
  		config.bbar = new Ext.PagingToolbar({
  					cls: 'go-paging-tb',
	          store: config.store,
	          pageSize: parseInt(GO.settings['max_rows_list']),
	          displayInfo: true,
	          displayMsg: GO.lang['displayingItems'],
	          emptyMsg: GO.lang['strNoItems']
	      });
  	}
    
    if(!config.store.baseParams)
    {
    	config.store.baseParams={};
    }
    config.store.baseParams['limit']=parseInt(GO.settings['max_rows_list']);
  }
    
	GO.grid.GridPanel.superclass.constructor.call(this, config);
	
	if(!this.deleteConfig)
	{
		this.deleteConfig={};
	}
	
	
	//create a delayed rowselect event so that when a user repeatedly presses the
	//up and down button it will only load if it stays on the same record for 400ms
	this.addEvents({'delayedrowselect':true});
	
	this.on("rowcontextmenu", function(grid, rowIndex, e) {
		e.stopEvent();
		
		this.rowClicked=true;
		
		var sm =this.getSelectionModel();
    if(sm.isSelected(rowIndex) !== true) {
      sm.clearSelections();
      sm.selectRow(rowIndex);
    }
	}, this);
	
	this.on('rowclick', function(grid, rowIndex, e){
		
		if(!e.ctrlKey && !e.shiftKey)
		{
			var record = this.getSelectionModel().getSelected();
			this.fireEvent('delayedrowselect', this, rowIndex, record);
		}		
		this.rowClicked=true;
	}, this);
	  	
  this.getSelectionModel().on("rowselect",function(sm, rowIndex, r){
		if(!this.rowClicked)
		{
			var record = this.getSelectionModel().getSelected();	
			if(record==r)
			{
				this.fireEvent('delayedrowselect', this, rowIndex, r);
			}
		}
		this.rowClicked=false;
	}, this, {delay:400});
}
 
 
Ext.extend(GO.grid.GridPanel, Ext.grid.GridPanel, {
	
	/**
	 * @cfg {Boolean} paging True to set the store's limit parameter and render a bottom
	 * paging toolbar.
	 */
	 
	paging : false,
	/**
	 * Sends a delete request to the remote store. It will send the selected keys in json 
	 * format as a parameter. (delete_keys by default.)
	 * 
	 * @param {Object} options An object which may contain the following properties:<ul>
     * <li><b>deleteParam</b> : String (Optional)<p style="margin-left:1em">The name of the
     * parameter that will send to the store that holds the selected keys in JSON format.
     * Defaults to "delete_keys"</p>
     * </li>
	 * 
	 */
	deleteSelected : function(config){
		
		if(!config)
		{
			config=this.deleteConfig;
		}
		
		if(!config['deleteParam'])
		{
			config['deleteParam']='delete_keys';
		}
		
		var selectedRows = this.selModel.selections.keys;
		
		var params={}
		params[config.deleteParam]=Ext.encode(this.selModel.selections.keys);
		
		var deleteItemsConfig = {
			store:this.store,
			params: params,
			count: this.selModel.selections.keys.length	
		};
		
		if(config.callback)
		{
		  deleteItemsConfig['callback']=config.callback;		
		}
		if(config.success)
		{
		  deleteItemsConfig['success']=config.success;		
		}
		if(config.failure)
		{
		  deleteItemsConfig['failure']=config.failure;		
		}
		if(config.scope)
		{
		  deleteItemsConfig['scope']=config.scope;
		}
		
	
		GO.deleteItems(deleteItemsConfig);		
	},
	
	getGridData : function(){
		
		var data = {};
		
		for (var i = 0; i < this.store.data.items.length;  i++)
		{
			var r = this.store.data.items[i].data;
			
			data[i]={};
			
			for(var key in r)
			{
				data[i][key]=r[key];
			}	
		}
		
		return data;		
	},
	
	numberRenderer : function(v)
	{
		return GO.util.numberFormat(v);
	}
});