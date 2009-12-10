/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: SelectCountry.js 2680 2009-06-22 11:05:44Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */




  
GO.form.SelectCountry = function(config){

	if(!GO.countriesStore)
	{
		var countries = [];

		for(var c in GO.lang.countries)
		{
			countries.push([c, GO.lang.countries[c]]);
		}

		GO.countriesStore = new Ext.data.SimpleStore({
					fields: ['iso', 'name'],
					data : countries
			});
		GO.countriesStore.sort('name');
	}
		
	Ext.apply(this, config);

	

	GO.form.SelectCountry.superclass.constructor.call(this,{
   store: GO.countriesStore,
		valueField: 'iso',
		displayField: 'name',
		triggerAction: 'all',
		editable: true,
		mode:'local',
		selectOnFocus:true,
		forceSelection: true,
		emptyText: GO.lang.strNoCountrySelected
	});

}
 
Ext.extend(GO.form.SelectCountry, Ext.form.ComboBox);