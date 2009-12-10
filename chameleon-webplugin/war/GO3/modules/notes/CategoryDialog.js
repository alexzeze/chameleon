/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: CategoryDialog.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.notes.CategoryDialog = function(config){
	
	
	if(!config)
	{
		config={};
	}
	
	
	this.buildForm();
	
	var focusFirstField = function(){
		this.propertiesPanel.items.items[0].focus();
	};
	
	
	config.maximizable=true;
	config.layout='fit';
	config.modal=false;
	config.resizable=false;
	config.width=700;
	config.height=500;
	config.closeAction='hide';
	config.title= GO.notes.lang.category;					
	config.items= this.formPanel;
	config.focus= focusFirstField.createDelegate(this);
	config.buttons=[{
			text: GO.lang['cmdOk'],
			handler: function(){
				this.submitForm(true);
			},
			scope: this
		},{
			text: GO.lang['cmdApply'],
			handler: function(){
				this.submitForm();
			},
			scope:this
		},{
			text: GO.lang['cmdClose'],
			handler: function(){
				this.hide();
			},
			scope:this
		}					
	];

	
	GO.notes.CategoryDialog.superclass.constructor.call(this, config);
	
	this.addEvents({'save' : true});	
}

Ext.extend(GO.notes.CategoryDialog, Ext.Window,{
	
	show : function (category_id) {

		if(!this.rendered)
			this.render(Ext.getBody());

		
		this.tabPanel.setActiveTab(0);
		
		
		
		if(!category_id)
		{
			category_id=0;			
		}
			
		this.setCategoryId(category_id);
		
		if(this.category_id>0)
		{
			this.formPanel.load({
				url : GO.settings.modules.notes.url+'json.php',
				
				success:function(form, action)
				{
					
					
					
					this.setWritePermission(action.result.data.write_permission);					
					this.readPermissionsTab.setAcl(action.result.data.acl_read);
					this.writePermissionsTab.setAcl(action.result.data.acl_write);
						
					
					this.selectUser.setRemoteText(action.result.data.user_name);
									
					
					GO.notes.CategoryDialog.superclass.show.call(this);
				},
				failure:function(form, action)
				{
					Ext.Msg.alert(GO.lang['strError'], action.result.feedback)
				},
				scope: this
				
			});
		}else 
		{
			
			this.formPanel.form.reset();
			
			
			this.setWritePermission(true);
			
				
			
			
			GO.notes.CategoryDialog.superclass.show.call(this);
		}
	},
	
	
	setWritePermission : function(writePermission)
	{
		this.buttons[0].setDisabled(!writePermission);
		this.buttons[1].setDisabled(!writePermission);
		
		
		
	},
	
	
	

	setCategoryId : function(category_id)
	{
		this.formPanel.form.baseParams['category_id']=category_id;
		this.category_id=category_id;
		
	},
	
	submitForm : function(hide){
		this.formPanel.form.submit(
		{
			url:GO.settings.modules.notes.url+'action.php',
			params: {'task' : 'save_category'},
			waitMsg:GO.lang['waitMsgSave'],
			success:function(form, action){
				
				this.fireEvent('save', this);
				
				if(hide)
				{
					this.hide();	
				}else
				{
				
					if(action.result.category_id)
					{
						this.setCategoryId(action.result.category_id);
						
						
						
						this.readPermissionsTab.setAcl(action.result.acl_read);
						this.writePermissionsTab.setAcl(action.result.acl_write);
											
					}
				}
				
									
			},		
			failure: function(form, action) {
				if(action.failureType == 'client')
				{					
					Ext.MessageBox.alert(GO.lang['strError'], GO.lang['strErrorsInForm']);			
				} else {
					Ext.MessageBox.alert(GO.lang['strError'], action.result.feedback);
				}
			},
			scope: this
		});
		
	},
	
	
	buildForm : function () {

		this.propertiesPanel = new Ext.Panel({
			url: GO.settings.modules.notes.url+'action.php',
			border: false,
			baseParams: {task: 'category'},			
			title:GO.lang['strProperties'],			
			cls:'go-form-panel',waitMsgTarget:true,			
			layout:'form',
			autoScroll:true,
			items:[this.selectUser = new GO.form.SelectUser({
				fieldLabel: GO.lang['strUser'],
				disabled: !GO.settings.modules['notes']['write_permission'],
				value: GO.settings.user_id,
				anchor: '100%'
			}),{
				xtype: 'textfield',
			  name: 'name',
				anchor: '100%',
			  allowBlank:false,
			  fieldLabel: GO.lang.strName
			}]
				
		});

		var items  = [this.propertiesPanel];
		
    
    
    
		
		
		
    this.readPermissionsTab = new GO.grid.PermissionsPanel({
			title: GO.lang['strReadPermissions']
		});
	
		this.writePermissionsTab = new GO.grid.PermissionsPanel({
			title: GO.lang['strWritePermissions']
		});
    
    items.push(this.readPermissionsTab);
    items.push(this.writePermissionsTab);
		
 
    this.tabPanel = new Ext.TabPanel({
      activeTab: 0,      
      deferredRender: false,
    	border: false,
      items: items,
      anchor: '100% 100%'
    }) ;    
    
    
    this.formPanel = new Ext.form.FormPanel({
    	waitMsgTarget:true,
			url: GO.settings.modules.notes.url+'action.php',
			border: false,
			baseParams: {task: 'category'},				
			items:this.tabPanel				
		});
    
    
	}
});