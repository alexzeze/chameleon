/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: SelectCompany.js 1088 2008-10-07 13:02:06Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */


GO.addressbook.SelectCompany = function(config){
	
	Ext.apply(this, config);
		
	this.displayField='name';
	
	this.store = new GO.data.JsonStore({
	    url: GO.settings.modules.addressbook.url+ 'json.php',
	    baseParams: {
	    	task: 'companies',
				'addressbook_id' : this.addressbook_id
				},
	    root: 'results',
	    id: 'id',
	    totalProperty:'total',
	    fields: ['id', 'name', 'post_address', 'post_address_no', 'post_zip', 'post_city', 'post_state', 'post_country', 'vat_no', 'email'],
	    remoteSort: true
	});
	
	this.store.setDefaultSort('name', 'asc');

	GO.addressbook.SelectCompany.superclass.constructor.call(this,{
		valueField: 'id',
		triggerAction: 'all',
		selectOnFocus:true,
		pageSize: parseInt(GO.settings['max_rows_list'])
	});
	
}
Ext.extend(GO.addressbook.SelectCompany, GO.form.ComboBoxReset);
