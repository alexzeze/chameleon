/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: Dialog.tpl 2094 2008-06-13 08:05:15Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.postfixadmin.DomainDialog = function(config){
	
	
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
	config.title= GO.postfixadmin.lang.domain;					
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
	
	GO.postfixadmin.DomainDialog.superclass.constructor.call(this, config);
	this.addEvents({'save' : true});	
}
Ext.extend(GO.postfixadmin.DomainDialog, Ext.Window,{
	
	show : function (domain_id, config) {
		if(!this.rendered)
		{
			this.render(Ext.getBody());
		}
		
		this.tabPanel.setActiveTab(0);
		
		
		
		if(!domain_id)
		{
			domain_id=0;			
		}
			
		this.setDomainId(domain_id);
		
		if(this.domain_id>0)
		{
			this.formPanel.load({
				url : GO.settings.modules.postfixadmin.url+'json.php',
				
				success:function(form, action)
				{
					if(GO.settings.modules.postfixadmin.write_permission)
					{
						this.readPermissionsTab.setAcl(action.result.data.acl_read);
						this.writePermissionsTab.setAcl(action.result.data.acl_write);
					}					
					
					this.setBackupMX(action.result.data.backupmx=='1');
					
					
					this.selectUser.setRemoteText(action.result.data.user_name);
					
					GO.postfixadmin.DomainDialog.superclass.show.call(this);
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

			this.readPermissionsTab.setAcl(0);
			this.writePermissionsTab.setAcl(0);
			
			GO.postfixadmin.DomainDialog.superclass.show.call(this);
		}
	},
		
	setDomainId : function(domain_id)
	{
		this.formPanel.form.baseParams['domain_id']=domain_id;
		this.domain_id=domain_id;
		this.mailboxesGrid.setDomainId(domain_id);
		this.aliasesGrid.setDomainId(domain_id);
	},
	
	submitForm : function(hide){
		this.formPanel.form.submit(
		{
			url:GO.settings.modules.postfixadmin.url+'action.php',
			params: {'task' : 'save_domain'},
			waitMsg:GO.lang['waitMsgSave'],
			success:function(form, action){
				
				this.fireEvent('save', this);
				
				if(hide)
				{
					this.hide();	
				}else
				{				
					if(action.result.domain_id)
					{
						this.setDomainId(action.result.domain_id);						
						
						this.mailboxesGrid.setDisabled(this.formPanel.form.findField("backupmx").getValue());
						this.aliasesGrid.setDisabled(this.formPanel.form.findField("backupmx").getValue());
						
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
	
	setBackupMX : function(backupmx)
	{
		this.mailboxesGrid.setDisabled(backupmx || !this.domain_id);
		this.aliasesGrid.setDisabled(backupmx || !this.domain_id);
		
		var f = this.formPanel.form;
		
		f.findField('aliases').setDisabled(backupmx);
		f.findField('mailboxes').setDisabled(backupmx);
		f.findField('maxquota').setDisabled(backupmx);
		f.findField('quota').setDisabled(backupmx);
	},
	
	
	buildForm : function () {
		
		this.propertiesPanel = new Ext.Panel({
			title:GO.lang['strProperties'],			
			cls:'go-form-panel',waitMsgTarget:true,			
			layout:'form',
			autoScroll:true,
			items:[this.selectUser = new GO.form.SelectUser({
				fieldLabel: GO.lang['strUser'],
				disabled: !GO.settings.modules['postfixadmin']['write_permission'],
				value: GO.settings.user_id,
				anchor: '-20'
			}),{
				xtype: 'textfield',
			  name: 'domain',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.domain
			},{
				xtype: 'textfield',
			  name: 'description',
				anchor: '-20',			  
			  fieldLabel: GO.lang.strDescription
			},new GO.form.NumberField({
				decimals:"0",
				disabled:!GO.settings.modules.postfixadmin.write_permission,
			  name: 'aliases',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.aliases,
			  value:'0'
			}),new GO.form.NumberField({
				decimals:"0",
				disabled:!GO.settings.modules.postfixadmin.write_permission,
			  name: 'mailboxes',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.mailboxes,
			  value:'0'
			}),this.maxQuotaField = new GO.form.NumberField({
				decimals:"0",
				disabled:!GO.settings.modules.postfixadmin.write_permission,
			  name: 'maxquota',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.maxquota,
			  value:'0'
			}),this.quotaField = new GO.form.NumberField({
				decimals:"0",
			  name: 'quota',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.defaultQuota,
			  value:'0'
			}),{
				xtype: 'checkbox',
			  name: 'active',
				anchor: '-20',
			  allowBlank:false,
			  boxLabel: GO.postfixadmin.lang.active,
			  hideLabel: true,
			  checked: true
			},{
				xtype: 'checkbox',
			  name: 'backupmx',
				anchor: '-20',
			  allowBlank:false,
			  boxLabel: GO.postfixadmin.lang.backupmx,
			  hideLabel: true,
			  listeners:{
			  	check:function(cb, check){
			  	 	this.setBackupMX(check);

			  	},
			  	scope:this
			  }
			}]
				
		});
		var items  = [this.propertiesPanel];
		
    
    this.mailboxesGrid = new GO.postfixadmin.MailboxesGrid();   
		items.push(this.mailboxesGrid);
    
		this.aliasesGrid = new GO.postfixadmin.AliasesGrid();   
		items.push(this.aliasesGrid);
		
		
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
			url: GO.settings.modules.postfixadmin.url+'action.php',
			border: false,
			baseParams: {task: 'domain'},				
			items:this.tabPanel				
		});
    
    
	}
});