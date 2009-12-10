/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: Stores.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */


GO.addressbook.readableAddressbooksStore = new GO.data.JsonStore({
			url: GO.settings.modules.addressbook.url+ 'json.php'	,
			baseParams: {
				'task':'addressbooks',
				'auth_type' : 'read'
				},
			root: 'results',
			totalProperty: 'total',
			id: 'id',
			fields: ['id','name','owner'],
			remoteSort: true
		});

GO.addressbook.writableAddressbooksStore = new GO.data.JsonStore({
			url: GO.settings.modules.addressbook.url+ 'json.php'	,
			baseParams: {
				'task':'addressbooks',
				'auth_type' : 'write'
				},
			root: 'results',
			totalProperty: 'total',
			id: 'id',
			fields: ['id','name','owner', 'acl_read', 'acl_write'],
			remoteSort: true
		});



GO.addressbook.writableAddressbooksStore.on('load', function(){
	GO.addressbook.writableAddressbooksStore.on('load', function(){
		GO.addressbook.readableAddressbooksStore.load();
	});
});

GO.addressbook.readableItemStore = new Ext.data.JsonStore({
					 root: 'searchResults',
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
					 totalProperty: 'maxResults',
					 idProperty: 'url',
					 fields: [
						  {name: 'id', mapping: 'url'},
						  {name: 'issue_date', type: 'date', mapping: 'issue_date', dateFormat: 'Y/m/d'/*'timestamp'*/},
						  {name: 'author', type: 'string'},
						  {name: 'title', type: 'string'},
						  {name: 'url', type: 'string'},
						  {name: 'bitstreams', type: 'string'},
						  {name: 'collection', type: 'string'},
						  {name: 'description', type: 'string', mapping: 'details'}
					 ],
					 sortInfo:{field: 'id', direction: "DESC"},
					 remoteSort: true,
					 proxy: new Ext.data.HttpProxy({
						  method: 'POST',
						  url: '../index.do'
					 })

					 });
