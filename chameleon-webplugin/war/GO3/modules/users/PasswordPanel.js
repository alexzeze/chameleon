/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: PasswordPanel.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.users.PasswordPanel = function(config)
{
	if(!config)
	{
		config={};
	}
	
	config.autoScroll=true;
	config.border=false;
	config.hideLabel=true;
	config.title = GO.users.lang.changePassword;
	config.layout='form';
	config.defaults={anchor:'100%'};
	config.defaultType = 'textfield';
	config.cls='go-form-panel';
	config.labelWidth=140;
	
	this.currentPasswordField = new Ext.form.TextField({
		inputType: 'password', 
		fieldLabel: GO.users.lang.currentPassword, 
		name: 'current_password'
		});
	
	this.passwordField1 = new Ext.form.TextField({
		inputType: 'password', 
		fieldLabel: GO.users.lang.newPassword, 
		name: 'password1'
		});
	this.passwordField2 = new Ext.form.TextField({
		inputType: 'password', 
		fieldLabel: GO.users.lang.confirmPassword, 
		name: 'password2'
		});

		


	config.items=[
		this.currentPasswordField,
		this.passwordField1,
		this.passwordField2
	];

	GO.users.PasswordPanel.superclass.constructor.call(this, config);		
};


Ext.extend(GO.users.PasswordPanel, Ext.Panel);			