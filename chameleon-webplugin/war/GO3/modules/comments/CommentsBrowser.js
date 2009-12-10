/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LinkBrowser.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.comments.CommentsBrowser = function(config){
	
	Ext.apply(this, config);


	this.commentsGrid = new GO.comments.CommentsGrid();

	
	GO.comments.CommentsBrowser.superclass.constructor.call(this, {
   	layout: 'fit',
		modal:false,
		minWidth:300,
		minHeight:300,
		height:500,
		width:700,
		plain:true,
		maximizable:true,
		closeAction:'hide',
		title:GO.comments.lang.browseComments,
		items: this.commentsGrid,
		buttons: [			
			{				
				text: GO.lang['cmdClose'],
				handler: function(){this.hide();},
				scope: this
			}
		]
    });
    
   this.addEvents({'link' : true});
};

Ext.extend(GO.comments.CommentsBrowser, Ext.Window, {
	
	show : function(config)
	{
		this.commentsGrid.setLinkId(config.link_id, config.link_type);
		this.commentsGrid.store.load();
		
		GO.comments.CommentsBrowser.superclass.show.call(this);
	}
});
