/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: MainPanel.js 2760 2009-07-02 09:06:38Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */


GO.addressbook.MainPanel = function(config)
{

	if(!config)
	{
		config={};
	}

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
						   '<div style="padding-left: 45px;"><div style="float:left;">',
									  '<img title="{title}" style="padding-right: 20px; width: 120px; height: 120px;" type="{url}" class="{collection}" src="../images/categories/{collection}.jpg" alt="{title}"/>',
									  '</div><div style="/*float: left;*/ padding-left: 1em;" class="itemdetails">',
									  '<p><b class="itemdetails">Title:</b> {title}</p><br />',
									  '<p><b class="itemdetails">'+'description'+': '+':</b> {description}</p>',
									  '</div><br style="clear: both;"/>',
									  '<p style="background-color: transparent;"><b class="itemdetails">Bitstreams [File(s)]:</b></p><br />{bitstreams}</div>'
									  )
});

  this.contactsGrid = new GO.addressbook.ContactsGrid({
  	layout: 'fit',
  	region: 'center',
						      enableColLock: true,
						      stripeRows: true,
        plugins: [new Ext.ux.grid.GridHeaderFilters(), actions, expander],
  	id: 'ab-contacts-grid-panel'
  });

  this.contactsGrid.on("delayedrowselect",function(grid, rowIndex, r){
  //this.contactsGrid.getSelectionModel().on("rowselect",function(sm, rowIndex, r){
				this.contactEastPanel.load(r.get('id'));
		}, this);

	this.contactsGrid.store.on('load', function(){
		this.setAdvancedSearchNotification(this.contactsGrid.store);
	}, this);

  this.companiesGrid = new GO.addressbook.CompaniesGrid({
  	layout: 'fit',
  	region: 'center',
							enableColLock: true,
							stripeRows: true,
	plugins: [new Ext.ux.grid.GridHeaderFilters()],
  	id: 'ab-company-grid-panel'
  });

  this.companiesGrid.on("delayedrowselect",function(grid, rowIndex, r){
			this.companyEastPanel.load(r.get('id'));
		}, this);


	this.companiesGrid.store.on('load', function(){
		this.setAdvancedSearchNotification(this.companiesGrid.store);
	}, this);



	this.searchPanel = new GO.addressbook.SearchPanel({
		region: 'north',
		ab:this
	});

	this.searchPanel.on('queryChange', function(params){
		this.setSearchParams(params);
	}, this);

	this.contactEastPanel = new GO.addressbook.ContactReadPanel({
		region : 'east',
		title: GO.addressbook.lang['cmdPanelContact'],
		width:420
	});

	this.companyEastPanel = new GO.addressbook.CompanyReadPanel({
		region : 'east',
		title: GO.addressbook.lang['cmdPanelCompany'],
		width:420
	});

	this.contactsPanel = new Ext.Panel({
  	id: 'ab-contacts-grid',
  	title: 'Dspace',//GO.addressbook.lang.contacts,
  	layout: 'border',
  	items:[
  		this.contactsGrid,
  		this.contactEastPanel
  	]
  });
	this.contactsPanel.on("show", function(){
		this.contactsGrid.onGridShow();
		this.setAdvancedSearchNotification(this.contactsGrid.store);
		this.addressbooksGrid.setType('contact');
	}, this);

	this.companyPanel = new Ext.Panel({
	    	id: 'ab-company-grid',
	    	title: 'Koha',//GO.addressbook.lang.companies,
	    	layout: 'border',
	    	items:[
		    	this.companiesGrid,
		    	this.companyEastPanel
	    	]
	    });

	this.companyPanel.on("show",this.companiesGrid.onGridShow, this.companiesGrid);

	this.companyPanel.on("show", function(){
		this.companiesGrid.onGridShow();
		this.setAdvancedSearchNotification(this.companiesGrid.store);
		this.addressbooksGrid.setType('company');
	}, this);


	this.addressbooksGrid = new GO.addressbook.AddresbooksGrid({
		region:'west',
		id:'ab-addressbook-grid',
		width:180
	});

	this.addressbooksGrid.on('rowclick', function(grid, rowIndex){
			var record = grid.getStore().getAt(rowIndex);
			alert('rowclick');
			this.setSearchParams({addressbook_id : record.get("id")});
	}, this);


	this.addressbooksGrid.on('drop', function(type)
	{
		if(type == 'company')
		{
			this.companiesGrid.store.reload();
		}else
		{
			this.contactsGrid.store.reload();
		}
	}, this);

	this.tabPanel = new Ext.TabPanel({
    region : 'center',
    activeTab: 0,
					 deferredRender:false,
  	border: true,
    items: [
	    this.contactsPanel,
	    this.companyPanel
    ]
	});

	config.layout='border';
	config.border=false;
	config.id='ab-tbar';

	if(GO.mailings)
	{
		this.mailingsFilterPanel = new GO.mailings.MailingsFilterPanel({
			region:'center'
		});

		/*GO.mailings.readableMailingsStore.on('load', function(){
			if(GO.mailings.readableMailingsStore.getCount()==0)
			{
				this.mailingsFilterPanel.hide();
			}else
			{
				this.mailingsFilterPanel.show();
			}
		}, this);*/

		this.mailingsFilterPanel.on('change', function(grid, mailings_filter){
			var panel = this.tabPanel.getActiveTab();
			if(panel.id=='ab-contacts-grid')
			{
				this.contactsGrid.store.baseParams.mailings_filter = Ext.encode(mailings_filter);
				this.contactsGrid.store.load();
				delete this.contactsGrid.store.baseParams.mailings_filter;
			}else
			{
				this.companiesGrid.store.baseParams.mailings_filter = Ext.encode(mailings_filter);
				this.companiesGrid.store.load();
				delete this.companiesGrid.store.baseParams.mailings_filter;
			}
		}, this);

		this.addressbooksGrid.region='north';
		this.addressbooksGrid.height=200;
		var westPanel = new Ext.Panel({
			layout:'border',
			border:false,
			region:'west',
			width:180,
			split:true,
			items:[this.addressbooksGrid,this.mailingsFilterPanel]
		});
		/*config.items= [
			this.searchPanel,
			westPanel,
			this.tabPanel
		];*/
	}else
	{
		config.items= [
			this.searchPanel,
			//this.addressbooksGrid,
			this.tabPanel
		];
	}
	config.items= [
	       this.searchPanel,
	       //this.addressbooksGrid,
	       this.tabPanel
	];

	var tbar=[
		/*{
			iconCls: 'btn-addressbook-add-contact',
			text: GO.addressbook.lang['btnAddContact'],
			cls: 'x-btn-text-icon',
			handler: function(){
				GO.addressbook.contactDialog.show(0);
				this.tabPanel.setActiveTab('ab-contacts-grid');
			},
			scope: this
		},
		{
			iconCls: 'btn-addressbook-add-company',
			text: GO.addressbook.lang['btnAddCompany'],
			cls: 'x-btn-text-icon',
			handler: function(){
				GO.addressbook.companyDialog.show(0);
					this.tabPanel.setActiveTab('ab-company-grid');
			},
			scope: this
		},*/
		{
			iconCls: 'btn-delete',
			text: GO.lang['cmdDelete'],
			cls: 'x-btn-text-icon',
			handler: function(){
				var activetab = this.tabPanel.getActiveTab();

				switch(activetab.id)
				{
					case 'ab-contacts-grid':
						this.contactsGrid.deleteSelected({
								callback : this.contactEastPanel.gridDeleteCallback,
								scope: this.contactEastPanel
							});
					break;
					case 'ab-company-grid':
						this.companiesGrid.deleteSelected({
								callback : this.companyEastPanel.gridDeleteCallback,
								scope: this.companyEastPanel
							});
					break;
				}
			},
			scope: this
		},
		'-',
		{
			iconCls: 'btn-addressbook-manage',
			text: GO.addressbook.lang['btnManage'],
			cls: 'x-btn-text-icon',
			handler:function(){
				if(!this.manageDialog)
				{
					this.manageDialog = new GO.addressbook.ManageDialog();
				}
				this.manageDialog.show();
			},
			scope: this
		}/*,{
			iconCls: 'btn-export',
			text: GO.lang.cmdExport,
			cls: 'x-btn-text-icon',
			handler:function(){
				var activetab = this.tabPanel.getActiveTab();
				var config = {};
				switch(activetab.id)
				{
					case 'ab-contacts-grid':
						config.query='search_contacts';
						config.colModel = this.contactsGrid.getColumnModel();

					break;
					case 'ab-company-grid':
						config.query='search_companies';
						config.colModel = this.companiesGrid.getColumnModel();
					break;
				}


				config.title = activetab.title;
				var query = this.searchPanel.queryField.getValue();
				if(!GO.util.empty(query))
				{
					config.subtitle= GO.lang.searchQuery+': '+query;
				}else
				{
					config.subtile='';
				}

				if(!this.exportDialog)
				{
					this.exportDialog = new GO.ExportQueryDialog();
				}
				this.exportDialog.show(config);

			},
			scope: this
		}*/

	];

	if(GO.mailings && GO.email)
	{
		tbar.push('-');
		tbar.push({
				iconCls: 'ml-btn-mailings',
				text: GO.addressbook.lang.sendMailing,
				cls: 'x-btn-text-icon',
				handler: function(){
					if(!this.selectMailingGroupWindow)
					{
						this.selectMailingGroupWindow=new GO.mailings.SelectMailingGroupWindow();
						this.selectMailingGroupWindow.on("select", function(win, mailing_group_id){
							GO.email.showComposer({mailing_group_id:mailing_group_id});
						}, this);
					}
					this.selectMailingGroupWindow.show();
				},
				scope: this
			});
	}
	config.tbar=new Ext.Toolbar({
			cls:'go-head-tb',
			items: tbar});


	GO.addressbook.MainPanel.superclass.constructor.call(this, config);

};

Ext.extend(GO.addressbook.MainPanel, Ext.Panel,{

		setAdvancedSearchNotification : function (store)
		{
			if(!GO.util.empty(store.baseParams.advancedQuery))
			{
				this.searchPanel.queryField.setValue("[ "+GO.addressbook.lang.advancedSearch+" ]");
				this.searchPanel.queryField.setDisabled(true);
			}else
			{
				if(this.searchPanel.queryField.getValue()=="[ "+GO.addressbook.lang.advancedSearch+" ]")
				{
					this.searchPanel.queryField.setValue("");
				}
				this.searchPanel.queryField.setDisabled(false);
			}
		},

		afterRender : function()
		{
			GO.addressbook.MainPanel.superclass.afterRender.call(this);

			GO.addressbook.readableAddressbooksStore.load();

			GO.addressbook.readableItemStore.load();

			if(GO.mailings)
			{
				if(!GO.mailings.ooTemplatesStore.loaded)
					GO.mailings.ooTemplatesStore.load();
			}


			GO.addressbook.contactDialog.on('save', function(){
				var panel = this.tabPanel.getActiveTab();
				if(panel.id=='ab-contacts-grid')
				{
					this.contactsGrid.store.reload();
				}
			}, this);


			GO.addressbook.companyDialog.on('save', function(){
				var panel = this.tabPanel.getActiveTab();
				if(panel.id=='ab-company-grid')
				{
					this.companiesGrid.store.reload();
				}
			}, this);

		},

		setSearchParams : function(params)
		{
			var panel = this.tabPanel.getActiveTab();

			for(var name in params)
			{
				if(name!='advancedQuery' || panel.id=='ab-contacts-grid')
				{
					this.contactsGrid.store.baseParams[name] = params[name];
				}
				if(name!='advancedQuery' || panel.id!='ab-contacts-grid')
				{
					this.companiesGrid.store.baseParams[name] = params[name];
				}
			}


			if(panel.id=='ab-contacts-grid')
			{
				this.companiesGrid.loaded=false;
				this.contactsGrid.store.load();
			}else
			{
				this.contactsGrid.loaded=false;
				this.companiesGrid.store.load();
			}
		},



		rowDoubleClick : function()
		{
			var activetab = this.tabPanel.getActiveTab();

			switch(activetab.id)
			{
				case 'ab-contacts-grid':
					GO.addressbook.contactDialog.show(this.contactsGrid.selModel.selections.items[0].data.id);
				break;
				case 'ab-company-grid':
					GO.addressbook.companyDialog.show(this.companiesGrid.selModel.selections.items[0].data.id);
				break;
			}
		}
});


GO.mainLayout.onReady(function(){
	GO.addressbook.contactDialog = new GO.addressbook.ContactDialog();
	GO.addressbook.companyDialog = new GO.addressbook.CompanyDialog();
});


GO.addressbook.searchSenderStore = new GO.data.JsonStore({
		url: GO.settings.modules.addressbook.url+ 'json.php',
		baseParams: {'task': 'search_sender', email:''},
		root: 'results',
		totalProperty: 'total',
		id: 'id',
		fields:['id','name'],
		remoteSort:true
	});

GO.addressbook.searchSender = function(sender, name){
	GO.addressbook.searchSenderStore.baseParams.email=sender;
	GO.addressbook.searchSenderStore.load({
		callback:function(){
			switch(GO.addressbook.searchSenderStore.getCount())
			{
				case 0:
					if(confirm(GO.addressbook.lang.confirmCreate))
					{
						GO.addressbook.contactDialog.show();

						var names = name.split(' ');
						var params = {
							email:sender,
							first_name: names[0]
						};
						if(names[2])
						{
							params.last_name=names[2];
							params.middle_name=names[1];
						}else if(names[1])
						{
							params.last_name=names[1];
						}


						var tldi = sender.lastIndexOf('.');
						if(tldi)
						{
							var tld = sender.substring(tldi+1, sender.length).toUpperCase();
							if(GO.lang.countries[tld])
							{
								params.country=tld;
							}
						}

						GO.addressbook.contactDialog.formPanel.form.setValues(params);
					}

				break;
				case 1:
					var r = GO.addressbook.searchSenderStore.getAt(0);
					GO.linkHandlers[2].call(this, r.get('id'));
				break;
				default:
					if(!GO.addressbook.searchSenderWin)
					{
						var list = new GO.grid.SimpleSelectList({
								store: GO.addressbook.searchSenderStore
							});

						list.on('click', function(dataview, index){
								var contact_id = dataview.store.data.items[index].id;
								list.clearSelections();
								GO.addressbook.searchSenderWin.hide();
								GO.linkHandlers[2].call(this, contact_id);
						}, this);
						GO.addressbook.searchSenderWin=new GO.Window({
							title:GO.addressbook.lang.strSelectContact,
							items:{
								autoScroll:true,
								items: list,
								cls:'go-form-panel'
							},
							layout:'fit',
							autoScroll:true,
							closeAction:'hide',
							closeable:true,
							height:400,
							width:400,
							buttons:[{
								text: GO.lang['cmdClose'],
								handler: function(){
									GO.addressbook.searchSenderWin.hide();
								}
							}]
						});
					}
					GO.addressbook.searchSenderWin.show();
				break;
			}
		},
		scope:this
	});

}


GO.moduleManager.addModule('addressbook', GO.addressbook.MainPanel, {
	title : 'Libraries',//GO.addressbook.lang.addressbook,
	iconCls : 'go-tab-icon-addressbook'
});

GO.linkHandlers[2]=GO.mailFunctions.showContact=function(id){
		//GO.addressbook.contactDialog.show(id);

	var contactPanel = new GO.addressbook.ContactReadPanel();
	var linkWindow = new GO.LinkViewWindow({
		title: 'Dspace',//GO.addressbook.lang.contact,
		items: contactPanel
	});
	contactPanel.load(id);
	linkWindow.show();
}

GO.linkHandlers[3]=function(id){
	//GO.addressbook.companyDialog.show(id);

	var companyPanel = new GO.addressbook.CompanyReadPanel();
	var linkWindow = new GO.LinkViewWindow({
		title: 'Koha',//GO.addressbook.lang.company,
		items: companyPanel
	});
	companyPanel.load(id);
	linkWindow.show();
}


