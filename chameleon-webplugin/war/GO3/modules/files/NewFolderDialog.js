/**
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: Dialog.tpl 2276 2008-07-04 12:22:20Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
GO.files.NewFolderDialog = function(config){	
	if(!config)
	{
		config={};
	}
	
	this.newFolderNameField = new Ext.form.TextField({	              	
	      fieldLabel: GO.lang['strName'],
        name: 'name',
        value: 'New folder',
        allowBlank:false,
        anchor:'100%',
				validator:function(v){
					return !v.match(/[&\/:\*\?"<>|\\]/);
				}   
    });
	this.newFolderFormPanel = new Ext.form.FormPanel({
			url: GO.settings.modules.files.url+'action.php',
			baseParams:{folder_id:0},
			defaultType: 'textfield',
			labelWidth:75,
			autoHeight:true,
			cls:'go-form-panel',
			waitMsgTarget:true,
			items:this.newFolderNameField			
		});
	
	var focusName = function(){
		this.newFolderNameField.focus(true);		
	};
			
	config.collapsible=false;
	config.maximizable=false;
	config.modal=false;
	config.resizable=false;
	config.width=500;
	config.items=this.newFolderFormPanel;
	config.autoHeight=true;
	config.closeAction='hide';
	config.focus=focusName.createDelegate(this);
	config.title= GO.files.lang.addFolder;		
	config.buttons= [{
					text: GO.lang['cmdOk'],
					handler: function(){	
						
						this.newFolderFormPanel.form.submit({
										
							url:GO.settings.modules.files.url+'action.php',
							params: {'task' : 'new_folder'},
							waitMsg:GO.lang['waitMsgSave'],
							success:function(form, action){								
								this.fireEvent('save', action.result);															
								this.hide();
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
						
					},
					scope:this
				},
				{
					text: GO.lang['cmdClose'],
					handler: function(){this.hide();},
					scope: this
				}];
				
	GO.files.NewFolderDialog.superclass.constructor.call(this, config);
	
	this.addEvents({save:true});
}
Ext.extend(GO.files.NewFolderDialog, Ext.Window,{
	show : function (folder_id) {
		if(!this.rendered)
		{
			this.render(Ext.getBody());
		}
		this.newFolderFormPanel.baseParams.folder_id=folder_id;
		this.newFolderFormPanel.form.reset();
		
		GO.files.NewFolderDialog.superclass.show.call(this);
	}
});
