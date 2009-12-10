GO.addressbook.ContactReadPanel = Ext.extend(GO.DisplayPanel,{

	link_type : 2,

	loadParams : {task: 'load_contact_with_items', type: 'retrieve'},

	idParam : 'url',//'contact_id',

	loadUrl : '../ident.do',//GO.settings.modules.addressbook.url+'json.php',

        displayed : false,

	editHandler : function(){
	     alert('edit'+this.data.id);
		GO.addressbook.contactDialog.show(this.data.id);
		this.addSaveHandler(GO.addressbook.contactDialog);
	},
					     linkHandler :function(){
						  //alert('linkHandler'+this.data.url);
						  var location = window.location.href;
						  //////console.log(location);
						  //////console.log(location.slice(0));
						  var splitter = location.split("?");
						  //alert(splitter[0]);

						  //console.log(this.data);
						  window.open(splitter[0] + '/../../redirect.do?url=' + this.data.url, "dspace");

						  //GO.linkBrowser.show({link_id: this.data.id,link_type: this.link_type,folder_id: "0"});
						  //GO.linkBrowser.on('hide', this.reload, this,{single:true});
					     },

	initComponent : function(){
		this.template =
		'<table class="display-panel" cellpadding="0" cellspacing="0" border="0">'+
		'<tr>'+
		'<td colspan="2" class="display-panel-heading">' + 'Item Details for: ' + ' <b style="background-color: transparent; color: black;">{title:ellipsis(40)}</b></td>'+
		'</tr>'+

		'<tr>'+

		// PERSONAL DETAILS+ 1e KOLOM
		'<td valign="top" style="width: 100%;" colspan="2">'+
		'<table cellpadding="0" cellspacing="0" border="0">'+
		//NAME
		'<tr>'+
		'<td colspan="2">' +

'<div style="float:left;">'+
'<img title="{title}" style="padding-right: 20px; width: 120px; height: 120px;" type="{url}" class="{collection}" src="local/cache/images/categories/{collection}.jpg" alt="{title}"/>'+
'</div><div style="/*float: left;*/ padding-left: 1em;" class="itemdetails">'+
'<p><b class="itemdetails">Title:</b> <tpl if="this.notEmpty(title)">{title}</tpl></p><br>'+
					     '</div><br style="clear: both;"/>'+
'</td></tr>'+
		'</table></td></tr>'+

'<tr>'+
'<td colspan="2" class="display-panel-heading">' + 'Contributor Details </td>'+
'</tr>'+

		//INITIALS
		'<tpl if="this.notEmpty(description)">'+
		'<tr>'+
		'<td>' + 'Author ' + ':</td><td> {author:ellipsis(50)}</td>'+
		'</tr>'+
		'</tpl>'+
		//'</table>'+
		//'</td>'+
		//'</tr>'+
		'<tr>'+
		'<td colspan="2" class="display-panel-heading">' + 'Dates </td>'+
		'</tr>'+

		'<tpl if="this.notEmpty(issue_date)">'+
		'<tr>'+
		'<td class="contactCompanyLabelWidth">' + 'Issue Date ' + ':</td><td>{issue_date:date("M d Y")}</td>'+
		'</tr>'+
		'</tpl>'+

'<tr>'+
'<td colspan="2" class="display-panel-heading">' + 'Description </td>'+
'</tr>'+

		'<tr>'+
		'<td colspan="2">{description}</td>'+
		'</tr>'+


		'<tpl if="this.notEmpty(bitstreams)">'+
'<tr>'+
'<td colspan="2" class="display-panel-heading">' + 'File(s) </td>'+
'</tr>'+
'<tr>'+
'<td colspan="2">{bitstreams}</td>'+
'</tr>'+


'</tpl>'+

		'</table>'/*+
				GO.linksTemplate*/;

				if(GO.customfields)
				{
					//this.template +=GO.customfields.displayPanelTemplate;
				}


		Ext.apply(this.templateConfig, {
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

			isContactFieldset: function(values){
				if(this.notEmpty(values['email']) ||
					this.notEmpty(values['email2']) ||
					this.notEmpty(values['email3']) ||
					this.notEmpty(values['home_phone']) ||
					this.notEmpty(values['fax']) ||
					this.notEmpty(values['cellular']) ||
					this.notEmpty(values['work_phone']) ||
					this.notEmpty(values['work_fax'])	)
				{
					return true;
				} else {
					return false;
				}
			},
		isPhoneFieldset : function(values)
			{
				if(this.notEmpty(values['home_phone']) ||
					this.notEmpty(values['fax']) ||
					this.notEmpty(values['cellular']) )
				{
					return true;
				} else {
					return false;
				}
			},
			isWorkPhoneFieldset : function(values)
			{
				if(this.notEmpty(values['work_phone']) ||
					this.notEmpty(values['work_fax']) )
				{
					return true;
				} else {
					return false;
				}
			},
			isWorkFieldset : function(values)
			{
				if(this.notEmpty(values['company_name']) ||
					this.notEmpty(values['function']) ||
					this.notEmpty(values['department']))
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
			//this.template += GO.files.filesTemplate;
		}

		if(GO.comments)
		{
			//this.template += GO.comments.displayPanelTemplate;
		}


		GO.addressbook.ContactReadPanel.superclass.initComponent.call(this);


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
	getLinkName : function(){
		return this.data.full_name;
	},
	setData : function(data)
	{
		GO.addressbook.ContactReadPanel.superclass.setData.call(this, data);

		if(GO.mailings && !GO.mailings.ooTemplatesStore.loaded)
					GO.mailings.ooTemplatesStore.load();

		if(data.write_permission)
		{
			if(this.scheduleCallItem)
			{
				var name = this.data.full_name;

				if(this.data.work_phone!='')
				{
					name += ' ('+this.data.work_phone+')';
				}else if(this.data.cellular!='')
				{
					name += ' ('+this.data.cellular+')';
				}else if(this.data.home_phone!='')
				{
					name += ' ('+this.data.home_phone+')';
				}

				this.scheduleCallItem.setLinkConfig({
					name: name,
					links:[{link_id: this.data.id, link_type:2}],
					callback:this.reload,
					scope: this
				});
			}
		}
	},
					     setData2 : function(data)
					     {
						  alert(data);
						  GO.addressbook.ContactReadPanel.superclass.setData.call(this, data);

						  if(GO.mailings && !GO.mailings.ooTemplatesStore.loaded)
						       GO.mailings.ooTemplatesStore.load();

						  if(data.write_permission)
						  {
						       if(this.scheduleCallItem)
						       {
							    var name = this.data.full_name;

							    if(this.data.work_phone!='')
							    {
								 name += ' ('+this.data.work_phone+')';
							    }else if(this.data.cellular!='')
							    {
								 name += ' ('+this.data.cellular+')';
							    }else if(this.data.home_phone!='')
							    {
								 name += ' ('+this.data.home_phone+')';
							    }

							    this.scheduleCallItem.setLinkConfig({
								 name: name,
												links:[{link_id: this.data.id, link_type:2}],
												callback:this.reload,
												scope: this
							    });
						       }
						  }
					     }
});