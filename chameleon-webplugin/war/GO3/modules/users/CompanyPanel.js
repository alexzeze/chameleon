/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: CompanyPanel.js 1088 2008-10-07 13:02:06Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
GO.users.CompanyPanel = function(config)
{
	if(!config)
	{
		config={};
	}
	
	config.autoScroll=true;
	config.border=false;
	config.hideLabel=true;
	config.title = GO.users.lang.companyProfile;
	config.layout='column';
	config.cls='go-form-panel';
	config.labelWidth=120;
	

	config.items=[{
			columnWidth: .5,
			layout: 'form',
			border: false,
			cls:'go-form-panel',waitMsgTarget:true,
			defaults: {anchor:'100%'},
			defaultType: 'textfield',
			items: [
			{fieldLabel: GO.lang['strCompany'], name: 'company'},
			{fieldLabel: GO.lang['strDepartment'], name: 'department'},
			{fieldLabel: GO.lang['strFunction'], name: 'function'},
			{fieldLabel: GO.lang['strWorkAddress'], name: 'work_address'},
			{fieldLabel: GO.lang['strWorkAddressNo'], name: 'work_address_no'},
			{fieldLabel: GO.lang['strWorkZip'], name: 'work_zip'}
			]
		},{
			columnWidth: .5,
			layout: 'form',
			border: false,
			cls:'go-form-panel',waitMsgTarget:true,
			defaults: {anchor:'100%'},
			defaultType: 'textfield',
			items: [
			{fieldLabel: GO.lang['strWorkCity'], name: 'work_city'},
			{fieldLabel: GO.lang['strWorkState'], name: 'work_state'},
			new GO.form.SelectCountry({
				fieldLabel: GO.lang['strWorkCountry'],
				id: 'work_countryCombo',
				hiddenName: 'work_country',
				value: GO.settings.country
			}),
			{fieldLabel: GO.lang['strWorkPhone'], name: 'work_phone'},
			{fieldLabel: GO.lang['strWorkFax'], name: 'work_fax'},
			{fieldLabel: GO.users.lang['cmdFormLabelHomepage'], name: 'homepage'}
			]
		}]
	GO.users.CompanyPanel.superclass.constructor.call(this, config);		
}


Ext.extend(GO.users.CompanyPanel, Ext.Panel,{
	

});			