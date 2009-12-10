/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @copyright Copyright Intermesh
 * @version $Id: MainLayout.js 1088 2008-10-07 13:02:06Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

GO.MainLayout.override({
  createTabPanel : function(items){
       this.tabPanel = new Ext.ux.VerticalTabPanel({
		activeTab: 0,
	       region: 'center',
	       titlebar: false,
      border:false,
						       layoutOnTabChange:true,
	       tabPosition:'left',  //choose 'left' or 'right' for vertical tabs; 'top' or 'bottom' for horizontal tabs
	       textAlign:'right',
	       //renderTo:'vtab', //change to the ID of an existing DOM element
	       cls: 'mainvpanel',
	       //width:500,
	       //height:200,
	       tabWidth:50,
	       defaults:{autoScroll: true},
	       items:[new Ext.TabPanel({
		    activeTab: 0,
		    region:'center',
		    //titlebar: false,
		    title: 'test',
		    border:false,
		    //activeTab:'go-module-panel-'+GO.settings.start_module,
		    tabPosition:'top',
		    baseCls: 'go-moduletabs',
		    items: items,
		    layoutOnTabChange:true
	       }),new Ext.TabPanel({
		    activeTab: 0,
		    region:'center',
		    //titlebar: false,
		    title: 'test2',
		    border:false,
		    //activeTab:'go-module-panel-'+GO.settings.start_module,
		    tabPosition:'top',
		    baseCls: 'go-moduletabs',
		    items: items,
		    layoutOnTabChange:true
	       })]
	   });

		/*this.tabPanel = new Ext.TabPanel({
      region:'center',
      titlebar: false,
      border:false,
      activeTab:'go-module-panel-'+GO.settings.start_module,
      tabPosition:'top',
      baseCls: 'go-moduletabs',
      items: items,
      layoutOnTabChange:true
  	}); */
	}
});
