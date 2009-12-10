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

GO.menu.RecordsContextMenu=Ext.extend(Ext.menu.Menu,{
	
	records : [],	
	
	/**
	 * 
	 * @param {} xy
	 * @param {} records pass Ext.Records. If there are more then one records 
	 * 	a menu item will be disabled if it doesn't have the multiple property set.
	 */
	showAt : function(xy, records)
	{ 	
		this.records = records;
		
		var multiple = this.records.length>1;

		for(var i=0;i<this.items.getCount();i++)
		{			
			var item = this.items.get(i);
			item.setDisabled(!item.multiple && multiple);
		}
		
		GO.menu.RecordsContextMenu.superclass.showAt.call(this, xy);
	}	
});