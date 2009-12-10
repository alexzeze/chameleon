/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: ManageDialog.js 1088 2008-10-07 13:02:06Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */


GO.addressbook.ManageDialog = function(config)
{
	if(!config)
	{
		config = {};
	}	
	this.addressbooksGrid = new GO.addressbook.ManageAddressbooksGrid();
	
	var items = [
			this.addressbooksGrid			
		];
		
	if(GO.mailings)
	{
		this.templatesGrid = new GO.mailings.TemplatesGrid();	
		this.mailingsGrid = new GO.mailings.MailingsGrid();
		items.push(this.templatesGrid);
		items.push(this.mailingsGrid);
	}
	
	config.layout= 'fit';
	config.modal= false;
	config.shadow= false;
	config.border= false;
	config.height= 450;
	config.width= 800;
	config.closeAction= 'hide';
	config.title= GO.addressbook.lang['cmdManageDialog'];
	config.items= [{
		xtype: 'tabpanel',
		activeTab: 0,
		border: true,
		items: items
	}];
	config.buttons=[{ 
		text: GO.lang['cmdClose'], 
		handler: function(){ 
			this.hide(); 
		}, 
		scope: this 
	}];
	
	GO.addressbook.ManageDialog.superclass.constructor.call(this, config);
}
	
Ext.extend(GO.addressbook.ManageDialog, Ext.Window,{
});	
