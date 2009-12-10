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
GO.files.UploadDialog = function(config) {
	if (!config) {
		config = {};
	}

	this.uploadFile = new GO.form.UploadFile({
				inputName : 'attachments',
				addText : GO.lang.smallUpload
			});

	this.upForm = new Ext.form.FormPanel({
				fileUpload : true,
				waitMsgTarget : true,
				baseParams: {
				  task: 'upload'
				},
				items : [this.uploadFile, new Ext.Button({
							text : GO.lang.largeUpload,
							handler : function() {
								if (!deployJava.isWebStartInstalled('1.5.0')) {
									Ext.MessageBox.alert(GO.lang.strError,
											GO.lang.noJava);
								} else {
									/*
									 * var p = GO.util.popup({ url:
									 * GO.settings.modules.files.url+'jupload/index.php?id='+encodeURIComponent(this.folder_id),
									 * width : 640, height: 500, target:
									 * 'jupload' });
									 */

									window
											.open(GO.settings.modules.files.url
													+ 'jupload/index.php?id='
													+ this.folder_id);

									this.hide();									
								}
							},
							scope : this
						})],
				cls : 'go-form-panel'
			});

	config.collapsible = false;
	config.maximizable = false;
	config.modal = false;
	config.resizable = false;
	config.width = 300;
	config.items = this.upForm;
	config.autoHeight = true;
	config.closeAction = 'hide';
	config.title = GO.lang.uploadFiles;
	config.buttons = [{
				text : GO.lang['cmdOk'],
				handler : this.uploadHandler,
				scope : this
			}, {
				text : GO.lang['cmdClose'],
				handler : function() {
					this.hide();
				},
				scope : this
			}];

	GO.files.UploadDialog.superclass.constructor.call(this, config);

	this.addEvents({
				upload : true
			});
}
Ext.extend(GO.files.UploadDialog, Ext.Window, {
	show : function(folder_id) {
		if (!this.rendered) {
			this.render(Ext.getBody());
		}
		this.folder_id=folder_id;
		GO.files.UploadDialog.superclass.show.call(this);
	},
	uploadHandler : function(){
		this.upForm.form.submit({
			url:GO.settings.modules.files.url+'action.php',
			success:function(form, action){
				this.uploadFile.clearQueue();						
				this.hide();
				
				this.fireEvent('upload', action);
				
			},
			failure:function(form, action)
			{
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
			scope: this
		});			
	}
});
