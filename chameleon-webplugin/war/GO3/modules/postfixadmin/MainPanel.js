/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: MainPanel.tpl 1913 2008-05-07 12:41:17Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 


/*
 * This will add the module to the main tabpanel filled with all the modules
 */

 
GO.moduleManager.addModule('postfixadmin', GO.postfixadmin.DomainsGrid, {
	title : GO.postfixadmin.lang.postfixadmin,
	iconCls : 'go-tab-icon-postfixadmin'
});


