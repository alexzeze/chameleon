/**
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: AddressbookDialog.js 1655 2008-12-29 16:00:48Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 * 
 * 
 * Params:
 * 
 * linksStore: store to reload after items are linked gridRecords: records from
 * grid to link. They must have a link_id and link_type fromLinks: array with
 * link_id and link_type to link
 */

/**
 * @class GO.dialog.SelectEmail
 * @extends Ext.Window A window to select a number of User-Office user Users.
 * 
 * @cfg {Function} handler A function called when the Add or Ok button is
 *      clicked. The grid will be passed as argument.
 * @cfg {Object} scope The scope of the handler
 * 
 * @constructor
 * @param {Object}
 *            config The config object
 */

GO.email.AddressbookDialog = function(config) {

	Ext.apply(this, config);

	var items = Array();
	this.usersStore = new GO.data.JsonStore({
				url : GO.settings.modules.users.url + 'non_admin_json.php',
				baseParams : {
					task : 'users'
				},
				id : 'id',
				root : 'results',
				fields : ['id', 'username', 'name', 'company', 'logins',
						'lastlogin', 'registration_time', 'address', 'zip',
						'city', 'state', 'country', 'phone', 'email',
						'waddress', 'wzip', 'wcity', 'wstate', 'wcountry',
						'wphone'],
				totalProperty : 'total',
				remoteSort : true
			});

	this.usersSearchField = new GO.form.SearchField({
				store : this.usersStore,
				width : 320
			});

	this.usersGrid = new GO.grid.GridPanel({
				title : GO.addressbook.lang.users,
				paging : true,
				border : false,
				store : this.usersStore,
				view : new Ext.grid.GridView({
							autoFill : true,
							forceFit : true
						}),
				columns : [{
							header : GO.lang['strName'],
							dataIndex : 'name',
							css : 'white-space:normal;',
							sortable : true
						}, {
							header : GO.lang['strEmail'],
							dataIndex : 'email',
							css : 'white-space:normal;',
							sortable : true
						}],
				sm : new Ext.grid.RowSelectionModel(),
				tbar : [GO.lang['strSearch'] + ': ', ' ', this.usersSearchField]
			});

	this.usersGrid.on('show', function() {
				this.usersStore.load();
			}, this);
	/*
	 * this.usersGrid.on('afterRender', function(){
	 * if(this.usersGrid.isVisible()) { this.onShow(); } }, this);
	 */

	items.push(this.usersGrid);

	if (GO.addressbook) {
		this.contactsStore = new GO.data.JsonStore({
					url : GO.settings.modules.addressbook.url + 'json.php',
					baseParams : {
						task : 'contacts'
					},
					root : 'results',
					id : 'id',
					totalProperty : 'total',
					fields : ['id', 'name', 'company_name', 'email',
							'home_phone', 'work_phone', 'work_fax', 'cellular'],
					remoteSort : true
				});

		this.contactsSearchField = new GO.form.SearchField({
					store : this.contactsStore,
					width : 320
				});

		this.contactsGrid = new GO.grid.GridPanel({
					title : GO.addressbook.lang.contacts,
					paging : true,
					border : false,
					store : this.contactsStore,
					view : new Ext.grid.GridView({
								autoFill : true,
								forceFit : true
							}),
					columns : [{
								header : GO.lang['strName'],
								dataIndex : 'name',
								css : 'white-space:normal;',
								sortable : true
							}, {
								header : GO.lang['strEmail'],
								dataIndex : 'email',
								css : 'white-space:normal;',
								sortable : true
							}],
					sm : new Ext.grid.RowSelectionModel(),
					tbar : [GO.lang['strSearch'] + ': ', ' ',
							this.contactsSearchField]
				});

		this.contactsGrid.on('show', function() {
					this.contactsStore.load();
				}, this);

		this.companiesStore = new GO.data.JsonStore({
					url : GO.settings.modules.addressbook.url + 'json.php',
					baseParams : {
						task : 'companies'
					},
					root : 'results',
					id : 'id',
					totalProperty : 'total',
					fields : ['id', 'name', 'city', 'email', 'phone',
							'homepage', 'address', 'zip'],
					remoteSort : true
				});

		this.companySearchField = new GO.form.SearchField({
					store : this.companiesStore,
					width : 320
				});

		this.companyGrid = new GO.grid.GridPanel({
					title : GO.addressbook.lang.companies,
					paging : true,
					border : false,
					store : this.companiesStore,
					view : new Ext.grid.GridView({
								autoFill : true,
								forceFit : true
							}),
					columns : [{
								header : GO.lang['strName'],
								dataIndex : 'name',
								css : 'white-space:normal;',
								sortable : true
							}, {
								header : GO.lang['strEmail'],
								dataIndex : 'email',
								css : 'white-space:normal;',
								sortable : true
							}],
					sm : new Ext.grid.RowSelectionModel(),
					tbar : [GO.lang['strSearch'] + ': ', ' ',
							this.companySearchField]
				});

		this.companyGrid.on('show', function() {
					this.companiesStore.load();
				}, this);

		items.push(this.contactsGrid);
		items.push(this.companyGrid);

	}

	if (GO.mailings) {
		this.mailingsGrid = new GO.grid.GridPanel({
					title : GO.mailings.lang.cmdPanelMailings,
					paging : true,
					border : false,
					store : GO.mailings.readableMailingsStore,
					view : new Ext.grid.GridView({
								autoFill : true,
								forceFit : true
							}),
					columns : [{
								header : GO.lang['strName'],
								dataIndex : 'name',
								css : 'white-space:normal;',
								sortable : true
							}],
					sm : new Ext.grid.RowSelectionModel()
				});
		this.mailingsGrid.on('show', function() {
					GO.mailings.readableMailingsStore.load();
				}, this);

		items.push(this.mailingsGrid);
	}

	this.tabPanel = new Ext.TabPanel({
				activeTab : 0,
				items : items,
				border : false
			});

	GO.email.AddressbookDialog.superclass.constructor.call(this, {
				layout : 'fit',
				modal : false,
				height : 400,
				width : 600,
				closeAction : 'hide',
				title : GO.addressbook.lang.addressbook,
				items : this.tabPanel,
				buttons : [{
							text : GO.email.lang.addToRecipients,
							handler : function() {
								this.addRecipients('to');
							},
							scope : this
						}, {
							text : GO.email.lang.addToCC,
							handler : function() {
								this.addRecipients('cc');
							},
							scope : this
						}, {
							text : GO.email.lang.addToBCC,
							handler : function() {
								this.addRecipients('bcc');
							},
							scope : this
						}, {
							text : GO.lang['cmdClose'],
							handler : function() {
								this.hide();
							},
							scope : this
						}]
			});

	this.addEvents({
				addrecipients : true
			});
};

Ext.extend(GO.email.AddressbookDialog, Ext.Window, {
			addRecipients : function(field) {
				var str="";
				var activeGrid = this.tabPanel.getLayout().activeItem;
				var selections = activeGrid.selModel.getSelections();
				
				if (this.mailingsGrid && activeGrid == this.mailingsGrid) {
					
					var mailing_groups = [];
					
					for(var i=0;i<selections.length;i++)
					{
						mailing_groups.push(selections[i].data.id);
					}
					
					this.el.mask(GO.lang.waitMsgLoad);
					Ext.Ajax.request({
						url: GO.settings.modules.mailings.url+'json.php',
						params: {
								task:'mailing_group_string',
								mailing_groups: mailing_groups.join(',')
							},
						callback: function(options, success, response)
						{
							str = response.responseText;
							this.fireEvent('addrecipients', field, str);
							this.el.unmask();
						},
						scope:this
					});

				} else {

					var emails = [];

					for (var i = 0; i < selections.length; i++) {
						emails.push('"' + selections[i].data.name + '" <'
								+ selections[i].data.email + '>');
					}
					
					str=emails.join(', ');
					this.fireEvent('addrecipients', field, str);
				}
				
			}
		});
