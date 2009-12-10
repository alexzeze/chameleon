GO.tasks.TasklistDialog = function(config)
{
	if(!config)
	{
		config = {};
	}
	
	this.propertiesTab = new Ext.form.FormPanel({
		waitMsgTarget:true,
		url: GO.settings.modules.tasks.url+'action.php',
		title:GO.lang['strProperties'],
		layout:'form',
		anchor: '100% 100%',
		defaultType: 'textfield',
		autoHeight:true,
		cls:'go-form-panel',waitMsgTarget:true,
		labelWidth: 75,
   
		items: [
		this.selectUser = new GO.form.SelectUser({
			fieldLabel: GO.lang['strUser'],
			disabled: !GO.settings.modules['tasks']['write_permission'],
			value: GO.settings.user_id,
			anchor: '100%'
		}),
		{
			fieldLabel: GO.lang['strName'],
			name: 'name',
			allowBlank:false,
			anchor: '100%'
		},this.exportButton = new Ext.Button({			
				text:GO.lang.cmdExport,
				disabled:true,
				handler:function(){
					document.location=GO.settings.modules.tasks.url+'export.php?tasklist_id='+this.tasklist_id;
				},
				scope:this
			})
		]
	});


	this.readPermissionsTab = new GO.grid.PermissionsPanel({
		title: GO.lang['strReadPermissions']
	});

	this.writePermissionsTab = new GO.grid.PermissionsPanel({
		title: GO.lang['strWritePermissions']
	});
	
	var uploadFile = new GO.form.UploadFile({
		inputName : 'ical_file',	   
		max:1 			
	});
	
	uploadFile.on('filesChanged', function(input, inputs){
		this.importButton.setDisabled(inputs.getCount()==1);
	}, this);
	

	this.importTab = new Ext.form.FormPanel({
		fileUpload:true,
		waitMsgTarget:true,
		disabled:true,
		title:GO.lang.cmdImport,
		items: [{
			xtype: 'panel',
			html: GO.calendar.lang.selectIcalendarFile,
			border:false	
		},uploadFile,this.importButton = new Ext.Button({
				xtype:'button',
				disabled:true,
				text:GO.lang.cmdImport,
				handler: function(){						
					this.importTab.form.submit({
						//waitMsg:GO.lang.waitMsgUpload,
						url:GO.settings.modules.tasks.url+'action.php',
						params: {task: 'import', tasklist_id:this.tasklist_id},
						success: function(form,action)
						{				
							uploadFile.clearQueue();		

							if(action.result.success)
							{
								Ext.MessageBox.alert(GO.lang.strSuccess,action.result.feedback);
							}else
							{
								Ext.MessageBox.alert(GO.lang.strError,action.result.feedback);
							}						
						},
						failure: function(form, action) {
							Ext.MessageBox.alert(GO.lang.strError, action.result.feedback);
						},
						scope: this
					});
				}, 
				scope: this
			})],
		cls: 'go-form-panel'
	});

	this.tabPanel = new Ext.TabPanel({
			hideLabel:true,
			deferredRender:false,
			xtype:'tabpanel',
			activeTab: 0,
			border:false,
			anchor: '100% 100%',
			items:[
			this.propertiesTab,
			this.readPermissionsTab,
			this.writePermissionsTab,
			this.importTab 
			]
		});
	
	
	GO.tasks.TasklistDialog.superclass.constructor.call(this,{
					title: GO.tasks.lang.tasklist,
					layout:'fit',
					modal:false,
					height:500,
					width:400,
						
					items: this.tabPanel,
					buttons:[
					{
						text:GO.lang['cmdOk'],
						handler: function(){this.save(true)},
						scope: this
					},
					{
						text:GO.lang['cmdApply'],
						handler: function(){this.save(false)},
						scope: this
					},

					{
						text:GO.lang['cmdClose'],
						handler: function(){this.hide()},
						scope: this
					}
					]
				});
}

Ext.extend(GO.tasks.TasklistDialog, Ext.Window, {
	
	initComponent : function(){
		
		this.addEvents({'save' : true});
		
		GO.tasks.TasklistDialog.superclass.initComponent.call(this);
		
		
	},
				
	show : function (tasklist_id){		
		if(!this.rendered)
			this.render(Ext.getBody());
			
		this.propertiesTab.show();
			
		if(tasklist_id > 0)
		{
			if(tasklist_id!=this.tasklist_id)
			{
				this.loadTasklist(tasklist_id);
			}else
			{
				GO.tasks.TasklistDialog.superclass.show.call(this);
			}
		}else
		{
			this.tasklist_id=0;
			this.propertiesTab.form.reset();
			

			this.readPermissionsTab.setDisabled(true);
			this.writePermissionsTab.setDisabled(true);

			this.exportButton.setDisabled(true);
			this.importTab.setDisabled(true);
		

			GO.tasks.TasklistDialog.superclass.show.call(this);
		}
	},
	loadTasklist : function(tasklist_id)
	{
		this.propertiesTab.form.load({
			url: GO.settings.modules.tasks.url+'json.php',
			params: {
				tasklist_id:tasklist_id,
				task: 'tasklist'
			},
			
			success: function(form, action) {
				this.tasklist_id=tasklist_id;
				this.selectUser.setRemoteText(action.result.data.user_name);
				this.readPermissionsTab.setAcl(action.result.data.acl_read);
				this.writePermissionsTab.setAcl(action.result.data.acl_write);
				
				this.exportButton.setDisabled(false);
				this.importTab.setDisabled(false);
				GO.tasks.TasklistDialog.superclass.show.call(this);
			},
			failure:function(form, action)
			{
				Ext.Msg.alert(GO.lang['strError'], action.result.feedback)
			},
			scope: this
		});
	},
	save : function(hide)
	{
		this.propertiesTab.form.submit({
				
			url:GO.settings.modules.tasks.url+'action.php',
			params: {
					'task' : 'save_tasklist', 
					'tasklist_id': this.tasklist_id
			},
			waitMsg:GO.lang['waitMsgSave'],
			success:function(form, action){
										
				if(action.result.tasklist_id)
				{
					this.tasklist_id=action.result.tasklist_id;
					this.readPermissionsTab.setAcl(action.result.acl_read);
					this.writePermissionsTab.setAcl(action.result.acl_write);
					
					this.exportButton.setDisabled(false);
					this.importTab.setDisabled(false);
				}
				
				this.fireEvent('save');
				
				if(hide)
				{
					this.hide();
				}
					
					
			},

			failure: function(form, action) {
				var error = '';
				if(action.failureType=='client')
				{
					error = GO.lang['strErrorsInForm'];
				}else
				{
					error = action.result.feedback;
				}
					
				Ext.MessageBox.alert(GO.lang['strError'], error);
			},
			scope:this

		});
			
	}
});
