/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: ContextMenu.js 2760 2009-07-02 09:06:38Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

GO.files.FilesContextMenu = function(config)
{
	if(!config)
	{
		config = {};
	}
	config['shadow']='frame';
	config['minWidth']=180;
	
	this.downloadButton = new Ext.menu.Item({
					iconCls: 'btn-save',
					text: GO.lang.download,
					cls: 'x-btn-text-icon',
					handler: function(){
						//this.fireEvent('download', this, this.records);
						
						window.location.href=GO.settings.modules.files.url+'download.php?mode=download&id='+this.records[0].data.id;
					},
					scope: this
				});
				
	this.gotaButton = new Ext.menu.Item({
					iconCls: 'btn-edit',
					text: GO.files.lang.downloadGOTA,
					cls: 'x-btn-text-icon',
					handler: function(){
						if(!deployJava.isWebStartInstalled('1.6.0'))
						{
							Ext.MessageBox.alert(GO.lang.strError, GO.lang.noJava);
						}else
						{		
							window.location.href=GO.settings.modules.gota.url+'jnlp.php?id='+this.records[0].data.id;
						}
					},
					scope: this
				});
	
	/*this.pasteButton = new Ext.menu.Item({
					iconCls: 'btn-paste',
					text: 'Paste',
					cls: 'x-btn-text-icon',
					handler: function(){
						this.fireEvent('paste', this);
					},
					scope: this
				});*/				

	this.deleteButton = new Ext.menu.Item({
					iconCls: 'btn-delete',
					text: GO.lang['cmdDelete'],
					cls: 'x-btn-text-icon',
					handler: function(){
						this.fireEvent('delete', this, this.records, this.clickedAt);
					},
					scope: this
				});

	this.cutButton= new Ext.menu.Item({
					iconCls: 'btn-cut',
					text: GO.lang.cut,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.fireEvent('cut', this, this.records, this.clickedAt);
					},
					scope: this
				});
	this.copyButton = new Ext.menu.Item({
					iconCls: 'btn-copy',
					text: GO.lang.copy,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.fireEvent('copy', this, this.records, this.clickedAt);
					},
					scope: this
				});
	
	
	this.compressButton = new Ext.menu.Item({
					iconCls: 'btn-compress',
					text: GO.lang.compress,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.fireEvent('compress', this, this.records, this.clickedAt);
					},
					scope: this
				});
	this.decompressButton = new Ext.menu.Item({
				iconCls: 'btn-decompress',
				text: GO.lang.decompress,
				cls: 'x-btn-text-icon',
				handler: function(){
					this.fireEvent('decompress', this, this.records, this.clickedAt);
				},
				scope: this
			});
	
	
	config['items']=[this.downloadButton];
				
	if(GO.settings.modules.gota && GO.settings.modules.gota.read_permission)
	{
		config['items'].push(this.gotaButton);
	}
				

	config['items'].push({ 
		iconCls: 'btn-properties',
		text: GO.lang['strProperties'], 
		handler: function(){
				this.fireEvent('properties', this, this.records);
		},
		scope:this					
	});
	
	config['items'].push(new Ext.menu.Separator());
	config['items'].push(this.cutButton);
	config['items'].push(this.copyButton);
	//this.pasteButton,				
	config['items'].push(new Ext.menu.Separator());
	config['items'].push(this.deleteButton);
	config['items'].push(this.compressSeparator = new Ext.menu.Separator());
	config['items'].push(this.compressButton);
	config['items'].push(this.decompressButton);
				
	GO.files.FilesContextMenu.superclass.constructor.call(this, config);
	
	this.addEvents({
		
		'properties' : true,
		'paste' : true,
		'cut' : true,
		'copy' : true,
		'delete' : true,
		'compress' : true,
		'decompress' : true
		
	});
	
}

Ext.extend(GO.files.FilesContextMenu, Ext.menu.Menu,{
	/*tree or grid */	
	
	clickedAt : 'grid',
	
	records : [],	
	
	
	showAt : function(xy, records, clickedAt)
	{ 	
		if(clickedAt)
			this.clickedAt = clickedAt;
			
		var extension = '';
		this.records = records;
		if(records.length=='1')
		{				
  		extension = records[0].data.extension;				
			
			switch(extension)
		 	{
		 		case 'zip':
		 		case 'tar':
		 		case 'tgz':
		 		case 'gz':
		 			this.downloadButton.show();
		 			this.gotaButton.show();
		 			this.decompressButton.show();
		 			this.compressButton.hide();
		 		break;
		 		
		 		case '':
				case 'folder':
		 			this.downloadButton.hide();
		 			this.gotaButton.hide();
		 			this.decompressButton.hide();
		 			this.compressButton.show();
		 			
		 		break;
		 		
		 		default:
		 			this.downloadButton.show();
		 			this.gotaButton.show();
		 			this.compressButton.show();	
		 			this.decompressButton.hide();
		 		break;	 		
		 	}
		}else
		{
			this.compressButton.show();
			this.decompressButton.hide();
			this.downloadButton.hide();
		 	this.gotaButton.hide();
		}

		GO.files.FilesContextMenu.superclass.showAt.call(this, xy);
	}	
});