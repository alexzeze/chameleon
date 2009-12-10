GO.addressbook.ManageAddressbooksGrid = function(config){
	
	if(!config)
	{
		config = {};
	}
	
	config.title = GO.addressbook.lang.addressbooks;
	config.layout='fit';
	config.autoScroll=true;
	config.split=true;
	config.store = GO.addressbook.writableAddressbooksStore
	
	
	
	
	config.paging=true;

	var companiesColumnModel =  new Ext.grid.ColumnModel([
	  {
	  	header: GO.lang['strName'], 
	  	dataIndex: 'name'
	  },
	  {
	  	header: GO.addressbook.lang['cmdOwner'], 
	  	dataIndex: 'owner' ,
	  	sortable: false
	  }
	]);
	companiesColumnModel.defaultSortable = true;
	config.cm=companiesColumnModel;
	
	config.view=new Ext.grid.GridView({
		autoFill: true,
		forceFit: true,
		emptyText: GO.addressbook.lang.noAddressbooks		
	}),
	config.sm=new Ext.grid.RowSelectionModel();
	config.loadMask=true;
	
	this.addressbookDialog = new GO.addressbook.AddressbookDialog();
	this.addressbookDialog.on('save', function(){
		GO.addressbook.writableAddressbooksStore.load();	
		GO.addressbook.readableAddressbooksStore.load();	
	});
	
	config.tbar=[
			{ 
				iconCls: 'btn-add', 
				text: GO.lang.cmdAdd, 
				cls: 'x-btn-text-icon', 
				handler: function(){
					this.addressbookDialog.show();
				},
				disabled: !GO.settings.modules.addressbook.write_permission,
				scope: this
			},
			{
				iconCls: 'btn-delete', 
				text: GO.lang.cmdDelete, 
				cls: 'x-btn-text-icon', 
				handler: function(){
					this.deleteSelected();
				}, 
				disabled: !GO.settings.modules.addressbook.write_permission,
				scope: this
			}
		];
	
	GO.addressbook.ManageAddressbooksGrid.superclass.constructor.call(this, config);
	
	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);	
		
		this.addressbookDialog.show(record);
		
		}, this);
};


Ext.extend(GO.addressbook.ManageAddressbooksGrid, GO.grid.GridPanel,{
	
	afterRender : function()
	{
		GO.addressbook.ManageAddressbooksGrid.superclass.afterRender.call(this);
		
		if(!GO.addressbook.writableAddressbooksStore.loaded)
		{
			GO.addressbook.writableAddressbooksStore.load();
		}

	},
	
	onShow : function(){
		GO.addressbook.ManageAddressbooksGrid.superclass.onShow.call(this);
		if(!GO.addressbook.writableAddressbooksStore.loaded)
		{
			GO.addressbook.writableAddressbooksStore.load();
		}
	}
	
});
