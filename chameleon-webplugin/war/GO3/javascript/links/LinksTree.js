/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LinksTree.js 1489 2008-11-28 14:26:21Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.LinksTree = function(config){
	if(!config)
	{
		config = {};
	}
		
	config.title=GO.lang.folders;
	config.layout='fit';
  config.split=true;
	config.autoScroll=true;
	config.width=200;
	
	config.animate=true;
	config.loader=new Ext.tree.TreeLoader(
	{
		dataUrl:BaseHref+'json.php',
		baseParams:{task: 'link_folders_tree', link_type: 0, link_id: 0},
		preloadChildren:true
	});
	config.collapsed=config.treeCollapsed;
	config.containerScroll=true;
	config.rootVisible=true;
	config.collapsible=true;
	config.ddAppendOnly=true;
	config.containerScroll=true;
	config.ddGroup='LinksDD';
	config.enableDD=true;

	GO.LinksTree.superclass.constructor.call(this, config);	
	
	
	// set the root node
	this.rootNode = new Ext.tree.AsyncTreeNode({
		text: 'Root',
		draggable:false,
		iconCls : 'folder-default',
		expanded:false
	});
	this.setRootNode(this.rootNode);
}

Ext.extend(GO.LinksTree, Ext.tree.TreePanel, {
	
	loadLinks : function(link_id, link_type)
	{
		this.loader.baseParams.link_id=link_id;
		this.loader.baseParams.link_type=link_type;
		
		if(this.rootNode.isExpanded())
			this.rootNode.reload();
		else
			this.rootNode.expand();
	}
	
});