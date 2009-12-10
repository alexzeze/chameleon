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
 
GO.postfixadmin.MailboxDialog = function(config){
	
	
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
	config.title= GO.postfixadmin.lang.mailbox;					
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
	
	GO.postfixadmin.MailboxDialog.superclass.constructor.call(this, config);
	this.addEvents({'save' : true});	
}
Ext.extend(GO.postfixadmin.MailboxDialog, Ext.Window,{
	
	show : function (mailbox_id, config) {
		if(!this.rendered)
		{
			this.render(Ext.getBody());
		}
		
		this.tabPanel.setActiveTab(0);
		
		
		
		if(!mailbox_id)
		{
			mailbox_id=0;			
		}
			
		this.setMailboxId(mailbox_id);
		
		if(this.mailbox_id>0)
		{
			this.formPanel.load({
				url : GO.settings.modules.postfixadmin.url+'json.php',
				
				success:function(form, action)
				{					
					GO.postfixadmin.MailboxDialog.superclass.show.call(this);
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
			
			GO.postfixadmin.MailboxDialog.superclass.show.call(this);
		}
		
	},
	
	setMailboxId : function(mailbox_id)
	{
		this.formPanel.form.baseParams['mailbox_id']=mailbox_id;
		this.mailbox_id=mailbox_id;
		
		this.formPanel.form.findField('username').setDisabled(mailbox_id>0);
		this.formPanel.form.findField('password1').allowBlank=mailbox_id>0;
		this.formPanel.form.findField('password2').allowBlank=mailbox_id>0;
		
	},
	
	submitForm : function(hide){
		this.formPanel.form.submit(
		{
			url:GO.settings.modules.postfixadmin.url+'action.php',
			params: {'task' : 'save_mailbox'},
			waitMsg:GO.lang['waitMsgSave'],
			success:function(form, action){
				
				this.fireEvent('save', this);
				
				if(hide)
				{
					this.hide();	
				}else
				{
				
					if(action.result.mailbox_id)
					{
						this.setMailboxId(action.result.mailbox_id);
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
			title:GO.lang['strProperties'],			
			cls:'go-form-panel',waitMsgTarget:true,			
			layout:'form',
			autoScroll:true,
			labelWidth:150,
			items:[{
				xtype: 'textfield',
			  name: 'username',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.username
			},{
				xtype: 'textfield',
				inputType: 'password',
			  name: 'password1',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.password
			},{
				xtype: 'textfield',
				inputType: 'password',
			  name: 'password2',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.confirmPassword
			},{
				xtype: 'textfield',
			  name: 'name',
				anchor: '-20',
			  fieldLabel: GO.lang.strName
			},new GO.form.NumberField({
				decimals:"0",				
			  name: 'quota',
				anchor: '-20',
			  allowBlank:false,
			  fieldLabel: GO.postfixadmin.lang.quota,
			  value: 0
			}),{
				xtype: 'checkbox',
			  name: 'active',
				anchor: '-20',
			  allowBlank:false,
			  boxLabel: GO.postfixadmin.lang.active,
			  hideLabel: true,
			  checked:true
			}]
				
		});
		var items  = [this.propertiesPanel];
		
    
    
    this.vacationPanel = new Ext.Panel({
			title:GO.postfixadmin.lang.vacation,			
			cls:'go-form-panel',waitMsgTarget:true,			
			layout:'form',
			autoScroll:true,
			items:[
			{
				xtype: 'checkbox',
			  name: 'vacation_active',
				anchor: '-20',
			  boxLabel: GO.postfixadmin.lang.vacationActive,
			  hideLabel: true
			  
			},{
				xtype: 'textfield',
			  name: 'vacation_subject',
				anchor: '-20',
			  fieldLabel: GO.postfixadmin.lang.subject
			},{
				xtype: 'textarea',
			  name: 'vacation_body',
				anchor: '-20',
			  fieldLabel: GO.postfixadmin.lang.body
			}]
				
		});
    
    
    items.push(this.vacationPanel);
    
    
		
		
		
 
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
			baseParams: {task: 'mailbox'},				
			items:this.tabPanel				
		});
    
    
	}
});