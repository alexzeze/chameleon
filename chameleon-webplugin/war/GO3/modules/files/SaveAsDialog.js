GO.files.SaveAsDialog = Ext.extend(Ext.Window, {
	
	handler : function(){
		
	},
	initComponent : function(){
		
		this.layout='border';
		this.title=GO.files.lang.saveFile;
		this.height=450;
		this.width=700;
		this.border=false;
		this.collapsible=true;
		this.maximizable=true;
		this.closeAction='hide';
			
		this.buttons=[
				{
					text: GO.lang.cmdOk,				        						
					handler: function(){
						
						var files = this.fb.gridStore.getRange();
						
						for(var i=0;i<files.length;i++)
						{
							if(files[i].data.extension!='folder' && files[i].data.name==this.nameField.getValue())
							{
								var t = new Ext.Template(GO.files.lang.confirmOverwrite);
								
								if(!confirm(t.apply({filename: files[i].data.name})))
								{
									return false;
								}
								break;
							}
						}
						
						this.handler.call(this.scope, this, this.fb.folder_id, this.nameField.getValue());
					}, 
					scope: this 
				},{
					text: GO.lang.cmdClose,				        						
					handler: function(){
						this.hide();
					},
					scope:this
				}				
			];
		
		this.fb = new GO.files.FileBrowser({
			region:'center',
			border:false,
			loadDelayed:true,
			hideActionButtons:true,
			treeCollapsed:true,
			fileClickHandler: function(r){										
			},
			scope: this
		});
		
		this.fb.on('fileselected',function(fb, r){
			if(r.data.extension!='folder')
				this.formPanel.form.findField('filename').setValue(r.data.name);
		}, this);
		
		this.nameField = new Ext.form.TextField({				
				fieldLabel:GO.lang.strName,
				name:'filename',
				anchor:'100%',
				validator:function(v){
					return !v.match(/[&\/:\*\?"<>|\\]/);
				}
			});
			
		var focusField = function(){
			this.nameField.focus(true);
		};
		
		this.focus=focusField.createDelegate(this);
		
		this.formPanel = new Ext.form.FormPanel({
			region:'north',
			cls:'go-form-panel',
			height:32,
			items:this.nameField
		});
		
		this.items=[this.fb,this.formPanel];
		
		GO.files.SaveAsDialog.superclass.initComponent.call(this);
	},
	
	show : function(config){
		this.nameField.setValue(config.filename.replace(/[&\/:\*\?"<>|\\]/g, ""));
		
		var extension = GO.util.getFileExtension(config.filename);
		this.fb.setFilesFilter(extension);		
		
		if(!config.scope)
			config.scope=this;
		
		if(config.handler)
		{
			this.handler = config.handler.createDelegate(config.scope);
		}
		
		GO.files.SaveAsDialog.superclass.show.call(this);
	}
	
});