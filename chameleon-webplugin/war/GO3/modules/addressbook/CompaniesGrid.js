GO.addressbook.CompaniesGrid = function(config){

	if(!config)
	{
		config = {};
	}
	config.border=false;
	config.paging=true;

	var fields ={
	     fields: [
		    {name: 'id', mapping: 'url'},
		    {name: 'issue_date', type: 'date', mapping: 'issue_date', dateFormat: 'Y/m/d'},
		    {name: 'author', type: 'string'},
		    {name: 'title', type: 'string'},
		    {name: 'url', type: 'string'},
		    {name: 'bitstreams', type: 'string'},
		    {name: 'collection', type: 'string'},
		    {name: 'description', type: 'string', mapping: 'details'}
	     ],
	     columns : [
		    {id:'id', header: 'id', dataIndex: 'id', hidden: true },
		    {id:'issue_date', header: 'Issue Date', dataIndex: 'issue_date', width: 80, renderer: Ext.util.Format.dateRenderer('M d Y'), locked:false, sortable: true, tooltip:'Date of issue', filter: {xtype: "daterangefield", width: 70,
		    filterEncoder: function(value)
		    {
			 if(value.begin == "" && value.end == ""){
			      return "";
			 }else{
			      return value.begin + " TO " + value.end;
			 }

		    },
		    filterDecoder: function(value)
		    {
			 return value;
		    }
		    , filterName: 'dop', id:'date_issue', allowBlank: true} },
		    {id:'author', header: 'Author(s)', dataIndex: 'author', sortable: true, filter: {xtype:"textfield", filterName:"author", selectOnFocus:true, id:'author_field', width: 'auto'}, tooltip: 'the author(s) of the item'},
		    {id:'title', header: 'Title', dataIndex: 'title', sortable: true, filter: {xtype:"textfield", filterName: "title", selectOnFocus:true, id:'title_field', width: 'auto'}, tooltip: 'the title of the item'},
		    {id:'description', header: 'Description', dataIndex: 'description', sortable: true, tooltip:'the description of the item', filter: {xtype:"textfield", filterName: "description", selectOnFocus:true, id:'description_field', width: 'auto'}}
	     ]
	}

	if(GO.customfields)
	{
	     GO.customfields.addColumns(2, fields);
	}
	config.store = new GO.data.JsonStore({
		    url: '../index.do',//GO.settings.modules.addressbook.url+ 'json.php',
					     method: 'POST',
					     //baseParams: {task: 'contacts', enable_mailings_filter:true},
					     baseParams: {
						  method:   'post',
					     type: 'koha'
					     },
					     paramNames:
					     {
						  start: "start",//"page",    // The parameter name which specifies the start row
					     limit: "rows",    // The parameter name which specifies number of rows to return
					     sort: "sidx",      // The parameter name which specifies the column to sort on
					     dir: "sord"		   // The parameter name which specifies the sort direction
					     },
					     root: 'searchResults',
					     id: 'url',
					     totalProperty:'maxResults',
					     fields: fields.fields,
					     remoteSort: true
});

	var companiesColumnModel =  new Ext.grid.ColumnModel(fields.columns);
	companiesColumnModel.defaultSortable = true;
	config.cm=companiesColumnModel;

	config.view=new Ext.grid.GridView({
		autoFill: true,
		forceFit: true,
		emptyText: GO.lang.strNoItems
	}),
	config.sm=new Ext.grid.RowSelectionModel();
	config.loadMask=true;

	config.enableDragDrop=true;
	config.ddGroup='AddressBooksDD';

	GO.addressbook.CompaniesGrid.superclass.constructor.call(this, config);

	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);

		GO.addressbook.companyDialog.show(record.data.id);
		}, this);

};


Ext.extend(GO.addressbook.CompaniesGrid, GO.grid.GridPanel, {

	loaded : false,



	afterRender : function()
	{
		GO.addressbook.CompaniesGrid.superclass.afterRender.call(this);

		if(this.isVisible())
		{
			this.onGridShow();
		}
	},

	onGridShow : function(){
		if(!this.loaded && this.rendered)
		{
			this.store.load();
			this.loaded=true;
		}
	}
});
