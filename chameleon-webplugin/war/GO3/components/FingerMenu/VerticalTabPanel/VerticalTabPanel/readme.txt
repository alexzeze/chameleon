ABOUT THIS EXTENSION:
An extension for Ext.TabPanel that enables tabs to be positioned on the left or right
side of a TabPanel.
Author: Carina Stumpf, me@carina.net
Versino: 0.2

DETAILS & DEMO:
http://carina.net/blog/ext-vertical-tabs-extension

EXAMPLE USAGE:
var tabpanel1 = new Ext.ux.VerticalTabPanel({
    activeTab: 0,
    tabPosition:'left',  //choose 'left' or 'right' for vertical tabs; 'top' or 'bottom' for horizontal tabs
    textAlign:'right',
    renderTo:'tabs', //change to the ID of an existing DOM element
    width:500,
    height:200,
    tabWidth:100, 
    defaults:{autoScroll: true},
    items:[{
      title: 'By category',
      iconCls:'icon-by-category',
      html: "Show content by category... "
    },{
      title: 'Folder',
      iconCls:'icon-folder',
      html: "Show folder content... "
    },{
      title: 'List',
      iconCls:'icon-list',
      html: "Show list... "
    }
    ]
  });