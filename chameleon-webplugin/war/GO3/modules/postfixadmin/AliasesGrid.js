/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: GridPanel.tpl 1858 2008-04-29 14:09:19Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.postfixadmin.AliasesGrid = function(config){
	
	if(!config)
	{
		config = {};
	}
	
	config.title = GO.postfixadmin.lang.aliases;
	config.layout='fit';
	config.autoScroll=true;
	config.split=true;
	config.store = new GO.data.JsonStore({
	    url: GO.settings.modules.postfixadmin.url+ 'json.php',
	    baseParams: {
	    	task: 'aliases'
	    	},
	    root: 'results',
	    id: 'id',
	    totalProperty:'total',
	    fields: ['id','address','goto','ctime','mtime','active'],
	    remoteSort: true
	});
	config.disabled=true;
	config.paging=true;
	var columnModel =  new Ext.grid.ColumnModel([
	   		{
			header: GO.postfixadmin.lang.address, 
			dataIndex: 'address'
		},		{
			header: GO.postfixadmin.lang.goto_address, 
			dataIndex: 'goto'
		},		{
			header: GO.lang.strCtime, 
			dataIndex: 'ctime'
		},		{
			header: GO.lang.strMtime, 
			dataIndex: 'mtime'
		},		{
			header: GO.postfixadmin.lang.active, 
			dataIndex: 'active'
		}
	]);
	columnModel.defaultSortable = true;
	config.cm=columnModel;
	
	config.view=new Ext.grid.GridView({
		autoFill: true,
		forceFit: true,
		emptyText: GO.lang['strNoItems']		
	});
	config.sm=new Ext.grid.RowSelectionModel();
	config.loadMask=true;
	
	
	this.aliasDialog = new GO.postfixadmin.AliasDialog();
	    			    		
		this.aliasDialog.on('save', function(){   
			this.store.reload();	    			    			
		}, this);
	
	
	config.tbar=[{
			iconCls: 'btn-add',							
			text: GO.lang['cmdAdd'],
			cls: 'x-btn-text-icon',
			handler: function(){
				
	    	this.aliasDialog.show();
	    	
	    	
	    	
			},
			scope: this
		},{
			iconCls: 'btn-delete',
			text: GO.lang['cmdDelete'],
			cls: 'x-btn-text-icon',
			handler: function(){
				this.deleteSelected();
			},
			scope: this
		}];
	
	
	
	GO.postfixadmin.AliasesGrid.superclass.constructor.call(this, config);
	
	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);	
		
		this.aliasDialog.show(record.data.id);
		
		}, this);
	
};

Ext.extend(GO.postfixadmin.AliasesGrid, GO.grid.GridPanel,{
	onShow : function(){
		//if(!this.store.loaded)
		//{
			this.store.load();
		//}
		
		GO.postfixadmin.AliasesGrid.superclass.onShow.call(this);
	},
	
	setDomainId : function(domain_id)
	{
		this.store.baseParams.domain_id=domain_id;
		this.store.loaded=false;
		this.aliasDialog.formPanel.baseParams.domain_id=domain_id;
		this.setDisabled(domain_id<1);
	}
});