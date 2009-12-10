/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: PersonalPanel.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.users.PersonalPanel = function(config)
{
	if(!config)
	{
		config={};
	}
	
	config.autoScroll=true;
	config.border=false;
	config.hideLabel=true;
	config.title = GO.users.lang.profile;
	config.layout='column';
	config.cls='go-form-panel';
	config.labelWidth=120;
	config.height=600;
	
	var rightColItems = [
					{fieldLabel: GO.lang['strAddress'], name: 'address'},
					{fieldLabel: GO.lang['strAddressNo'], name: 'address_no'},
					{fieldLabel: GO.lang['strZip'], name: 'zip'},
					{fieldLabel: GO.lang['strCity'], name: 'city'},
					{fieldLabel: GO.lang['strState'], name: 'state'},
					new GO.form.SelectCountry({
						fieldLabel: GO.lang['strCountry'],
						id: 'countryCombo',
						hiddenName: 'country',
						value: GO.settings.country
					}),
					new GO.form.HtmlComponent({html: '<br />'})];
	
	rightColItems.push({fieldLabel: GO.lang['strEmail'], name: 'email', allowBlank: false});
	
	rightColItems.push({fieldLabel: GO.lang['strPhone'], name: 'home_phone'});
	rightColItems.push({fieldLabel: GO.lang['strFax'], name: 'fax'});
	rightColItems.push({fieldLabel: GO.lang['strCellular'], name: 'cellular'});			
	
	config.items= [
			{
				columnWidth: .5,
				layout: 'form',
				border: false,
				cls:'go-form-panel',waitMsgTarget:true,
				defaults: {anchor: '100%'},
				defaultType: 'textfield',
				items: [
					{fieldLabel: GO.lang['strFirstName'], name: 'first_name', allowBlank: false},
					{fieldLabel: GO.lang['strMiddleName'], name: 'middle_name'},
					{fieldLabel: GO.lang['strLastName'], name: 'last_name', allowBlank: false},
					new GO.form.HtmlComponent({html: '<br />'}),				
					{fieldLabel: GO.lang['strTitle'], name: 'title'},
					{fieldLabel: GO.lang['strInitials'], name: 'initials'},
					new Ext.form.ComboBox({
						fieldLabel: GO.lang['strSex'],
						hiddenName:'sex',
						store: new Ext.data.SimpleStore({
							fields: ['value', 'text'],
							data: [
							['M', GO.lang['strMale']],
							['F', GO.lang['strFemale']]
							]
						}),
						value:'M',
						valueField:'value',
						displayField:'text',
						mode: 'local',
						triggerAction: 'all',
						editable: false,
						selectOnFocus:true,
						forceSelection: true
					}),
					new Ext.form.DateField({
						fieldLabel: GO.lang['strBirthday'],
						name: 'birthday',
						format: GO.settings['date_format']
					})
				]
			},{
				columnWidth: .5,
				layout: 'form',
				border: false,
				cls:'go-form-panel',waitMsgTarget:true,
				defaults: {anchor:'100%', allowBlank: true},
				defaultType: 'textfield',
				items: rightColItems
			}];
	
	

	GO.users.PersonalPanel.superclass.constructor.call(this, config);		
}


Ext.extend(GO.users.PersonalPanel, Ext.Panel,{
	

});			