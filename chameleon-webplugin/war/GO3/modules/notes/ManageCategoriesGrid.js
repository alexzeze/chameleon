/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: ManageCategoriesGrid.js 2592 2009-05-26 15:25:26Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.notes.ManageCategoriesGrid = function(config){
	
	if(!config)
	{
		config = {};
	}
	
	config.layout='fit';
	config.autoScroll=true;
	config.split=true;
	config.store = GO.notes.writableCategoriesStore;
	
	config.border=false;
	
	config.paging=true;

	

	var columnModel =  new Ext.grid.ColumnModel([
	  {
			header: GO.lang.strName, 
			dataIndex: 'name'
		},{
			header: GO.lang.strOwner, 
			dataIndex: 'user_name',
		  sortable: false
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
	
	
	this.categoryDialog = new GO.notes.CategoryDialog();
	    			    		
		this.categoryDialog.on('save', function(){   
			this.store.reload();
			this.changed=true;	    			    			
		}, this);
	
	
	config.tbar=[{
			iconCls: 'btn-add',							
			text: GO.lang['cmdAdd'],
			cls: 'x-btn-text-icon',
			disabled:!GO.settings.modules.notes.write_permission,
			handler: function(){				
	    	this.categoryDialog.show();	    	
			},
			scope: this
		},{

			iconCls: 'btn-delete',
			text: GO.lang['cmdDelete'],
			cls: 'x-btn-text-icon',
			disabled:!GO.settings.modules.notes.write_permission,
			handler: function(){
				this.deleteSelected();
				this.changed=true;				
			},
			scope: this
		}];
	
	
	
	GO.notes.ManageCategoriesGrid.superclass.constructor.call(this, config);
	
	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);	
		
		this.categoryDialog.show(record.data.id);
		
		}, this);
	
};


Ext.extend(GO.notes.ManageCategoriesGrid, GO.grid.GridPanel,{
	changed : false
});