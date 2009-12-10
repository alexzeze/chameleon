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
 
GO.postfixadmin.DomainsGrid = function(config){
	
	if(!config)
	{
		config = {};
	}
	
	config.layout='fit';
	config.autoScroll=true;
	config.split=true;
	config.store = new GO.data.JsonStore({
	    url: GO.settings.modules.postfixadmin.url+ 'json.php',
	    baseParams: {
	    	task: 'domains'
	    	},
	    root: 'results',
	    id: 'id',
	    totalProperty:'total',
	    fields: ['id','user_name','domain','description','aliases','mailboxes','maxquota','quota','transport','backupmx','ctime','mtime','active','acl_read','acl_write'],
	    remoteSort: true
	});
	
	config.paging=true;
	var columnModel =  new Ext.grid.ColumnModel([
	   			{
			header: GO.postfixadmin.lang.domain, 
			dataIndex: 'domain'
		},	{
			header: GO.lang.strOwner, 
			dataIndex: 'user_name',
		  sortable: false
		},		{
			header: GO.lang.strDescription, 
			dataIndex: 'description'
		},		{
			header: GO.postfixadmin.lang.aliases, 
			dataIndex: 'aliases'
		},		{
			header: GO.postfixadmin.lang.mailboxes, 
			dataIndex: 'mailboxes'
		},		{
			header: GO.postfixadmin.lang.maxquota, 
			dataIndex: 'maxquota'
		},		{
			header: GO.postfixadmin.lang.quota, 
			dataIndex: 'quota'
		},	{
			header: GO.postfixadmin.lang.active, 
			dataIndex: 'active'
		},		{
			header: GO.postfixadmin.lang.backupmx, 
			dataIndex: 'backupmx'
		},	{
			header: GO.lang.strCtime, 
			dataIndex: 'ctime'
		},		{
			header: GO.lang.strMtime, 
			dataIndex: 'mtime'
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
	
	
	GO.postfixadmin.domainDialog = this.domainDialog = new GO.postfixadmin.DomainDialog();
	    			    		
	this.domainDialog.on('save', function(){   
		this.store.reload();	    			    			
	}, this);
	
	this.searchField = new GO.form.SearchField({
		store: config.store,
		width:320
  });
	
	
	if(GO.settings.modules.postfixadmin.write_permission)
	{
		config.tbar=new Ext.Toolbar({		
			cls:'go-head-tb',
			items: [{
			iconCls: 'btn-add',							
			text: GO.lang['cmdAdd'],
			cls: 'x-btn-text-icon',
			handler: function(){				
	    	this.domainDialog.show();
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
		},GO.lang['strSearch']+': ', ' ',this.searchField]});
	}
	
	
	
	GO.postfixadmin.DomainsGrid.superclass.constructor.call(this, config);
	
	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);	
		
		this.domainDialog.show(record.data.id);
		
		}, this);
	
};

Ext.extend(GO.postfixadmin.DomainsGrid, GO.grid.GridPanel,{
	afterRender : function(){
		this.store.load();
		GO.postfixadmin.DomainsGrid.superclass.afterRender.call(this);
	}
});