GO.addressbook.CompanyReadPanel = Ext.extend(GO.DisplayPanel,{
	
	link_type : 3,
	
	loadParams : {task: 'load_company_with_items'},
	
	idParam : 'company_id',
	
	loadUrl : GO.settings.modules.addressbook.url+'json.php',
	
	editHandler : function(){
		GO.addressbook.companyDialog.show(this.data.id);
		this.addSaveHandler(GO.addressbook.companyDialog);
	},	
	
	initComponent : function(){
 
			this.template = '<div>'+
				'<table class="display-panel" cellpadding="0" cellspacing="0" border="0">'+
					'<tr>'+
						'<tpl if="this.isCompanySecondColumn(values)">'+
							'<td colspan="2" valign="top" class="display-panel-heading">'+
						'</tpl>'+

						'<tpl if="this.isCompanySecondColumn(values) == false">'+
							'<td valign="top" class="display-panel-heading">'+
						'</tpl>'+
						
							GO.addressbook.lang['cmdCompanyDetailsFor'] + ' <b>{name}</b>'+
						'</td>'+
					'</tr>'+
					
					'<tr>'+	
						// COMPANY DETAILS+ 1e KOLOM
						'<tpl if="this.isCompanySecondColumn(values)">'+
							'<tpl if="this.isBankVat(values)">'+
								'<td valign="top" class="contactCompanyDetailsPanelKolom">'+
							'</tpl>'+
							
							'<tpl if="this.isBankVat(values) == false">'+
								'<td colspan="2" valign="top" class="contactCompanyDetailsPanelKolom100">'+
							'</tpl>'+							
						'</tpl>'+
						
						'<tpl if="this.isCompanySecondColumn(values) == false">'+
							'<td valign="top" class="contactCompanyDetailsPanelKolom100">'+
						'</tpl>'+
																		
							'<table cellpadding="0" cellspacing="0" border="0">'+						
								
								//PHONE							
								'<tpl if="this.notEmpty(phone)">'+
									'<tr>'+
										'<td class="contactCompanyLabelWidth">' + GO.lang['strPhone'] + ':</td><td><a href="callto:{phone}+type=phone">{phone}</a></td>'+
									'</tr>'+						
								'</tpl>'+

								//FAX							
								'<tpl if="this.notEmpty(fax)">'+
									'<tr>'+
										'<td class="contactCompanyLabelWidth">' + GO.lang['strFax'] + ':</td><td>{fax}</td>'+
									'</tr>'+						
								'</tpl>'+								
								
								//EMAIL							
								'<tpl if="this.notEmpty(email)">'+
									'<tr>'+
										'<td class="contactCompanyLabelWidth">' + GO.lang['strEmail'] + ':</td><td>{[this.mailTo(values.email, values.full_name)]}</td>'+
									'</tr>'+						
								'</tpl>'+		
								
								// LEGE REGEL
								'<tr><td colspan="2">&nbsp;</td></tr>'+																
											
								//HOMEPAGE							
								'<tpl if="this.notEmpty(homepage)">'+
									'<tr>'+
										'<td class="contactCompanyLabelWidth">' + GO.lang['strHomepage'] + ':</td><td>&nbsp;<a href="{homepage}" target="_blank">{homepage}</a></td>'+
									'</tr>'+						
								'</tpl>'+																			
							'</table>'+
						'</td>'+
						
						'<tpl if="this.isBankVat(values)">'+
							// COMPANY DETAILS+ 2e KOLOM
							'<td valign="top" class="contactCompanyDetailsPanelKolom">'+
								'<table cellpadding="0" cellspacing="0" border="0">'+												
									
									//BANK_NO
									'<tpl if="this.notEmpty(bank_no)">'+
										'<tr>'+
											'<td>' + GO.addressbook.lang['cmdFormLabelBankNo'] + ':</td><td>&nbsp;{bank_no}</td>'+
										'</tr>'+						
									'</tpl>'+
		
									//VAT_NO							
									'<tpl if="this.notEmpty(vat_no)">'+
										'<tr>'+
											'<td>' + GO.addressbook.lang['cmdFormLabelVatNo'] + ':</td><td> {vat_no}</td>'+
										'</tr>'+						
									'</tpl>'+
								'</table>'+
							'</td>'+
						'</tpl>'+					
					'</tr>'+
					
					
					// CONTACT DETAILS+ 1e KOLOM
					'<tpl if="this.isAddress(values)">'+					
						'<tr>'+
							'<tpl if="this.isCompanySecondColumn(values)">'+
								'<td colspan="2" valign="top" class="display-panel-heading">'+
							'</tpl>'+
	
							'<tpl if="this.isCompanySecondColumn(values) == false">'+
								'<td valign="top" class="display-panel-heading">'+
							'</tpl>'+
							
							GO.addressbook.lang['cmdFieldsetContact']+
							'</td>'+
						'</tr>'+

						'<tr>'+
							'<tpl if="this.isAddressVisit(values)">'+
							
								'<tpl if="this.isCompanySecondColumn(values)">'+
									'<tpl if="this.isAddressPost(values)">'+
										'<td valign="top" class="contactCompanyDetailsPanelKolom">'+
									'</tpl>'+
									
									'<tpl if="this.isAddressPost(values) == false">'+
										'<td colspan="2" valign="top" class="contactCompanyDetailsPanelKolom100">'+
									'</tpl>'+							
								'</tpl>'+
								
								'<tpl if="this.isCompanySecondColumn(values) == false">'+
									'<td valign="top" class="contactCompanyDetailsPanelKolom100">'+
								'</tpl>'+
							
									'<table cellpadding="0" cellspacing="0" border="0">'+
										
										'<tr>'+
											'<td colspan="2" class="readPanelSubHeading">' + GO.addressbook.lang['cmdFieldsetVisitAddress'] + '</td>'+
										'</tr>'+
										
										// LEGE REGEL													
										'<tr>'+
											'<td>'+
										//ADDRESS															
										'<tpl if="this.notEmpty(address) || this.notEmpty(address_no)">'+
											'{[this.GoogleMapsCityStreet(values)]}'+				
										'</tpl>'+
										
										//ZIP							
										'<tpl if="this.notEmpty(zip) || this.notEmpty(city)">'+
											'<br />{zip} {city}'+						
										'</tpl>'+
										
										//STATE							
										'<tpl if="this.notEmpty(state)">'+
											'<br />{state}'+						
										'</tpl>'+
										
										//COUNTRY							
										'<tpl if="this.notEmpty(country)">'+
											'<br />{country}'+						
										'</tpl>'+

									'</table>'+
								'</td>'+		
							'</tpl>'+
							
							// CONTACT DETAILS+ 2e KOLOM
							'<tpl if="this.isAddressPost(values)">'+
								'<tpl if="this.isAddressVisit(values)">'+
									'<td valign="top" class="contactCompanyDetailsPanelKolom">'+
								'</tpl>'+				
								
								'<tpl if="this.isAddressVisit(values) == false">'+
									'<td colspan="2" valign="top" class="contactCompanyDetailsPanelKolom100">'+
								'</tpl>'+
									
									'<table cellpadding="0" cellspacing="0" border="0">'+
										
										'<tr>'+
											'<td colspan="2" class="readPanelSubHeading">' + GO.addressbook.lang['cmdFieldsetPostAddress'] + '</td>'+
										'</tr>'+											
										
										// LEGE REGEL
										'<tr>'+
											'<td>'+							
										
										//ADDRESS															
										'<tpl if="this.notEmpty(post_address) || this.notEmpty(post_address_no)">'+
											'{post_address} {post_address_no}'+
										'</tpl>'+
										
										//ZIP							
										'<tpl if="this.notEmpty(post_zip) || this.notEmpty(post_city)">'+
											'<br />{post_zip} {post_city}'+
										'</tpl>'+
										
										//STATE							
										'<tpl if="this.notEmpty(post_state)">'+
											'<br />{post_state}'+
										'</tpl>'+
										
										//COUNTRY							
										'<tpl if="this.notEmpty(post_country)">'+
											'<br />{post_country}'+				
										'</tpl>'+

									'</table>'+
								'</td>'+														
							'</tpl>'+							
						'</tr>'+
					'</tpl>'+		
					
					'</table>'+		

					'<tpl if="this.notEmpty(comment)">'+						
						'<table cellpadding="0" cellspacing="0" border="0" class="display-panel">'+
						'<tr>'+
							'<td class="display-panel-heading">' + GO.addressbook.lang['cmdFormLabelComment'] + '</td>'+
						'</tr>'+
						'<tr>'+
							'<td>{comment}</td>'+
						'</tr>'+
						'</table>'+
					'</tpl>'+		
					
					
					'<tpl if="employees.length">'+
						'<table class="display-panel" cellpadding="0" cellspacing="0" border="0">'+
						//LINK DETAILS
						'<tr>'+
							'<td colspan="4" class="display-panel-heading">'+GO.addressbook.lang.cmdPanelEmployees+'</td>'+
						'</tr>'+
						
						'<tr>'+
							'<td width="16" class="display-panel-links-header">&nbsp;</td>'+
							'<td class="table_header_links">' + GO.lang['strName'] + '</td>'+
							'<td class="table_header_links">' + GO.lang['strEmail'] + '</td>'+							
						'</tr>'+	
											
						'<tpl for="employees">'+
							'<tr>'+
								'<td><div class="go-icon go-link-icon-2"></div></td>'+
								'<td><a href="#" onclick="GO.linkHandlers[2].call(this, {id});">{name}</a></td>'+
								'<td>{[this.mailTo(values.email, values.name)]}</td>'+
							'</tr>'+							
						'</tpl>'+	
					'</tpl>'+
								
			GO.linksTemplate;
			
		if(GO.customfields)
		{
			this.template +=GO.customfields.displayPanelTemplate;
		}
	    	
	  Ext.apply(this.templateConfig,{
		  addSlashes : function(str)
			{
				str = GO.util.html_entity_decode(str, 'ENT_QUOTES');
				str = GO.util.add_slashes(str);
				return str;
			},
			mailTo : function(email, name) {
			
				if(GO.email && GO.settings.modules.email.read_permission)
				{
					return '<a href="#" onclick="GO.email.showAddressMenu(event, \''+this.addSlashes(email)+'\',\''+this.addSlashes(name)+'\');">'+email+'</a>';
				}else
				{
					return '<a href="mailto:'+email+'">'+email+'</a>';
				}
			},
			
			isCompanySecondColumn : function(values)
			{
				if(
					this.isBankVat(values) ||
					this.isAddressPost(values)
				)
				{
					return true;
				} else {
					return false;
				}
			},
			isBankVat : function(values)
			{
				if(
					this.notEmpty(values['bank_no']) ||
					this.notEmpty(values['vat_no']) 				
				)
				{
					return true;
				} else {
					return false;
				}
			},	
			isAddress : function(values)
			{
				if(
					this.notEmpty(values['address']) ||
					this.notEmpty(values['address_no']) ||
					this.notEmpty(values['zip']) ||
					this.notEmpty(values['city']) ||
					this.notEmpty(values['state']) ||
					this.notEmpty(values['country']) ||
					this.notEmpty(values['post_address']) ||
					this.notEmpty(values['post_address_no']) ||
					this.notEmpty(values['post_zip']) ||
					this.notEmpty(values['post_city']) ||
					this.notEmpty(values['post_state']) ||
					this.notEmpty(values['post_country'])
				)
				{
					return true;
				} else {
					return false;
				}
			},	
			isAddressVisit : function(values)
			{
				if(
					this.notEmpty(values['address']) ||
					this.notEmpty(values['address_no']) ||
					this.notEmpty(values['zip']) ||
					this.notEmpty(values['city']) ||
					this.notEmpty(values['state']) ||
					this.notEmpty(values['country'])
				)
				{
					return true;
				} else {
					return false;
				}
			},
			isAddressPost : function(values)
			{
				if(
					this.notEmpty(values['post_address']) ||
					this.notEmpty(values['post_address_no']) ||
					this.notEmpty(values['post_zip']) ||
					this.notEmpty(values['post_city']) ||
					this.notEmpty(values['post_state']) ||
					this.notEmpty(values['post_country'])					
				)
				{
					return true;
				} else {
					return false;
				}				
			},
			GoogleMapsCityStreet : function(values)
			{
				var google_url = 'http://maps.google.com/maps?q=';
				
				if(this.notEmpty(values['address']) && this.notEmpty(values['city']))
				{
					if(this.notEmpty(values['address_no']))
					{
						return '<a href="' + google_url + values['address'] + '+' + values['address_no'] + '+' + values['city'] + '" target="_blank" >' + values['address'] + ' ' + values['address_no'] + '</a>';	
					} else {
						return '<a href="' + google_url + values['address'] + '+' + values['city'] + '" target="_blank" >' + values['address'] + '</a>';						
					}
				} else {
					return values['address'] + ' ' + values['address_no'];
				}
			}
		});
		
		Ext.apply(this.templateConfig, GO.linksTemplateConfig);		
		
		if(GO.files)
		{
			Ext.apply(this.templateConfig, GO.files.filesTemplateConfig);
			this.template += GO.files.filesTemplate;
		}
		
		if(GO.comments)
		{
			this.template += GO.comments.displayPanelTemplate;
		}
				
		this.template+='</div>';		
			
		GO.addressbook.CompanyReadPanel.superclass.initComponent.call(this);
		
		if(GO.mailings)
		{			
			this.newOODoc = new GO.mailings.NewOODocumentMenuItem();
			this.newOODoc.on('create', function(){this.reload();}, this);
			
			this.newMenuButton.menu.add(this.newOODoc);	
						
			GO.mailings.ooTemplatesStore.on('load', function(){
				this.newOODoc.setDisabled(GO.mailings.ooTemplatesStore.getCount() == 0);
			}, this);
		}
		
		if(GO.tasks)
		{
			this.scheduleCallItem = new GO.tasks.ScheduleCallMenuItem();
			this.newMenuButton.menu.add(this.scheduleCallItem);
		}
	},
	setData : function(data)
	{
		GO.addressbook.CompanyReadPanel.superclass.setData.call(this, data);
		
		if(GO.mailings && !GO.mailings.ooTemplatesStore.loaded)
					GO.mailings.ooTemplatesStore.load();
					
		if(data.write_permission)
		{
			if(this.scheduleCallItem)
			{				
				var name = this.data.name;
				
				if(this.data.phone!='')
				{
					name += ' ('+this.data.phone+')';
				}
				
				this.scheduleCallItem.setLinkConfig({
					name: name,
					links:[{link_id: this.data.id, link_type:3}],
					callback:this.reload,
					scope: this
				});
			}
		}
	}
});