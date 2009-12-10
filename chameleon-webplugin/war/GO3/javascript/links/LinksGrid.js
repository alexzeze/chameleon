/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LinksGrid.js 2834 2009-07-14 14:02:50Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.grid.LinksGrid = function(config){
	
	var linksDialog;
	
	//Ext.apply(this, config);
	
	if(!config)
	{
		config={};
	}
	
	if(!config.link_id)
	{
		config.link_id=0;
	}
	
	if(!config.link_type)
	{
		config.link_type=0;
	}
	
	if(!config.folder_id)
	{
		config.folder_id=0;
	}
	
	//was required to show the search field in the tbar
	config.hideMode='offsets';
	
	config['store'] = new GO.data.JsonStore({

			url: BaseHref+'json.php',			
			baseParams: {task: "links", link_id: this.link_id, link_type: this.link_type, folder_id: this.folder_id},
			root: 'results',
			totalProperty: 'total',
			id: 'link_and_type',
			fields: ['icon','link_and_type', 'link_type','name','type','url','mtime','id','module', 'description', 'iconCls', 'link_description'],
			remoteSort: true
		});
	config['store'].setDefaultSort('mtime', 'desc');

	if(!config.noSearchField)
	{
		this.searchField = new GO.form.SearchField({
								store: config.store,
								width:320
						  });
	
	config['tbar']=[
	            GO.lang['strSearch']+': ', ' ',this.searchField
	            ];
	}
	
	config.clicksToEdit = 1;

	config.enableDragDrop=true;
	config.ddGroup='LinksDD';
	
	config['columns'] = [{
		      header: "",
		      hideable:false,
		      width:28,
					dataIndex: 'icon',
					renderer: this.iconRenderer
		    },{
		      header: GO.lang['strName'],
					dataIndex: 'name',
					css: 'white-space:normal;',
					sortable: true
		    },{
			    header: GO.lang['strDescription'],
					dataIndex: 'link_description',
			    sortable:true,
			    editor : new GO.form.LinkDescriptionField()
		   	},{
			    header: GO.lang['strType'],
					dataIndex: 'type',
			    sortable:true,
			    hidden:true			    
		   	},{
		      header: GO.lang['strMtime'],
					dataIndex: 'mtime',
		      sortable:true,
		      width:80
		    }];
		    
		    
	
	//config.autoExpandMax=2500;
	//config.autoExpandColumn=1;	
	
	config.bbar = new Ext.PagingToolbar({
  					cls: 'go-paging-tb',
	          store: config.store,
	          pageSize: parseInt(GO.settings['max_rows_list']),
	          displayInfo: true,
	          displayMsg: GO.lang['displayingItems'],
	          emptyMsg: GO.lang['strNoItems']
	      });
	      
	config['layout']='fit';
	config['view']=new Ext.grid.GridView({
		enableRowBody:true,
		showPreview:true,
		autoFill:true,
		forceFit:true,
		emptyText:GO.lang.strNoItems,
		getRowClass : function(record, rowIndex, p, store){
	    if(this.showPreview && record.data.description.length){
	        p.body = '<div class="go-links-panel-description">'+record.data.description+'</div>';
	        return 'x-grid3-row-expanded';
	    }
	    return 'x-grid3-row-collapsed';
		}
	});

  config['loadMask']={msg: GO.lang['waitMsgLoad']};
  config['sm']=new Ext.grid.RowSelectionModel({});
  

  GO.grid.LinksGrid.superclass.constructor.call(this, config);
  
  this.addEvents({
  	folderOpened : true, 
  	folderDrop : true
  	});
  	
}

Ext.extend(GO.grid.LinksGrid, Ext.grid.EditorGridPanel, {
	
	write_permission : false,
	
	afterRender : function(){
		
		GO.grid.LinksGrid.superclass.afterRender.call(this);
		
  	var DDtarget = new Ext.dd.DropTarget(this.getView().mainBody, 
		{
			ddGroup : 'LinksDD',
			copy:false,
			notifyOver : this.onGridNotifyOver,
			notifyDrop : this.onGridNotifyDrop.createDelegate(this)
		});
		
		this.on('afteredit', function(e) {
			
			Ext.Ajax.request({
				url:GO.settings.config.host+'action.php',
				params:{
					task:'updatelink',
					link_id1: this.store.baseParams.link_id,
					link_type1: this.store.baseParams.link_type,
					link_id2:e.record.get("id"),
					link_type2:e.record.get("link_type"),
					description:e.record.get("link_description")
				},
				success: function(response, options)
				{
					var responseParams = Ext.decode(response.responseText);
					if(!responseParams.success)
					{	
						alert(responseParams.feedback);
					}else
					{
						this.store.commitChanges();
					}				
				},
				scope:this				
			})
			
		}, this);
		
	},
	
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
	
	onGridNotifyOver : function(dd, e, data){
			var dragData = dd.getDragData(e);
			if(data.grid && this.write_permission)
			{
  			var dropRecord = data.grid.store.data.items[dragData.rowIndex];
  			if(dropRecord)
    		{
  				if(dropRecord.data.link_type=='folder')
  				{
  					return this.dropAllowed;
  				}
				}
			}
			return false;
	},

	onGridNotifyDrop : function(dd, e, data)
	{
	  if(data.grid && this.write_permission)
		{
			var sm=data.grid.getSelectionModel();
			var rows=sm.getSelections();
			var dragData = dd.getDragData(e);
			
			var dropRecord = data.grid.store.data.items[dragData.rowIndex];
			
			if(dropRecord.data.link_type=='folder')
	    {
				this.fireEvent('folderDrop', this, data.selections, dropRecord);
	    }
		}else
		{
		  return false;
		}
	},
	
	iconRenderer : function(src,cell,record){
		return '<div class=\"go-icon ' + record.data.iconCls +' \"></div>';
	}
});