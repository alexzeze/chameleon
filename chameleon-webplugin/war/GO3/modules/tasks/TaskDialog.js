/**
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: TaskDialog.js 1984 2009-03-05 17:03:17Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

GO.tasks.TaskDialog = function() {

	this.buildForm();

	var focusName = function() {
		this.nameField.focus();
	};

	this.win = new Ext.Window({
		layout : 'fit',
		modal : false,
		resizable : false,
		width : 560,
		height : 400,
		closeAction : 'hide',
		title : GO.tasks.lang.task,
		items : this.formPanel,
		focus : focusName.createDelegate(this),
		buttons : [{
					text : GO.lang['cmdOk'],
					handler : function() {
						this.submitForm(true);

					},
					scope : this
				}, {
					text : GO.lang['cmdApply'],
					handler : function() {
						this.submitForm();
					},
					scope : this
				}, {
					text : GO.lang['cmdClose'],
					handler : function() {
						this.win.hide();
					},
					scope : this
				}]
/*
 * , keys: [{ key: Ext.TaskObject.ENTER, fn: function(){ this.submitForm();
 * this.win.hide(); }, scope:this }]
 */
		});

	this.win.render(Ext.getBody());

	GO.tasks.TaskDialog.superclass.constructor.call(this);

	this.addEvents({
				'save' : true
			});

}

Ext.extend(GO.tasks.TaskDialog, Ext.util.Observable, {

	show : function(config) {

		if (!config) {
			config = {};
		}

		//tmpfiles on the server ({name:'Name',tmp_file:/tmp/name.ext} will be attached)
		this.formPanel.baseParams.tmp_files = config.tmp_files ? Ext.encode(config.tmp_files) : '';
		
		delete this.link_config;
		this.formPanel.form.reset();

		this.tabPanel.setActiveTab(0);

		if (!config.task_id) {
			config.task_id = 0;
		}

		this.setTaskId(config.task_id);

		// this.selectTaskList.container.up('div.x-form-item').setDisplayed(false);

		if (config.task_id > 0) {

			this.formPanel.load({
				url : GO.settings.modules.tasks.url + 'json.php',
				success : function(form, action) {
					this.win.show();
					this.changeRepeat(action.result.data.repeat_type);
					this.setValues(config.values);

					this.selectTaskList
							.setRemoteText(action.result.data.tasklist_name);
					this
							.setWritePermission(action.result.data.write_permission);
				},
				failure : function(form, action) {
					Ext.Msg.alert(GO.lang['strError'], action.result.feedback)
				},
				scope : this

			});
		} else {
			delete this.formPanel.form.baseParams['exception_task_id'];
			delete this.formPanel.form.baseParams['exceptionDate'];

			this.lastTaskListId = this.selectTaskList.getValue();

			this.selectTaskList.setValue(this.lastTaskListId);

			this.setWritePermission(true);

			this.win.show();
			this.setValues(config.values);

			if (!config.tasklist_id) {
				config.tasklist_id = GO.tasks.defaultTasklist.id;
				config.tasklist_name = GO.tasks.defaultTasklist.name;
			}
			this.selectTaskList.setValue(config.tasklist_id);
			if (config.tasklist_name) {
				this.selectTaskList.setRemoteText(config.tasklist_name);
				// this.selectTaskList.container.up('div.x-form-item').setDisplayed(true);
			}
		}

		// if the newMenuButton from another passed a linkTypeId then set this
		// value in the select link field
		if (config.link_config) {
			this.link_config = config.link_config;
			if (config.link_config.type_id) {
				this.selectLinkField.setValue(config.link_config.type_id);
				this.selectLinkField.setRemoteText(config.link_config.text);
			}
		}
	},

	setWritePermission : function(writePermission) {
		this.win.buttons[0].setDisabled(!writePermission);
		this.win.buttons[1].setDisabled(!writePermission);
	},

	setValues : function(values) {
		if (values) {
			for (var key in values) {
				var field = this.formPanel.form.findField(key);
				if (field) {
					field.setValue(values[key]);
				}
			}
		}

	},
	setTaskId : function(task_id) {
		this.formPanel.form.baseParams['task_id'] = task_id;
		this.task_id = task_id;
	},

	setCurrentDate : function() {
		var formValues = {};

		var date = new Date();

		formValues['start_date'] = formValues['remind_date'] = date
				.format(GO.settings['date_format']);
		formValues['start_hour'] = date.format("H");
		formValues['start_min'] = '00';

		formValues['end_date'] = date.format(GO.settings['date_format']);
		formValues['end_hour'] = date.add(Date.HOUR, 1).format("H");
		formValues['end_min'] = '00';

		this.formPanel.form.setValues(formValues);
	},

	submitForm : function(hide) {
		this.formPanel.form.submit({
					url : GO.settings.modules.tasks.url + 'action.php',
					params : {
						'task' : 'save_task'
					},
					waitMsg : GO.lang['waitMsgSave'],
					success : function(form, action) {

						if (action.result.task_id) {
							this.setTaskId(action.result.task_id);
						}

						if (this.link_config && this.link_config.callback) {
							this.link_config.callback.call(this);
						}

						this.fireEvent('save', this, this.task_id);

						if (hide) {
							this.win.hide();
						}
					},
					failure : function(form, action) {
						if (action.failureType == 'client') {
							Ext.MessageBox.alert(GO.lang['strError'],
									GO.lang['strErrorsInForm']);
						} else {
							Ext.MessageBox.alert(GO.lang['strError'],
									action.result.feedback);
						}
					},
					scope : this
				});

	},

	buildForm : function() {

		this.nameField = new Ext.form.TextField({
					name : 'name',
					allowBlank : false,
					fieldLabel : GO.lang.strSubject
				});

		this.selectLinkField = new GO.form.SelectLink();

		var checkDateInput = function(field) {

			if (field.name == 'due_date') {
				if (startDate.getValue() > dueDate.getValue()) {
					startDate.setValue(dueDate.getValue());
				}
			} else {
				if (startDate.getValue() > dueDate.getValue()) {
					dueDate.setValue(startDate.getValue());
				}
			}

			var remindDate = startDate.getValue().add(Date.DAY, -GO.tasks.reminderDaysBefore);
			
			formPanel.form.findField('remind_date').setValue(remindDate);

			if (repeatType.getValue() > 0) {
				if (repeatEndDate.getValue() == '') {
					repeatForever.setValue(true);
				} else {
					var eD = dueDate.getValue();
					if (repeatEndDate.getValue() < eD) {
						repeatEndDate.setValue(eD.add(Date.DAY, 1));
					}
				}
			}
		}

		var now = new Date();

		var startDate = new Ext.form.DateField({
					name : 'start_date',
					format : GO.settings['date_format'],
					allowBlank : false,
					fieldLabel : GO.tasks.lang.startsAt,
					value : now.format(GO.settings.date_format),
					listeners : {
						change : {
							fn : checkDateInput,
							scope : this
						}
					}
				});

		var dueDate = new Ext.form.DateField({
					name : 'due_date',
					format : GO.settings['date_format'],
					allowBlank : false,
					fieldLabel : GO.tasks.lang.dueAt,
					value : now.format(GO.settings.date_format),
					listeners : {
						change : {
							fn : checkDateInput,
							scope : this
						}
					}
				});

		var taskStatus = new Ext.form.ComboBox({
					name : 'status_text',
					hiddenName : 'status',
					triggerAction : 'all',
					editable : false,
					selectOnFocus : true,
					forceSelection : true,
					fieldLabel : GO.lang.strStatus,
					mode : 'local',
					value : 'ACCEPTED',
					valueField : 'value',
					displayField : 'text',
					store : new Ext.data.SimpleStore({
								fields : ['value', 'text'],
								data : [
										['NEEDS-ACTION',
												GO.tasks.lang.needsAction],
										['ACCEPTED', GO.tasks.lang.accepted],
										['DECLINED', GO.tasks.lang.declined],
										['TENTATIVE', GO.tasks.lang.tentative],
										['DELEGATED', GO.tasks.lang.delegated],
										['COMPLETED', GO.tasks.lang.completed],
										['IN-PROCESS', GO.tasks.lang.inProcess]]
							})
				});

		this.selectTaskList = new GO.tasks.SelectTasklist({
					fieldLabel : GO.tasks.lang.tasklist
				});

		var propertiesPanel = new Ext.Panel({
					hideMode : 'offsets',
					title : GO.lang['strProperties'],
					defaults : {
						anchor : '-20'
					},
					// cls:'go-form-panel',waitMsgTarget:true,
					bodyStyle : 'padding:5px',
					layout : 'form',
					autoScroll : true,
					items : [this.nameField, this.selectLinkField,
							startDate, dueDate, taskStatus, this.selectTaskList]

				});
				
		this.descriptionPanel = new Ext.Panel({
			title: GO.lang.strDescription,
			layout: 'fit',
			border:false,
			items:[{
					xtype:'textarea',
					name : 'description',
					anchor:'100% 100%',
					hideLabel:true
				}]
		});

		// Start of recurrence tab
		this.repeatEvery = new Ext.form.ComboBox({
					fieldLabel : GO.tasks.lang.repeatEvery,
					name : 'repeat_every_text',
					hiddenName : 'repeat_every',
					triggerAction : 'all',
					editable : false,
					selectOnFocus : true,
					width : 50,
					forceSelection : true,
					mode : 'local',
					value : '1',
					valueField : 'value',
					displayField : 'text',

					store : new Ext.data.SimpleStore({
								fields : ['value', 'text'],
								data : [['1', '1'], ['2', '2'], ['3', '3'],
										['4', '4'], ['5', '5'], ['6', '6'],
										['7', '7'], ['8', '8'], ['9', '9'],
										['10', '10'], ['11', '11'],
										['12', '12']]
							})
				});

		var repeatType = this.repeatType = new Ext.form.ComboBox({
					hiddenName : 'repeat_type',
					triggerAction : 'all',
					editable : false,
					selectOnFocus : true,
					width : 200,
					forceSelection : true,
					mode : 'local',
					value : '0',
					valueField : 'value',
					displayField : 'text',
					store : new Ext.data.SimpleStore({
								fields : ['value', 'text'],
								data : [['0', GO.lang.noRecurrence],
										['1', GO.lang.strDays],
										['2', GO.lang.strWeeks],
										['3', GO.lang.monthsByDate],
										['4', GO.lang.monthsByDay],
										['5', GO.lang.strYears]]
							}),
					hideLabel : true,
					listeners : {
						change : {
							fn : checkDateInput,
							scope : this
						}
					}
				});

		this.repeatType.on('select', function(combo, record) {
					this.changeRepeat(record.data.value);
				}, this);

		this.monthTime = new Ext.form.ComboBox({
					hiddenName : 'month_time',
					triggerAction : 'all',
					selectOnFocus : true,
					disabled : true,
					width : 80,
					forceSelection : true,
					fieldLabel : GO.tasks.lang.atDays,
					mode : 'local',
					value : '1',
					valueField : 'value',
					displayField : 'text',
					store : new Ext.data.SimpleStore({
								fields : ['value', 'text'],
								data : [['1', GO.lang.strFirst],
										['2', GO.lang.strSecond],
										['3', GO.lang.strThird],
										['4', GO.lang.strFourth]]
							})
				});

		var cb = [];
		for (var day = 0; day < 7; day++) {
			cb[day] = new Ext.form.Checkbox({
						boxLabel : GO.lang.shortDays[day],
						name : 'repeat_days_' + day,
						disabled : true,
						checked : false,
						width : 'auto',
						hideLabel : true,
						laelSeperator : ''
					});
		}

		var repeatEndDate = this.repeatEndDate = new Ext.form.DateField({
					name : 'repeat_end_date',
					width : 100,
					disabled : true,
					format : GO.settings['date_format'],
					allowBlank : true,
					fieldLabel : GO.tasks.lang.repeatUntil,
					listeners : {
						change : {
							fn : checkDateInput,
							scope : this
						}
					}
				});

		var repeatForever = this.repeatForever = new Ext.form.Checkbox({
					boxLabel : GO.tasks.lang.repeatForever,
					name : 'repeat_forever',
					checked : true,
					disabled : true,
					width : 'auto',
					hideLabel : true,
					laelSeperator : ''
				});

		var recurrencePanel = new Ext.Panel({
					title : GO.tasks.lang.recurrence,
					bodyStyle : 'padding: 5px',
					layout : 'form',
					hideMode : 'offsets',
					autoScroll : true,
					items : [{
								border : false,
								layout : 'table',
								defaults : {
									border : false,
									layout : 'form',
									bodyStyle : 'padding-right:3px'
								},
								items : [{
											items : this.repeatEvery
										}, {
											items : this.repeatType
										}]
							}, {
								border : false,
								layout : 'table',
								defaults : {
									border : false,
									layout : 'form',
									bodyStyle : 'padding-right:3px;white-space:nowrap'
								},

								items : [{
											items : this.monthTime
										}, {
											items : cb[0]
										}, {
											items : cb[1]
										}, {
											items : cb[2]
										}, {
											items : cb[3]
										}, {
											items : cb[4]
										}, {
											items : cb[5]
										}, {
											items : cb[6]
										}]
							}, {
								border : false,
								layout : 'table',
								defaults : {
									border : false,
									layout : 'form',
									bodyStyle : 'padding-right:3px'
								},
								items : [{
											items : this.repeatEndDate
										}, {
											items : this.repeatForever
										}]
							}]
				});

		var remindDate = now.add(Date.DAY, -GO.tasks.reminderDaysBefore);
		
		// start other options tab
		var optionsPanel = new Ext.Panel({

					title : GO.tasks.lang.options,
					defaults : {
						anchor : '100%'
					},
					bodyStyle : 'padding:5px',
					layout : 'form',
					hideMode : 'offsets',
					autoScroll : true,
					items : [{
						xtype : 'checkbox',
						boxLabel : GO.tasks.lang.remindMe,
						hideLabel : true,
						name : 'remind',
						value: GO.tasks.reminde=='1',
						listeners : {
							'check' : function(field, checked) {
								this.formPanel.form.findField('remind_date')
										.setDisabled(!checked);
								this.formPanel.form.findField('remind_time')
										.setDisabled(!checked);
							},
							scope : this
						}
					}, {
						xtype : 'datefield',
						name : 'remind_date',
						format : GO.settings.date_format,
						value : remindDate.format(GO.settings['date_format']),
						fieldLabel : GO.lang.strDate,
						disabled : true
					}, {
						xtype : 'timefield',
						name : 'remind_time',
						format : GO.settings.time_format,
						value : GO.tasks.reminderTime,
						fieldLabel : GO.lang.strTime,
						disabled : true
					}]
				});

		var items = [propertiesPanel, this.descriptionPanel, recurrencePanel, optionsPanel];

		this.tabPanel = new Ext.TabPanel({
					activeTab : 0,
					deferredRender : false,
					// layoutOnTabChange:true,
					border : false,
					anchor : '100% 100%',
					hideLabel : true,
					items : items
				});

		var formPanel = this.formPanel = new Ext.form.FormPanel({
					waitMsgTarget : true,
					url : GO.settings.modules.tasks.url + 'action.php',
					border : false,
					baseParams : {
						task : 'task'
					},
					items : this.tabPanel
				});
	},

	changeRepeat : function(value) {

		var form = this.formPanel.form;
		switch (value) {
			case '0' :
				this.disableDays(true);
				this.monthTime.setDisabled(true);
				this.repeatForever.setDisabled(true);
				this.repeatEndDate.setDisabled(true);
				this.repeatEvery.setDisabled(true);
				break;

			case '1' :
				this.disableDays(true);
				this.monthTime.setDisabled(true);
				this.repeatForever.setDisabled(false);
				this.repeatEndDate.setDisabled(false);
				this.repeatEvery.setDisabled(false);

				break;

			case '2' :
				this.disableDays(false);
				this.monthTime.setDisabled(true);
				this.repeatForever.setDisabled(false);
				this.repeatEndDate.setDisabled(false);
				this.repeatEvery.setDisabled(false);

				break;

			case '3' :
				this.disableDays(true);
				this.monthTime.setDisabled(true);
				this.repeatForever.setDisabled(false);
				this.repeatEndDate.setDisabled(false);
				this.repeatEvery.setDisabled(false);

				break;

			case '4' :
				this.disableDays(false);
				this.monthTime.setDisabled(false);
				this.repeatForever.setDisabled(false);
				this.repeatEndDate.setDisabled(false);
				this.repeatEvery.setDisabled(false);
				break;

			case '5' :
				this.disableDays(true);
				this.monthTime.setDisabled(true);
				this.repeatForever.setDisabled(false);
				this.repeatEndDate.setDisabled(false);
				this.repeatEvery.setDisabled(false);
				break;
		}
	},
	disableDays : function(disabled) {
		for (var day = 0; day < 7; day++) {
			this.formPanel.form.findField('repeat_days_' + day)
					.setDisabled(disabled);
		}
	}
});