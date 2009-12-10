GO.calendar.AvailabilityCheckWindow = function(config) {
	config = config || {};

	var tpl = new Ext.XTemplate(
			'<div id="availability_date"></div>',
			'<table class="availability">',
			'<tr><td></td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("0", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("1", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("2", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("3", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("4", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("5", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("6", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("7", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("8", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("9", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("10", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("11", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("12", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("13", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("14", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("15", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("16", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("17", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("18", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("19", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("20", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("21", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("22", "G").format(GO.settings.time_format)
					+ '</td>',
			'<td colspan="4" class="availability_time">'
					+ Date.parseDate("23", "G").format(GO.settings.time_format)
					+ '</td>',

			'<tpl for=".">',
			'<tr>',
			'<td>{name}</td>',
			'<tpl if="this.hasFreeBusy(freebusy)">',
			'<tpl for="freebusy">',
			'<td id="time{time}"class="time {[values.busy == 1 ? "busy" : "free"]}"></td>',
			'</tpl>', '</tpl>', '<tpl if="!this.hasFreeBusy(freebusy)">',
			'<td colspan="96">' + GO.calendar.lang.noInformationAvailable
					+ '</td>', '</tpl>', '</tr>', '</tpl>', '</table>', {
				hasFreeBusy : function(freebusy) {
					return freebusy.length > 0;
				}
			});

	this.dataView = new Ext.DataView({
				store : new Ext.data.JsonStore({
							url : GO.settings.modules.calendar.url + 'json.php',
							root : 'participants',
							fields : ['name', 'email', 'freebusy'],
							baseParams : {
								task : 'availability',
								emails:'',
								names:'',
								event_id:0,
								date: ''
							}
						}),
				tpl : tpl,
				autoHeight : true,
				emptyText : GO.calendar.lang.noParticipantsToDisplay,
				itemSelector : 'td.time',
				overClass : 'time-over'
			});

	this.dataView.on('click', function(dataview, index, node) {
				this.fireEvent('select', dataview, index, node);
			}, this);

	this.dataView.store.on('load', function() {
				Ext.get("availability_date")
						.update(this.dataView.store.baseParams.date);
			}, this);

	Ext.apply(config, {
				layout : 'fit',
				modal : false,
				height : 400,
				width : 800,
				closeAction : 'hide',
				title : GO.lang.strAvailability,
				items : {
					layout : 'fit',
					cls : 'go-form-panel',
					waitMsgTarget : true,
					items : this.dataView,
					autoScroll : true
				},
				tbar : [{
					iconCls : 'btn-left-arrow',
					text : GO.calendar.lang.previousDay,
					cls : 'x-btn-text-icon',
					handler : function() {
						var date = Date.parseDate(
								this.dataView.store.baseParams.date,
								GO.settings.date_format).add(Date.DAY, -1);
						this.dataView.store.baseParams.date = date
								.format(GO.settings.date_format);
						this.dataView.store.load();
					},
					scope : this
				}, {
					iconCls : 'btn-right-arrow',
					text : GO.calendar.lang.nextDay,
					cls : 'x-btn-text-icon',
					handler : function() {
						var date = Date.parseDate(
								this.dataView.store.baseParams.date,
								GO.settings.date_format).add(Date.DAY, 1);
						this.dataView.store.baseParams.date = date
								.format(GO.settings.date_format);
						this.dataView.store.load();
					},
					scope : this
				}],
				buttons : [{
							text : GO.lang.cmdClose,
							handler : function() {
								this.hide();
							},
							scope : this
						}]
			});

	GO.calendar.AvailabilityCheckWindow.superclass.constructor.call(this, config);
	
	this.addEvents({'select' : true});
}

Ext.extend(GO.calendar.AvailabilityCheckWindow, GO.Window, {

		show : function(config){
			this.dataView.store.baseParams.date=config.date;
			this.dataView.store.baseParams.event_id=config.event_id;
			this.dataView.store.baseParams.emails=config.emails;
			this.dataView.store.baseParams.names=config.names;
			this.dataView.store.load();
			
			GO.calendar.AvailabilityCheckWindow.superclass.show.call(this);
		}

});