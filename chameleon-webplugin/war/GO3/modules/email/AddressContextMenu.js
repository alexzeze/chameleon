/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: ContextMenu.js 1384 2008-11-09 12:00:26Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

GO.email.AddressContextMenu = function(config)
{
	if(!config)
	{
		config = {};
	}
	config['shadow']='frame';
	config['minWidth']=180;
	
	
				
	this.composeButton = new Ext.menu.Item({
					iconCls: 'btn-compose',
					text: GO.email.lang.compose,
					cls: 'x-btn-text-icon',
					handler: function(){
						GO.email.showComposer({
							values : {to: this.address}							
						});
					},
					scope: this
				});
	this.searchButton = new Ext.menu.Item({
					iconCls: 'btn-search',
					text: GO.email.lang.searchGO,
					cls: 'x-btn-text-icon',
					handler: function(){
						var searchPanel = new GO.grid.SearchPanel(
							{query: this.address}
						);
						GO.mainLayout.tabPanel.add(searchPanel);
						searchPanel.show();
					},
					scope: this
				});
				
	this.searchMessagesButton = new Ext.menu.Item({
					iconCls: 'btn-search',
					text: GO.email.lang.searchOnSender,
					cls: 'x-btn-text-icon',
					handler: function(){
						GO.email.searchSender(this.address);
					},
					scope: this
				});
				
	config.items=[this.composeButton,
	this.searchButton,
	this.searchMessagesButton];
	
	if(GO.addressbook)
	{
		this.lookUpButton = new Ext.menu.Item({
					iconCls: 'btn-addressbook',
					text: GO.addressbook.lang.searchOnSender,
					cls: 'x-btn-text-icon',
					handler: function(){
						GO.addressbook.searchSender(this.address, this.personal);
					},
					scope: this
				});
	
		config.items.push(this.lookUpButton);
	}

					
	GO.email.AddressContextMenu.superclass.constructor.call(this, config);	
}

Ext.extend(GO.email.AddressContextMenu, Ext.menu.Menu,{
	personal : '',
	address : '',
	showAt : function(xy, address, personal)
	{ 	
		this.address = address;
		if(personal)
			this.personal=personal;
		
		GO.email.AddressContextMenu.superclass.showAt.call(this, xy);
	}	
});