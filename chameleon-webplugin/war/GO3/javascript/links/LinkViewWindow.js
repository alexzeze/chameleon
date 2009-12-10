/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LinkViewWindow.js 1366 2008-11-06 15:14:32Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
  
GO.LinkViewWindow = function(config){
	
	if(!config)
	{
		config = {};
	}
	config.collapsible=true;
	config.maximizable=true;
	config.layout='fit';
	config.modal=false;
	config.resizable=true;
	if(!config.width)
		config.width=500;
	if(!config.height)
		config.height=500;


	config.buttons=[{
			text: GO.lang['cmdClose'],
			handler: function(){
				this.close();
			},
			scope:this
		}					
	];
	
	GO.LinkViewWindow.superclass.constructor.call(this, config);
	
	this.render(Ext.getBody());
};

Ext.extend(GO.LinkViewWindow, Ext.Window);


