GO.addressbook.ContactsGrid = function(config){

	if(!config)
	{
		config = {};
	}

	config.paging=true;
	config.border=false;

	var actions = new Ext.ux.grid.RowActions({
	     header:"Actions",
						 /*width:25,*/
						 //      hideMode:"display",
						 actions:[
						 {
						      //iconIndex:"edit",
						 iconCls:"icon-ob",
						 qtip:"Open Item",
						 style:'background-color:yellow',
						 tooltip:'Open',
						 callback:function(grid, records, action, groupId) {
						      //Ext.ux.Toast.msg('Callback: icon-add-table', 'Group: <b>{0}</b>, action: <b>{1}</b>, records: <b>{2}</b>', groupId, action, records.length);
						      var location = window.location.href;
						      //////console.log(location);
						      //////console.log(location.slice(0));
						      var splitter = location.split("?");
						      //alert(splitter[0]);
						      window.open(splitter[0] + '/../../redirect.do?url=' + records.json.url, "dspace");
						      //////console.log(grid);
						      //////console.log(records);
						      //////console.log(action);
						      //////console.log(groupId);
						 }

						 //text:"Edit"
						 }
						 ]
	});
	var expander = new Ext.grid.RowExpander({
	     tpl : new Ext.Template(
	     '<div style="float:left;">',
				    '<img title="{title}" style="padding-right: 20px; width: 120px; height: 120px;" type="{url}" class="{collection}" src="../images/categories/{collection}.jpg" alt="{title}"/>',
				    '</div><div style="/*float: left;*/ padding-left: 1em;">',
				    '<p><b>Title:</b> {title}</p><br>',
				    '<p><b>'+'description'+': '+':</b> {description}</p>',
				    '<p><b>Bitstreams [File(s)]:</b></p><br />{bitstreams}',
				    '</div><br style="clear: both;"/>'
				    )
	});


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
	     columns : [new Ext.grid.RowNumberer({header:'No'/*,width:20*/}),expander,
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
		    {id:'description', header: 'Description', dataIndex: 'description', sortable: true, tooltip:'the description of the item', filter: {xtype:"textfield", filterName: "description", selectOnFocus:true, id:'description_field', width: 'auto'}},
		    actions
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
					     type: 'dspace'
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

	var contactsColumnModel =  new Ext.grid.ColumnModel(fields.columns);
	contactsColumnModel.defaultSortable = true;
	config.cm=contactsColumnModel;
	plugins: [new Ext.ux.grid.GridHeaderFilters(), actions, expander];

	config.view=new Ext.grid.GridView({
		autoFill: true,
		forceFit: true,
		emptyText: GO.lang.strNoItems
	}),
	config.sm=new Ext.grid.RowSelectionModel();
	config.loadMask=true;

	config.enableDragDrop=true;
	config.ddGroup='AddressBooksDD';

	GO.addressbook.ContactsGrid.superclass.constructor.call(this, config);

	this.on('rowdblclick', function(grid, rowIndex){
		var record = grid.getStore().getAt(rowIndex);

		//GO.addressbook.contactDialog.show(record.data.id);
		var location = window.location.href;
		//////console.log(location);
		//////console.log(location.slice(0));
		var splitter = location.split("?");
		//alert(splitter[0]);
		window.open(splitter[0] + '/../../redirect.do?url=' + record.data.url, "dspace");

		}, this);

};


Ext.extend(GO.addressbook.ContactsGrid, GO.grid.GridPanel, {

	loaded : false,

	afterRender : function()
	{
		GO.addressbook.ContactsGrid.superclass.afterRender.call(this);

		if(this.isVisible())
		{
			this.onGridShow();
		}
	},
	onGridShow : function()
	{
		if(!this.loaded && this.rendered)
		{
			this.store.load();
			this.loaded=true;
		}
	}
});
