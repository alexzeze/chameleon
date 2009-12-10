/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LinkBrowser.js 2037 2009-03-10 11:22:53Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.LinkBrowser = function(config){
	
	Ext.apply(this, config);


	this.linksPanel = new GO.grid.LinksPanel();

	
	GO.LinkBrowser.superclass.constructor.call(this, {
   	layout: 'fit',
		modal:false,
		minWidth:300,
		minHeight:300,
		height:500,
		width:750,
		border:false,
		plain:true,
		maximizable:true,
		collapsible:true,
		closeAction:'hide',
		title:GO.lang.cmdBrowseLinks,
		items: this.linksPanel,
		buttons: [
			/*{
				text: GO.lang['cmdOk'],
				handler: function(){							
					this.linkItems();
				},
				scope:this
			},*/
			{
				text: GO.lang['cmdClose'],
				handler: function(){this.hide();},
				scope: this
			}
		]
    });
    
   this.addEvents({'link' : true});
};

Ext.extend(GO.LinkBrowser, Ext.Window, {
	
	show : function(config)
	{
		this.linksPanel.loadLinks(config.link_id, config.link_type);
		
		if(config.folder_id)
		{
			this.linksPanel.setFolder(config.folder_id);
		}
		
		GO.LinkBrowser.superclass.show.call(this);
	}
});

GO.mainLayout.onReady(function(){
	GO.linkBrowser = new GO.LinkBrowser();
});
