/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: LoginDialog.js 2248 2009-04-06 12:35:46Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.LogoComponent = Ext.extend(Ext.BoxComponent, {
	onRender : function(ct, position){
		this.el = ct.createChild({tag: 'div', cls: "go-app-logo"});
	}
});

 /**
 * @class GO.dialog.LoginDialog
 * @extends Ext.Window
 * The Group-Office login dialog window.
 * 
 * @cfg {Function} callback A function called when the login was successfull
 * @cfg {Object} scope The scope of the callback
 * 
 * @constructor
 * @param {Object} config The config object
 */
 
GO.dialog.LoginDialog = function(config){
	
	if(!config)
	{
		config={};
	}
	
	if(typeof(config.modal)=='undefined')
	{
		config.modal=true;
	}
	Ext.apply(this, config);
	
	var langCombo = new Ext.form.ComboBox({
			fieldLabel: GO.lang.strLanguage,
			name: 'language_text',
			store:  new Ext.data.SimpleStore({
					fields: ['id', 'language'],
					data : GO.Languages
				}),
			anchor:'100%',
			hiddenName: 'language',
			displayField:'language',
			valueField: 'id',			
			mode:'local',
			triggerAction:'all',			
			forceSelection: true,
			editable: false,
			value: GO.settings.language
		});
		
	langCombo.on('select', function(){
		document.location=BaseHref+'index.php?SET_LANGUAGE='+langCombo.getValue();
	}, this);
	
	this.formPanel = new Ext.FormPanel({
        labelWidth: 120, // label settings here cascade unless overridden
        url:'action.php',        
        defaultType: 'textfield',
        autoHeight:true,
        waitMsgTarget:true,
        //cls:'go-form-panel',
        
        bodyStyle:'padding:5px 10px 5px 10px',
        items: [new GO.LogoComponent(),
        		langCombo,
        		{
                fieldLabel: GO.lang.strUsername,
                name: 'username',
                allowBlank:false,
                anchor:'100%'
            },{
                fieldLabel: GO.lang.strPassword,
                name: 'password',
                inputType: 'password',
                allowBlank:false,
                anchor:'100%'
            },{
            	xtype: 'checkbox',
            	hideLabel:true,
            	boxLabel: GO.lang.remindPassword,
            	name:'remind'
            },this.fullscreenField = new Ext.form.Checkbox({            	
            	hideLabel:true,
            	boxLabel: GO.lang.fullscreen,
            	checked:GO.fullscreen,
            	name:'fullscreen'})
            ]
		});

	
	//var logo = Ext.getBody().createChild({tag: 'div', cls: 'go-app-logo'});
	
	GO.dialog.LoginDialog.superclass.constructor.call(this, {
    layout: 'fit',
		
		autoHeight:true,
		width:400,
		resizable: false,
		closeAction:'hide',
		title:GO.lang['strLogin'],
		closable: false,
		focus: function(){
 		    this.formPanel.form.findField('username').focus(true);
		}.createDelegate(this),

		items: [
			
			this.formPanel
		],
		
		buttons: [
			{				
				text: GO.lang.lostPassword,
				handler: function(){
					
					// Prompt for user data and process the result using a callback:
					Ext.Msg.prompt(GO.lang.lostPassword, GO.lang.lostPasswordText, function(btn, text){
					    if (btn == 'ok'){
					        
					        Ext.Ajax.request({
					        	url:'action.php',
					        	params:{
					        		task:'lost_password',
					        		email:text
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
													Ext.MessageBox.alert(GO.lang['strSuccess'], responseParams.feedback);
												}
											}
										}				
									});					        
					    }
					})
					
				},
				scope:this
			},
			{				
				text: GO.lang['cmdOk'],
				handler: this.doLogin,
				scope:this
			}
		],
		keys: [{
            key: Ext.EventObject.ENTER,
            fn: this.doLogin,
            scope:this
        }]
    });
    
    this.addEvents({callbackshandled: true});
    
};

Ext.extend(GO.dialog.LoginDialog, Ext.Window, {
	
	callbacks : new Array(),
	
	hideDialog : true,
	
	addCallback : function(callback, scope)
	{		
		this.callbacks.push({callback: callback, scope: scope});		
	},
	
	doLogin : function(){							
		this.formPanel.form.submit({
			url:BaseHref+'action.php',
			params: {'task' : 'login'},	
			waitMsg:GO.lang.waitMsgLoad,
			success:function(form, action){

				//Another user logs in after a session expire			
				if(GO.settings.user_id>0 && action.result.user_id!=GO.settings.user_id)
				{
					document.location=document.location;
					return true;
				}				
				
				if(action.result.name=='')
				{
					this.completeProfileDialog();
				}else
				{					
					this.handleCallbacks();
				}
				
				if(this.hideDialog)
					this.hide();
				
			},

			failure: function(form, action) {
				if(action.result)
				{
					Ext.MessageBox.alert(GO.lang['strError'], action.result.feedback, function(){
						this.formPanel.form.findField('username').focus(true);
					},this);
				}
			},
			scope: this
		});
	},
	
	handleCallbacks : function(){
		for(var i=0;i<this.callbacks.length;i++)
		{
			if(this.callbacks[i].callback)
			{
				var scope = this.callbacks[i].scope ? this.callbacks[i].scope : this;
				//var callback = this.callbacks[i].callback.createDelegate(this.callbacks[i].scope, scope);
				this.callbacks[i].callback.call(scope);
			}
		}
		
		this.callbacks=[];
		
		this.fireEvent('callbackshandled', this);
	},
	
	completeProfileDialog : function(){
		
		var formPanel = new Ext.form.FormPanel({
	    waitMsgTarget:true,
			url: BaseHref+'action.php',
			border: false,
			autoHeight: true,
			cls:'go-form-panel',
			baseParams: {task: 'complete_profile'},				
			defaults:{xtype:'textfield',anchor:'100%'},				
			items:[{
				fieldLabel: GO.lang['strFirstName'], 
				name: 'first_name', 
				allowBlank: false
			},
			{
				fieldLabel: GO.lang['strMiddleName'], 
				name: 'middle_name'
			},
			{
				fieldLabel: GO.lang['strLastName'], 
				name: 'last_name', 
				allowBlank: false
			}]				
		});
		
		var focusFirstField = function(){
			formPanel.items.items[0].focus();
		};
		
		this.completeProfileDialog = new Ext.Window({
			width: 400,
			autoHeight:true,
			title:GO.lang.completeProfile,
			items:formPanel	,
			closable:false,
			focus:focusFirstField.createDelegate(this),
			buttons:[{
				text: GO.lang['cmdOk'],
				handler: function(){
					formPanel.form.submit(
					{						
						waitMsg:GO.lang['waitMsgSave'],
						success:function(form, action){							
							this.handleCallbacks();
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
				scope: this
			}]		 
		});
		
		this.completeProfileDialog.show();
	}
	
});

GO.mainLayout.onReady(function(){
	GO.loginDialog = new GO.dialog.LoginDialog();
	
});


