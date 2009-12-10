/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * @version $Id: EmailClient.js 2505 2009-05-14 15:02:35Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */


Ext.namespace("GO.email");

GO.email.EmailClient = function(config){

	if(!config)
	{
		config = {};
	}	
	
	
	this.messagesStore = new GO.data.JsonStore({
		url: GO.settings.modules.email.url+'json.php',
		baseParams: {
			"node": '',
			"type": 'messages'
		},
		root: 'results',
		totalProperty: 'total',
		id: 'uid',
		fields:['uid','icon','flagged','attachments','new','subject','from','sender','size','date', 'priority','answered'],
		remoteSort: true
	});
	
	this.messagesStore.setDefaultSort('date', 'DESC');

	var messagesAtTop = Ext.state.Manager.get('em-msgs-top');		
	if(messagesAtTop)
	{
		messagesAtTop = Ext.decode(messagesAtTop);
	}else
	{
		messagesAtTop =screen.width<1024;
	}

	this.leftMessagesGrid = new GO.email.MessagesGrid({
		id:'em-pnl-west',
		store:this.messagesStore,
		width: 420,
		region:'west',
		hidden:messagesAtTop
	});	
	this.addGridHandlers(this.leftMessagesGrid);
	
	this.topMessagesGrid = new GO.email.MessagesGrid({
		id:'em-pnl-north',
		store:this.messagesStore,
		height: 250,
		region:'north',
		hidden:!messagesAtTop
	});
	this.addGridHandlers(this.topMessagesGrid);
	
	if(!this.topMessagesGrid.hidden)
  {
  	this.messagesGrid=this.topMessagesGrid;
  }else
  {
  	this.messagesGrid=this.leftMessagesGrid;
  }
  
  //for global access by composers
  GO.email.messagesGrid=this.messagesGrid;
  
	this.messagesGrid.store.on('load',function(){
		
		var cm = this.topMessagesGrid.getColumnModel();
		var header = this.messagesGrid.store.reader.jsonData.sent ? GO.email.lang.to : GO.email.lang.from;
		cm.setColumnHeader(1, header);
		
		var unseen = this.messagesGrid.store.reader.jsonData.unseen;
		for(var folder_id in unseen)
			this.updateFolderStatus(folder_id,unseen[folder_id]);
		
		if(this.messagesGrid.store.baseParams['query'] && this.messagesGrid.store.baseParams['query']!=''){
			this.resetSearchButton.setVisible(true);			
		}else
		{
			this.resetSearchButton.setVisible(false);
		}		
		
		var selModel = this.treePanel.getSelectionModel();
		if(!selModel.getSelectedNode())
		{	
			var node = this.treePanel.getNodeById('folder_'+this.messagesGrid.store.reader.jsonData.folder_id);
			if(node)
			{
				selModel.select(node);
			}
		}					
	}, this);	

	GO.email.saveAsItems = GO.email.saveAsItems || [];
	
	for(var i=0;i<GO.email.saveAsItems.length;i++)
	{
		GO.email.saveAsItems[i].scope=this;
	}
	
	var contextItems = [
		{ 
			text: GO.email.lang.markAsRead, 
			handler: function(){
					this.doTaskOnMessages('mark_as_read');
				},
			scope:this,
			multiple:true
		},
		{ 
			text: GO.email.lang.markAsUnread, 
			handler: function(){
					this.doTaskOnMessages('mark_as_unread');
				},
			scope: this,
			multiple:true
		},
		{ 
			text: GO.email.lang.flag, 
			handler: function(){
				this.doTaskOnMessages('flag');
			},
			scope: this,
			multiple:true
		},
		{ 
			text: GO.email.lang.unflag, 
			handler: function(){
				this.doTaskOnMessages('unflag');
			},
			scope: this,
			multiple:true
		},
		'-',
		{
			text: GO.email.lang.viewSource,
			handler: function(){
				
				var record = this.messagesGrid.selModel.getSelected();
				if(record)
				{				
					var win = window.open(GO.settings.modules.email.url+'source.php?account_id='+this.account_id+'&mailbox='+encodeURIComponent(this.mailbox)+'&uid='+encodeURIComponent(record.data.uid));
					win.focus();
				}
				
			},
			scope: this
		},'-',
		{
			iconCls: 'btn-delete',
			text: GO.lang.cmdDelete,
			cls: 'x-btn-text-icon',
			handler: this.deleteMessages,
			scope: this,
			multiple:true
		},'-',{
			iconCls: 'btn-add',
			text: GO.email.lang.addSendersTo,
			cls: 'x-btn-text-icon',
			menu: {
				items:[{
					text:GO.email.lang.to,
					field:'to',
					handler:this.addSendersTo,
					scope:this
				},{
					text:'CC',
					field:'cc',
					handler:this.addSendersTo,
					scope:this
				},{
					text:'BCC',
					field:'bcc',
					handler:this.addSendersTo,
					scope:this
				}]
			},
			multiple:true			
		}];
		
		
	
	if(GO.email.saveAsItems && GO.email.saveAsItems.length)
	{
		this.saveAsMenu = new Ext.menu.Menu({
			items:GO.email.saveAsItems
		});
		
		this.saveAsMenu.on('show', function(menu){			
			var sm = this.messagesGrid.getSelectionModel();
			var multiple = sm.getSelections().length>1;
			var none = sm.getSelections().length==0;
	
			for(var i=0;i<menu.items.getCount();i++)
			{			
				var item = menu.items.get(i);
				item.setDisabled(none || (!item.multiple && multiple));
			}
		}, this);
		
		contextItems.push({
			iconCls: 'btn-save',
			text:GO.lang.cmdSaveAs,
			menu:this.saveAsMenu,
			multiple:true
		});
	}

	this.gridContextMenu = new GO.menu.RecordsContextMenu({
		shadow: "frame",
		minWidth: 180,
		items: contextItems
	});

	this.treePanel = new GO.email.AccountsTree({
		id:'email-tree-panel',
		region:'west'
	});

	// set the root node
	var root = new Ext.tree.AsyncTreeNode({
		text: GO.email.lang.accounts,
		draggable:false
	});
	this.treePanel.setRootNode(root);
	
	this.treeContextMenu = new Ext.menu.Menu({		
		
		items: [this.addFolderButton = new Ext.menu.Item({
			iconCls: 'btn-add',
			text: GO.email.lang.addFolder,
			handler: function(){
				Ext.MessageBox.prompt(GO.lang.strName, GO.email.lang.enterFolderName, function(button, text){
					if(button=='ok')
					{						
						var sm = this.treePanel.getSelectionModel();		 
		 				var node = sm.getSelectedNode();
		 		
						Ext.Ajax.request({
							url: GO.settings.modules.email.url+'action.php',
							params: {
								task: 'add_folder',
								folder_id: node.attributes.folder_id,
								account_id: node.attributes.account_id,
								new_folder_name: text
							},
							callback: function(options, success, response)
							{
								if(!success)
								{
									Ext.MessageBox.alert(GO.lang.strError, response.result.errors);
								}else
								{
									var responseParams = Ext.decode(response.responseText);
									if(responseParams.success)
									{
										//remove preloaded children otherwise it won't request the server
										delete node.attributes.children;
										node.reload();
									}else
									{
										Ext.MessageBox.alert(GO.lang.strError,responseParams.feedback);
									}								
								}
							},
							scope: this
						});
					}

				}, this);
			},
			scope:this
		}),'-',
		{
			iconCls: 'btn-delete', 
			text: GO.email.lang.emptyFolder, 
			handler: function(){
				
				var sm = this.treePanel.getSelectionModel();		 
		 		var node = sm.getSelectedNode();
					
				var t = new Ext.Template(GO.email.lang.emptyFolderConfirm);
				
				Ext.MessageBox.confirm(GO.lang['strConfirm'], t.applyTemplate(node.attributes), function(btn){
					if(btn=='yes')
					{
						Ext.Ajax.request({
							url: GO.settings.modules.email.url+'action.php',
							params:{
								task:'empty_folder',
								account_id: node.attributes.account_id,
								mailbox: node.attributes.mailbox
							},
							callback:function(){
								if(node.attributes.mailbox==this.mailbox)
								{
									this.messagesGrid.store.removeAll();										
								}
								this.updateFolderStatus(node.attributes.folder_id);
								this.updateNotificationEl();
							},
						scope: this
						});
					}
				}, this);
			},
			scope:this			
		},{
			iconCls: 'btn-delete',
			text: GO.lang.cmdDelete,
			cls: 'x-btn-text-icon',
			scope: this,
			handler: function(){				
				var sm = this.treePanel.getSelectionModel();		 
		 		var node = sm.getSelectedNode();

				if(!node|| node.attributes.folder_id<1)
				{
					Ext.MessageBox.alert(GO.lang.strError, GO.email.lang.selectFolderDelete);
				}else if(node.attributes.mailbox=='INBOX')
				{
					Ext.MessageBox.alert(GO.lang.strError, GO.email.lang.cantDeleteInboxFolder);
				}else
				{					
					GO.deleteItems({
						url: GO.settings.modules.email.url+'action.php',
						params: {
							task: 'delete_folder',
							folder_id: node.attributes.folder_id
						},
						callback: function(responseParams)
						{
							if(responseParams.success)
							{
								node.remove();
							}else
							{
								Ext.MessageBox.alert(GO.lang.strError,responseParams.feedback);
							}
						},
						count: 1,
						scope: this	
					});					
				}				
			}
    }]
	});
	
	
	
	this.treePanel.on('contextmenu', function(node, e){
		e.stopEvent();		
		
		var selModel = this.treePanel.getSelectionModel();
		
		if(!selModel.isSelected(node))
		{
			selModel.clearSelections();
			selModel.select(node);
		}
		
		var coords = e.getXY();

		this.addFolderButton.setDisabled(!node.attributes.canHaveChildren);
		this.treeContextMenu.showAt([coords[0], coords[1]]);		
	}, this);
	


	this.treePanel.on('beforenodedrop', function(e){
		var s = e.data.selections, messages = [];

		for(var i = 0, len = s.length; i < len; i++){

			if(this.account_id != e.target.attributes['account_id'])
			{
				Ext.MessageBox.alert(GO.lang['strError'], GO.email.lang.crossAccountMove);
				return false
			}else if(this.mailbox == e.target.mailbox)
			{
				return false;
			}else{
				messages.push(s[i].id);
			}
		}

		if(messages.length>0)
		{			
			this.messagesGrid.store.baseParams['action']='move';
			this.messagesGrid.store.baseParams['from_mailbox']=this.mailbox;
			this.messagesGrid.store.baseParams['to_mailbox']=e.target.attributes['mailbox'];
			this.messagesGrid.store.baseParams['messages']=Ext.encode(messages);
			
			this.messagesGrid.store.reload();
	
			delete this.messagesGrid.store.baseParams['action'];
			delete this.messagesGrid.store.baseParams['from_mailbox'];
			delete this.messagesGrid.store.baseParams['to_mailbox'];
			delete this.messagesGrid.store.baseParams['messages'];	
		}
	},
	this);
	
	//select the first inbox to be displayed in the messages grid
	root.on('load', function(node)
	{		
		this.body.unmask();
		if(node.childNodes[0])
		{
			var firstAccountNode = node.childNodes[0];
			
			this.updateNotificationEl();
			
			firstAccountNode.on('load', function(node){
				
				if(node.childNodes[0])
				{					
					var firstInboxNode = node.childNodes[0];
					
					this.setAccount(
						firstInboxNode.attributes.account_id,
						firstInboxNode.attributes.folder_id,
						firstInboxNode.attributes.mailbox,
						firstInboxNode.parentNode.attributes.usage
						);					
					this.checkMail.defer(this.checkMailInterval, this);
				}
			},this, {single: true});
			
			
		}
	}, this);
	
	this.treePanel.on('beforeclick', function(node){
		if(node.attributes.folder_id==0)
			return false;
	}, this);

	this.treePanel.on('click', function(node)	{		
		if(node.attributes.folder_id>0)
		{		
			var usage='';
			var cnode = node;
			while(cnode.parentNode && usage=='')
			{
				if(cnode.attributes.usage)
				{
					usage=cnode.attributes.usage;
				}else
				{
					cnode=cnode.parentNode;
				}
			}
			
			this.setAccount(
				node.attributes.account_id,
				node.attributes.folder_id,
				node.attributes.mailbox,
				usage
			);
		}
	}, this);	
	
	this.searchDialog = new GO.email.SearchDialog({store:this.messagesGrid.store});
	
	var settingsMenu = [{
		iconCls: 'btn-accounts',
		text: GO.email.lang.accounts,
		cls: 'x-btn-text-icon',
		handler: function(){
			this.showAccountsDialog();
		},
		scope: this
	},{
		iconCls:'btn-toggle-window',
		text: GO.email.lang.toggleWindowPosition,
		cls: 'x-btn-text-icon',
		handler: function(){
			this.moveGrid();								
		},
		scope: this
	}];
	
	if(GO.gnupg)
	{
		settingsMenu.push('-');
		settingsMenu.push({
			iconCls:'go-menu-icon-gnupg',
			cls: 'x-btn-text-icon',
			text:GO.gnupg.lang.encryptionSettings,
			handler:function(){
				if(!this.securityDialog)
				{
					this.securityDialog = new GO.gnupg.SecurityDialog();
				}
				this.securityDialog.show();
			},
			scope:this
		});
	}
	
	var tbar =[{
					iconCls: 'btn-compose',
					text: GO.email.lang['compose'],
					cls: 'x-btn-text-icon',
					handler: function(){
						
						GO.email.showComposer({
							account_id: this.account_id
						});
					},
					scope: this
				},{
					iconCls: 'btn-delete',
					text: GO.lang.cmdDelete,
					cls: 'x-btn-text-icon',
					handler: this.deleteMessages,
					scope: this
				},new Ext.Toolbar.Separator(),
				{
					iconCls: 'btn-settings',
					text:GO.lang.cmdSettings,
					menu: {
          	items: settingsMenu
					}				
				},{					
					iconCls: 'btn-refresh',
					text: GO.lang.cmdRefresh,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.refresh(true);
					},
					scope: this
				},
				{
					iconCls: 'btn-search',
					text: GO.lang.strSearch,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.searchDialog.show();									
					},
					scope: this
				},
				this.resetSearchButton = new Ext.Button({					
					iconCls: 'btn-delete',
					text: GO.email.lang.resetSearch,
					cls: 'x-btn-text-icon',
					hidden:true,
					handler: function(){
						this.messagesGrid.store.baseParams['query']='';	
						this.messagesGrid.store.load({params:{start:0}});							
					},
					scope: this
				})
				,
				'-',
				this.replyButton=new Ext.Button({
					disabled:true,
					iconCls: 'btn-reply',
					text: GO.email.lang.reply,
					cls: 'x-btn-text-icon',
					handler: function(){
						
						GO.email.showComposer({
							uid: this.messagePanel.uid, 
							task: 'reply',
							mailbox: this.mailbox,
							account_id: this.account_id
						});
					},
					scope: this
				}),this.replyAllButton=new Ext.Button({
					disabled:true,
					iconCls: 'btn-reply-all',
					text: GO.email.lang.replyAll,
					cls: 'x-btn-text-icon',
					handler: function(){
						GO.email.showComposer({
							uid: this.messagePanel.uid, 
							task: 'reply_all',
							mailbox: this.mailbox,
							account_id: this.account_id
							
							});
					},
					scope: this
				}),this.forwardButton=new Ext.Button({
					disabled:'true',
					iconCls: 'btn-forward',
					text: GO.email.lang.forward,
					cls: 'x-btn-text-icon',
					handler: function(){
						GO.email.showComposer({
							uid: this.messagePanel.uid, 
							task: 'forward',
							mailbox: this.mailbox,
							account_id: this.account_id
							});
					},
					scope: this
				}),
				
				this.printButton = new Ext.Button({
					disabled: true,					
					iconCls: 'btn-print',
					text: GO.lang.cmdPrint,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.messagePanel.body.print();												
					},
					scope: this
				})];
				
				
				if(GO.mailings)
				{
					tbar.push({
						iconCls: 'btn-save',
						text:GO.lang.cmdSaveAs,
						menu:this.saveAsMenu
					});
				}
				
				tbar.push(new Ext.Toolbar.Separator());				
				
				
				tbar.push(this.closeMessageButton = new Ext.Button({					
					hidden:true,
					iconCls: 'btn-close',
					text: GO.lang.cmdClose,
					cls: 'x-btn-text-icon',
					handler: function(){
						this.messagesGrid.expand();
								
					},
					scope: this
				}));

	
	config.layout='border';
	config.tbar=new Ext.Toolbar({		
			cls:'go-head-tb',
			items: tbar
			});

	this.messagePanel = new GO.email.MessagePanel({
					id:'email-message-panel',
					region:'center',
					autoScroll:true,
					titlebar: false,
					border:true,
					attachmentContextMenu: new GO.email.AttachmentContextMenu({emailClient:this})
				});				

	config.items=[
		this.treePanel,
		{
      region:'center',
      titlebar: false,
      layout:'border',														
			items: [
				this.messagePanel,
				this.topMessagesGrid,
				this.leftMessagesGrid				
			]
  	}];

  	
  this.messagePanel.on('load', function(options, success, response){
  	if(!success)
		{
			this.messagePanel.uid=0;
		}else
		{
			//this.messagePanel.uid=record.data['uid'];
			
			this.replyAllButton.setDisabled(false);
			this.replyButton.setDisabled(false);
			this.forwardButton.setDisabled(false);
			this.printButton.setDisabled(false);
			
			var record = this.messagesGrid.store.getById(this.messagePanel.uid);			
			if(record.data['new']==1)
			{		
				this.incrementFolderStatus(this.folder_id, -1);
				record.set('new','0');									
			}
		}		
  	
  }, this);
  
  this.messagePanel.on('reset', function(){
  	this.replyAllButton.setDisabled(true);
		this.replyButton.setDisabled(true);
		this.forwardButton.setDisabled(true);
		this.printButton.setDisabled(true);
  }, this);
  	
  
  this.messagePanel.on('linkClicked', function(href){ 	
  	var win = window.open(href);
  	win.focus();
  }, this);
  
  this.messagePanel.on('attachmentClicked', this.openAttachment, this);
  this.messagePanel.on('zipOfAttachmentsClicked', this.openZipOfAttachments, this);
  
  
  /*this.messagePanel.on('emailClicked', function(email){
  	this.showComposer({to: email});
  }, this);*/
  
  /*
   * for email seaching on sender from message panel
   */
  GO.email.searchSender=function(sender)
	{
		if(this.rendered)
		{
			this.messagesGrid.store.baseParams.query='FROM "'+sender+'"';
			this.messagesGrid.store.load({params:{start:0}});
			
			if(GO.mainLayout.tabPanel)
				GO.mainLayout.tabPanel.setActiveTab(this.id);
		}else
		{
			alert(GO.email.lang.loadEmailFirst);
		}
	}	
	GO.email.searchSender = GO.email.searchSender.createDelegate(this);
  
  GO.email.EmailClient.superclass.constructor.call(this, config);	
};

Ext.extend(GO.email.EmailClient, Ext.Panel,{	
	
	moveGrid : function(){		
		if(this.topMessagesGrid.isVisible())
		{
			this.messagesGrid=this.leftMessagesGrid;
			this.topMessagesGrid.hide();
	    
		}else
		{			
			this.messagesGrid=this.topMessagesGrid;
			this.leftMessagesGrid.hide();	   
		}
		//this.messagesGridContainer.add(this.messagesGrid);
    this.messagesGrid.show();
    this.messagesGrid.ownerCt.doLayout();
    
    Ext.state.Manager.set('em-msgs-top', Ext.encode(this.topMessagesGrid.isVisible()));
	},
	
	addGridHandlers : function(grid)
	{		
		grid.on("rowcontextmenu", function(grid, rowIndex, e) {
			var coords = e.getXY();
			this.gridContextMenu.showAt([coords[0], coords[1]], grid.getSelectionModel().getSelections());
		},this);
		
		grid.on('collapse', function(){
			this.closeMessageButton.setVisible(true);
		}, this);
		
		grid.on('expand', function(){
			this.closeMessageButton.setVisible(false);
		}, this);	
		
		grid.on("rowdblclick", function(){		
			if(this.messagesGrid.store.reader.jsonData.drafts)
			{
				GO.email.showComposer({
					uid: this.messagePanel.uid, 
					task: 'opendraft',
					template_id: 0,
					mailbox: this.mailbox,
					account_id: this.account_id
				});
			}else
			{	
				this.messagesGrid.collapse();
			}
		}, this);	

		//this.messagesGrid.getSelectionModel().on("rowselect",function(sm, rowIndex, r){
		grid.on("delayedrowselect",function(grid, rowIndex, r){
			if(r.data['uid']!=this.messagePanel.uid)
			{
				//this.messagePanel.uid=r.data['uid'];			
				this.messagePanel.loadMessage(r.data.uid, this.mailbox, this.account_id);			
			}
		}, this);		
	},
	
	checkMailInterval : 300000,
	//checkMailInterval : 5000,
	
	justMarkedUnread : 0, 
	
	deleteMessages : function(){ 
		this.messagesGrid.deleteSelected({
			callback : function(config){
				var keys = Ext.decode(config.params.delete_keys);				
				for(var i=0;i<keys.length;i++)
				{
					if(this.messagePanel.uid==keys[i])
					{
						this.messagePanel.reset();
					}
				}
			},
			scope: this
		}); 
	},
	
	afterRender : function(){
		GO.email.EmailClient.superclass.afterRender.call(this);		
		
		this.body.mask(GO.lang.waitMsgLoad);
		
		//create notify icon
		
		var notificationArea = Ext.get('notification-area');		
		if(notificationArea)
		{
			this.notificationEl = notificationArea.createChild({
				id: 'ml-notify',
				tag:'a',
				href:'#',
				style:'display:none'				
			});
			this.notificationEl.on('click', function(){
				//GO.mainLayout.getModulePanel('email').show();
				this.show();
			}, this);
		}
	},
	
	onShow : function(){		
		if(this.notificationEl){
			this.notificationEl.setDisplayed(false);
		}
		
		GO.email.EmailClient.superclass.onShow.call(this);	
	},	
	
	updateNotificationEl : function(){
		
		if(this.notificationEl)
		{
			var node = this.treePanel.getRootNode();
			
	
			var inbox_new=0;
			for(var i=0;i<node.childNodes.length;i++)
			{			
				inbox_new += node.childNodes[i].attributes.inbox_new;			
			}
			
			var current = this.notificationEl.dom.innerHTML;
			
			if(current!='' && inbox_new-this.justMarkedUnread>current)
			{
				GO.playAlarm();
				this.notificationEl.setDisplayed(!this.isVisible());
			}
			
			this.notificationEl.update(inbox_new);
			
			this.justMarkedUnread=0;
		}
	},
	
	saveAttachment : function(attachment)
	{
		if(!GO.files.saveAsDialog)
  	{
  		GO.files.saveAsDialog = new GO.files.SaveAsDialog();
  	}
  	GO.files.saveAsDialog.show({
  		filename: attachment.name,
  		handler:function(dialog, folder_id, filename){
  			dialog.el.mask(GO.lang.waitMsgLoad);
  			Ext.Ajax.request({
  				url: GO.settings.modules.email.url+'action.php',
  				params:{
  					task:'save_attachment',
  					uid: this.messagePanel.uid,
  					mailbox: this.mailbox, 
		  			part: attachment.number,
		  			transfer: attachment.transfer,
		  			mime: attachment.mime,
		  			account_id: this.account_id,
		  			uuencoded_partnumber: attachment.uuencoded_partnumber,
		  			folder_id: folder_id,
		  			filename: filename
  				},
  				callback: function(options, success, response)
					{	
						dialog.el.unmask();
						if(!success)
						{
							alert( GO.lang['strRequestError']);
						}else
						{
							var responseParams = Ext.decode(response.responseText);
							if(!responseParams.success)
							{
								alert( responseParams.feedback);
							}else
							{
								dialog.hide();
							}						
						}
					},
					scope:this				
  			});
  		},
  		scope:this
  	});
	},
	
	openAttachment :  function(attachment, panel, forceDownload)
	{		
		if(attachment.mime.indexOf('message')>-1)
  	{
  		GO.linkHandlers[9].call(this, 0, {
  			uid: this.messagePanel.uid, 
  			mailbox: this.mailbox, 
  			part: attachment.number,
  			transfer: attachment.transfer,
  			mime: attachment.mime,
  			account_id: this.account_id
  			});	
  	}else
  	{	
			switch(attachment.extension)
			{		
				case 'dat':
					document.location.href=GO.settings.modules.email.url+
						'tnef.php?account_id='+this.account_id+
						'&mailbox='+encodeURIComponent(this.mailbox)+
						'&uid='+this.messagePanel.uid+						
						'&part='+attachment.number+
						'&transfer='+attachment.transfer+
						'&mime='+attachment.mime+
						'&uuencoded_partnumber='+attachment.uuencoded_partnumber+
						'&filename='+encodeURIComponent(attachment.name);
				break;
				
				case 'asc':
				
					if(!forceDownload && GO.gnupg)
					{
						Ext.Ajax.request({
							url: GO.settings.modules.gnupg.url+'action.php',
							params: {
								task: 'check_public_key_attachment',
								account_id: this.account_id,
								mailbox: this.mailbox,
								uid: this.messagePanel.uid,
								part: attachment.number,
								uuencoded_partnumber: attachment.uuencoded_partnumber,
								transfer: attachment.transfer
							},
							callback: function(options, success, response)
							{
								if(success)
								{
									var rParams = Ext.decode(response.responseText);
									
									if(!rParams.is_public_key)
									{
										document.location.href=GO.settings.modules.email.url+
											'attachment.php?account_id='+this.account_id+
											'&mailbox='+encodeURIComponent(this.mailbox)+
											'&uid='+this.messagePanel.uid+
											'&sender='+this.messagePanel.data.sender+
											'&part='+attachment.number+
											'&transfer='+attachment.transfer+
											'&mime='+attachment.mime+
											'&uuencoded_partnumber='+attachment.uuencoded_partnumber+
											'&filename='+ encodeURIComponent(attachment.name);
									}else
									{																		
										if(confirm(GO.gnupg.lang.importPublicKeyAttachment))
										{
											Ext.Ajax.request({
												url: GO.settings.modules.gnupg.url+'action.php',
												params: {task: 'import_public_key_attachment'},
												callback: function(options, success, response){													
													if(success)
													{
														var rParams = Ext.decode(response.responseText);														
														alert(rParams.feedback);														
													}else
													{
														alert(GO.lang.strRequestError);
													}
												}
											});
										}
									}
								}
							},
							scope: this
						});	
						
						break;
					}
				
				case 'vcs':
				case 'ics':
					if(!forceDownload)
					{
						Ext.Ajax.request({
							url: GO.settings.modules.email.url+'json.php',
							params: {
								task: 'icalendar_attachment',
								account_id: this.account_id,
								mailbox: this.mailbox,
								uid: this.messagePanel.uid,
								part: attachment.number,
								uuencoded_partnumber: attachment.uuencoded_partnumber,
								transfer: attachment.transfer
							},
							callback: function(options, success, response)
							{
								if(success)
								{
									var values = Ext.decode(response.responseText);
									
									if(!values.success)
									{
										alert(values.feedback);
									}else
									{																		
										GO.calendar.eventDialog.show({
											values: values
										});
									}
								}else
								{
									alert( GO.lang.strRequestError);
								}
							},
							scope: this
						});	
						break;
					}
				
				case 'bmp':
				case 'png':
				case 'gif':
				case 'jpg':
				case 'jpeg':
				
				if(GO.files && !forceDownload)
				{
					if(!this.imageViewer)
					{
						this.imageViewer = new GO.files.ImageViewer({
							closeAction:'hide'
						});
					}
					
					var index = 0;
					var images = Array();
					if(panel)
					{
						for (var i = 0; i < panel.data.attachments.length;  i++)
						{
							var r = panel.data.attachments[i];
							var ext = GO.util.getFileExtension(r.name);
							
							if(ext=='jpg' || ext=='png' || ext=='gif' || ext=='bmp' || ext=='jpeg')
							{
								images.push({
									name: r.name, 
									src: GO.settings.modules.email.url+
									'attachment.php?account_id='+this.account_id+
									'&mailbox='+encodeURIComponent(this.mailbox)+
									'&uid='+this.messagePanel.uid+
									'&part='+r.number+
									'&transfer='+r.transfer+
									'&mime='+r.mime+
									'&uuencoded_partnumber='+attachment.uuencoded_partnumber+
									'&filename='+encodeURIComponent(r.name)
									});
							}
							if(r.name==attachment.name)
							{
								index=images.length-1;
							}
						}
						this.imageViewer.show(images, index);
						break;
					}
				}			
				
				
				default:
					document.location.href=GO.settings.modules.email.url+
						'attachment.php?account_id='+this.account_id+
						'&mailbox='+encodeURIComponent(this.mailbox)+
						'&uid='+this.messagePanel.uid+
						'&sender='+this.messagePanel.data.sender+
						'&part='+attachment.number+
						'&transfer='+attachment.transfer+
						'&mime='+attachment.mime+
						'&uuencoded_partnumber='+attachment.uuencoded_partnumber+
						'&filename='+ encodeURIComponent(attachment.name);
					break;
			}
  	}
	},
	
	openZipOfAttachments : function()
	{
		document.location.href=GO.settings.modules.email.url+
		'zip_attachments.php?account_id='+this.account_id+
		'&mailbox='+encodeURIComponent(this.mailbox)+
		'&uid='+this.messagePanel.uid;	
	},
	
	showComposer : function(values)
	{
		GO.email.showComposer(
		{
			account_id: this.account_id,
			values : values
		});
	},
	
	setAccount : function(account_id,folder_id,mailbox, usage)
	{
		if(folder_id!=this.folder_id)
		{
			this.messagePanel.reset();
			this.messagesGrid.getSelectionModel().clearSelections();
		}
		
		this.messagesGrid.expand();
		
		this.account_id = account_id;
		this.folder_id = folder_id;
		this.mailbox = mailbox;

		//messagesPanel.setTitle(mailbox);
		this.messagesGrid.store.baseParams['task']='messages';
		this.messagesGrid.store.baseParams['account_id']=account_id;
		this.messagesGrid.store.baseParams['folder_id']=folder_id;
		this.messagesGrid.store.baseParams['mailbox']=mailbox;
		this.messagesGrid.store.load({params:{start:0}});
		//this.messagesGrid.store.load();
		
		this.treePanel.setUsage(usage);
	},
	/**
	 * Returns true if the current folder needs to be refreshed in the grid
	 */
	updateFolderStatus : function(folder_id, unseen)
	{
		var statusEl = Ext.get('status_'+folder_id);
		
		var isGridFolder = false;
		
		var node = this.treePanel.getNodeById('folder_'+folder_id);
		if(node && node.attributes.mailbox=='INBOX')
		{
			node.parentNode.attributes.inbox_new=unseen;
		}
		
		if(statusEl && statusEl.dom)
		{
			var statusText = statusEl.dom.innerHTML;
			var current = statusText=='' ? 0 : parseInt(statusText.substring(1, statusText.length-1));
			
			if(current != unseen)
			{		
				if(unseen>0)
				{
					statusEl.dom.innerHTML = "("+unseen+")";
				}else
				{
					statusEl.dom.innerHTML = "";
				}
				return true;
			}
		}
		return false;
	},
	
	incrementFolderStatus : function(folder_id, increment)
	{
		//decrease treeview status id is defined in tree_json.php
		var statusEl = Ext.get('status_'+folder_id);
		
		var statusText = statusEl.dom.innerHTML;
		
		var status = 0;
		if(statusText!='')
		{
			var status = parseInt(statusText.substring(1, statusText.length-1));
		}
		status+=increment;
		
		this.updateFolderStatus(folder_id, status);
		this.updateNotificationEl();
	},	
	
	
	checkMail : function(){		
		Ext.Ajax.request({
			url: GO.settings.modules.email.url+'action.php',
			params: {
				task: 'check_mail'
			},
			callback: function(options, success, response)
			{
				if(success)
				{
					var responseParams = Ext.decode(response.responseText);
					
					for(var folder_id in responseParams.status)
					{
						var changed = this.updateFolderStatus(folder_id, responseParams.status[folder_id].unseen);
						if(changed && this.messagesGrid.store.baseParams.folder_id==folder_id)
						{
							this.messagesGrid.store.reload();
						}
					}					
					this.updateNotificationEl();
					
					this.checkMail.defer(this.checkMailInterval, this);
				}
			},
			scope: this
		});	
	},


	refresh : function(refresh)
	{		
		if(refresh)
			this.treePanel.loader.baseParams.refresh=true;
			
		this.treePanel.root.reload();
		this.messagesStore.removeAll();
		
		if(refresh)
			delete this.treePanel.loader.baseParams.refresh;
	},

	showAccountsDialog : function()
	{
		if(!this.accountsDialog)
		{
			this.accountsDialog = new GO.email.AccountsDialog();
			this.accountsDialog.accountsGrid.accountDialog.on('save', function(dialog, result){
					if(result.refreshNeeded){
						this.refresh();
					}
				}, this);
				
			this.accountsDialog.accountsGrid.on('delete', function(){this.refresh();}, this);
			this.accountsDialog.accountsGrid.store.load();				
		}
		this.accountsDialog.show();
	},
	
	doTaskOnMessages : function (task){
		var selectedRows = this.messagesGrid.selModel.selections.keys;

		if(selectedRows.length)
		{
			
			Ext.Ajax.request({
				url: GO.settings.modules.email.url+'action.php',
				params: {
					task: 'flag_messages',
					account_id: this.account_id,
					mailbox: this.mailbox,
					action: task,
					messages: Ext.encode(selectedRows)
				},
				callback: function(options, success, response)
				{

					if(!success)
					{
						Ext.MessageBox.alert(GO.lang['strError'], GO.lang['strRequestError']);
					}else
					{							
						
						var responseParams = Ext.decode(response.responseText);
						if(!responseParams.success)
						{
							Ext.MessageBox.alert(GO.lang['strError'], responseParams.feedback);
						}else
						{
							var field;
							var value;
							
							var records = this.messagesGrid.selModel.getSelections();
							
							switch(task)
							{
								case 'mark_as_read':							
									field='new';
									value=false;
									
									this.justMarkedUnread=-records.length;									
									break;
								case 'mark_as_unread':
									field='new';
									value=true;
									
									this.justMarkedUnread=records.length;									
									break;
									
								case 'flag':					
									field='flagged';
									value=true;							
									break;
								case 'unflag':					
									field='flagged';
									value=false;
									break;
							}
							
							
							for(var i=0;i<records.length;i++)
							{
								records[i].set(field, value);
								records[i].commit();
							}
							
							this.updateFolderStatus(this.folder_id, responseParams.unseen);
							this.updateNotificationEl();
						}
					}
				},
				scope:this
			});
		
		}
	},
	
	addSendersTo : function(menuItem){
		var records = this.messagesGrid.getSelectionModel().getSelections();
		
		var emails=[];
		for(var i=0;i<records.length;i++)
		{
			emails.push('"'+records[i].get('from')+'" <'+records[i].get('sender')+'>');
		}
		
		var activeComposer=false;
		if(GO.email.composers)
		{
			for(var i=GO.email.composers.length-1;i>=0;i--)
			{
				if(GO.email.composers[i].isVisible())
				{
					activeComposer=GO.email.composers[i];
					break;
				}
			}
		}
		
		if(activeComposer)
		{
			var f = activeComposer.formPanel.form.findField(menuItem.field);
			var v = f.getValue();
			if(v!='')
			{
				v+=', ';
			}
			v+=emails.join(', ');
			f.setValue(v);
			activeComposer.focus();
		}else
		{
			var config={values:{}}		
			config.values[menuItem.field]=emails.join(', ');		
			GO.email.showComposer(config);
		}
	}
	
});

GO.mainLayout.onReady(function(){
	//GO.email.Composer = new GO.email.EmailComposer();
	
	//contextmenu when an e-mail address is clicked
	GO.email.addressContextMenu=new GO.email.AddressContextMenu();
	
	
});

GO.email.aliasesStore = new GO.data.JsonStore({
	    url: GO.settings.modules.email.url+ 'json.php',
	    baseParams: {
	    	task: 'all_aliases'
	    	},
	    root: 'results',
	    id: 'id',
	    totalProperty:'total',
	    fields: ['id','account_id','name','email','html_signature', 'plain_signature'],
	    remoteSort: true
	});



	
/**
 * Function that will open an email composer. If a composer is already open it will create a new one. Otherwise it will reuse an already created one.
 */
GO.email.showComposer = function(config){
	
	config = config || {};
	
	GO.email.composers = GO.email.composers || [];
	
	var availableComposer;

	for(var i=0;i<GO.email.composers.length;i++)
	{
		if(!GO.email.composers[i].isVisible())
		{
			availableComposer=GO.email.composers[i];
			break;
		}
	}
	
	if(!availableComposer)
	{
		config.move=30*GO.email.composers.length;
		
		availableComposer = new GO.email.EmailComposer();
		availableComposer.on('send', function(composer){			
			if(composer.sendParams.reply_uid && composer.sendParams.reply_uid>0)
			{
				var record = GO.email.messagesGrid.store.getById(composer.sendParams.reply_uid);
				if(record)
				{
					record.set('answered',true);
				}
			}
			
			if(GO.email.messagesGrid && GO.email.messagesGrid.store.loaded && (GO.email.messagesGrid.store.reader.jsonData.sent || (GO.email.messagesGrid.store.reader.jsonData.drafts && composer.sendParams.draft_uid && composer.sendParams.draft_uid>0)))
			{
				GO.email.messagesGrid.store.reload();
			}
		});
		
		availableComposer.on('save', function(composer){			

			if(GO.email.messagesGrid && GO.email.messagesGrid.store.loaded && GO.email.messagesGrid.store.reader.jsonData.drafts)
			{
				GO.email.messagesGrid.store.reload();
			}
		});
		
		GO.email.composers.push(availableComposer);
	}	
	
	availableComposer.show(config);
	
	return availableComposer;	
}


GO.moduleManager.addModule('email', GO.email.EmailClient, {
	title : GO.lang.strEmail,
	iconCls : 'go-tab-icon-email'
});


GO.email.showAddressMenu = function(e, email, name)
{
	var e = Ext.EventObject.setEvent(e);
	e.preventDefault();
	GO.email.addressContextMenu.showAt(e.getXY(), email, name);
}	


GO.linkHandlers[9] = function(id, remoteMessage){
	
	var messagePanel = new GO.email.MessagePanel({
			border:false,
			autoScroll:true
		});		
		
	messagePanel.on('linkClicked', function(href){
  	var win = window.open(href);
  	win.focus();
  }, this);
  
  messagePanel.on('attachmentClicked', function(attachment, panel){ 	
  	if(attachment.mime.indexOf('message')>-1)
  	{
  		remoteMessage.part_number=attachment.number+".0";
  		GO.linkHandlers[9].call(this, id, remoteMessage);
  	}else
  	{
	  	if(panel.data.path)
	  	{
	  		document.location.href=GO.settings.modules.email.url+
	  			'mimepart.php?path='+
	  			encodeURIComponent(panel.data.path)+'&part_number='+attachment.number;
	  	}else
	  	{
	  		document.location.href=GO.settings.modules.email.url+
	  			'mimepart.php?uid='+remoteMessage.uid+'' +
	  			'&account_id='+remoteMessage.account_id+'' +
	  			'&transfer='+remoteMessage.transfer+'' +
	  			'&mailbox='+encodeURIComponent(remoteMessage.mailbox)+'' +
	  			'&part='+remoteMessage.part+'' +
	  			'&part_number='+attachment.number;
	  	}
  	}
  	
  	
  }, this);
  messagePanel.on('zipOfAttachmentsClicked', function(){}, this);
  
	
	var win = new Ext.Window({
			maximizable:true,
			collapsible:true,
			title: GO.email.lang.emailMessage,
			height: 400,
			width: 600,
			layout:'fit',
			items: messagePanel,		
			tbar:[{		
					iconCls: 'btn-print',
					text: GO.lang.cmdPrint,
					cls: 'x-btn-text-icon',
					handler: function(){
						messagePanel.body.print();												
					}
				}],
			buttons:[{
				text:GO.lang.cmdClose,
				handler:function(){
					win.close();
				}
			}]
		});
		
	
	win.show();
	messagePanel.el.mask(GO.lang.strWaitMsgLoad);

	if(!remoteMessage)
		remoteMessage={};
	
	remoteMessage.id=id;
	
	var url = '';
	if(remoteMessage.account_id)
	{
		remoteMessage.task='message_attachment';
		url = GO.settings.modules.email.url+'json.php';
	}else
	{
		remoteMessage.task='linked_message';
		url = GO.settings.modules.mailings.url+'json.php';
	}
	

	Ext.Ajax.request({
			url: url,
			params: remoteMessage,
			scope: this,
			callback: function(options, success, response)
			{
				var data = Ext.decode(response.responseText);
				messagePanel.setMessage(data);				
				messagePanel.el.unmask();				
			}
		});
		
}