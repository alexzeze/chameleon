/**
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: AccountDialog.js 2825 2009-07-13 06:49:13Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

GO.email.AccountDialog = function(config) {
    Ext.apply(this, config);

    var typeField;
    var sslCb;

    function formatBoolean(value) {
        return value == "1" ? GO.lang.cmdYes : GO.lang.cmdNo;
    };

    // the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store (created below)
    var cm = new Ext.grid.ColumnModel([{
        header : GO.email.lang.field,
        dataIndex : 'field'
    }, {
        header : GO.email.lang.contains,
        dataIndex : 'keyword'
    }, {
        header : GO.email.lang.moveToFolder,
        dataIndex : 'folder'
    }, {
        header : GO.email.lang.markAsRead,
        dataIndex : 'mark_as_read',
        renderer : formatBoolean
    }]);

    // by default columns are sortable
    cm.defaultSortable = false;

    // create the Data Store
    this.filtersDS = new GO.data.JsonStore({

        url : GO.settings.modules.email.url + 'json.php',
        baseParams : {
            type : 'filters',
            account_id : this.account_id
        },
        root : 'results',
        id : 'id',
        fields : ['id', 'field', 'keyword', 'folder', 'mark_as_read'],
        remoteSort : false
    });

    // create the editor grid
    this.filtersTab = new GO.grid.GridPanel({
        title : GO.email.lang.filters,
        layout : 'fit',
        border : true,
        loadMask : true,
        ds : this.filtersDS,
        cm : cm,
        view : new Ext.grid.GridView({
            autoFill : true,
            forceFit : true,
            emptyText : GO.lang.strNoItems
        }),
        sm : new Ext.grid.RowSelectionModel(),
        tbar : [{
            iconCls : 'btn-add',
            text : GO.lang.cmdAdd,
            cls : 'x-btn-text-icon',
            handler : function() {
                filter.showDialog(0, this.account_id,
                    this.filtersDS);
            },
            scope : this
        }, {
            iconCls : 'btn-delete',
            text : GO.lang.cmdDelete,
            cls : 'x-btn-text-icon',
            handler : function() {
                this.filtersTab.deleteSelected();
            },
            scope : this
        }]

    });

    this.filtersTab.on('rowdblclick', function() {
        var selectionModel = this.filtersTab.getSelectionModel();
        var record = selectionModel.getSelected();
        filter.showDialog(record.data.id, this.account_id,
            this.filtersDS, GO.email.subscribedFoldersStore);
    }, this);

    this.filtersTab.on('show', function() {
        // trigger the data store load

        if (this.filtersDS.baseParams['account_id'] != this.account_id) {
            this.filtersDS.baseParams = {
                task : 'filters',
                account_id : this.account_id
            };
            this.filtersDS.load();
        }
    }, this);

    var incomingTab = {
        title : GO.email.lang.incomingMail,
        layout : 'form',
        defaults : {
            anchor : '100%'
        },
        defaultType : 'textfield',
        autoHeight : true,
        cls : 'go-form-panel',
        waitMsgTarget : true,
        labelWidth : 120,
        items : [typeField = new Ext.form.ComboBox({
            fieldLabel : GO.email.lang.type,
            hiddenName : 'type',
            store : new Ext.data.SimpleStore({
                fields : ['value', 'text'],
                data : [['imap', 'IMAP'],
                ['pop3', 'POP-3']]

            }),
            value : 'imap',
            valueField : 'value',
            displayField : 'text',
            mode : 'local',
            triggerAction : 'all',
            editable : false,
            selectOnFocus : true,
            forceSelection : true,
            listeners : {
                change : function() {
                    this.refreshNeeded = true;
                },
                scope : this
            }
        }), new Ext.form.TextField({
            fieldLabel : GO.email.lang.host,
            name : 'host',
            allowBlank : false,
            listeners : {
                change : function() {
                    this.refreshNeeded = true;
                },
                scope : this
            }
        }), new Ext.form.TextField({
            fieldLabel : GO.lang.strUsername,
            name : 'username',
            allowBlank : false,
            listeners : {
                change : function() {
                    this.refreshNeeded = true;
                },
                scope : this
            }
        }), new Ext.form.TextField({
            fieldLabel : GO.lang.strPassword,
            name : 'password',
            inputType : 'password',
            allowBlank : false,
            listeners : {
                change : function() {
                    this.refreshNeeded = true;
                },
                scope : this
            }
        }), {
            xtype : 'fieldset',
            title : GO.email.lang.advanced,
            collapsible : true,
            collapsed : true,
            autoHeight : true,
            autoWidth : true,
            // defaults: {anchor: '100%'},
            defaultType : 'textfield',
            labelWidth : 75,
            labelAlign : 'left',

            items : [sslCb = new Ext.form.Checkbox({
                boxLabel : GO.email.lang.ssl,
                name : 'use_ssl',
                checked : false,
                hideLabel : true
            }),/*
										 * new Ext.form.Checkbox({ boxLabel:
										 * GO.email.lang.tls, name: 'tls',
										 * checked: false, hideLabel:true }),
										 */new Ext.form.Checkbox({
                boxLabel : GO.email.lang.novalidateCert,
                name : 'novalidate_cert',
                checked : false,
                hideLabel : true
            }), new Ext.form.TextField({
                fieldLabel : GO.email.lang.port,
                name : 'port',
                value : '143',
                allowBlank : false
            }), new Ext.form.TextField({
                fieldLabel : GO.email.lang.rootMailbox,
                name : 'mbroot'
            })]
        }]
    };

    // end incomming tab

    var propertiesTab = {
        title : GO.lang.strProperties,
        layout : 'form',
        anchor : '100% 100%',
        defaultType : 'textfield',
        autoHeight : true,
        cls : 'go-form-panel',
        labelWidth : 100,
        items : [
		
        this.selectUser = new GO.form.SelectUser({
            fieldLabel : GO.lang.strUser,
            disabled : !GO.settings.modules['email']['write_permission'],
            anchor : '100%'
        }),
        {
            fieldLabel : GO.lang.strName,
            name : 'name',
            allowBlank : false,
            anchor : '100%'
        }, {
            fieldLabel : GO.lang.strEmail,
            name : 'email',
            allowBlank : false,
            listeners : {
                change : function() {
                    this.refreshNeeded = true;
                },
                scope : this
            },
            anchor : '100%'
        }, {
            xtype : 'textarea',
            name : 'signature',
            fieldLabel : GO.email.lang.signature,
            height : 100,
            anchor : '100%'
        }, this.aliasesButton = new Ext.Button({
            text : GO.email.lang.manageAliases,
            handler : function() {
                if (!this.aliasesDialog) {
                    this.aliasesDialog = new GO.email.AliasesDialog();
                }
                this.aliasesDialog.show(this.account_id);
            },
            scope : this
        })]
    };

    var outgoingTab = {
        title : GO.email.lang.outgoingMail,
        layout : 'form',
        defaults : {
            anchor : '100%'
        },
        defaultType : 'textfield',
        autoHeight : true,
        cls : 'go-form-panel',
        labelWidth : 120,
        items : [new Ext.form.TextField({
            fieldLabel : GO.email.lang.host,
            name : 'smtp_host',
            allowBlank : false,
            value : GO.email.defaultSmtpHost
        }), this.encryptionField = new Ext.form.ComboBox({
            fieldLabel : GO.email.lang.encryption,
            hiddenName : 'smtp_encryption',
            store : new Ext.data.SimpleStore({
                fields : ['value', 'text'],
                data : [
                ['', GO.email.lang.noEncryption],
                ['tls', 'TLS'], ['ssl', 'SSL']]
            }),
            value : '',
            valueField : 'value',
            displayField : 'text',
            typeAhead : true,
            mode : 'local',
            triggerAction : 'all',
            editable : false,
            selectOnFocus : true,
            forceSelection : true
        }), new Ext.form.TextField({
            fieldLabel : GO.email.lang.port,
            name : 'smtp_port',
            value : '25',
            allowBlank : false
        }), new Ext.form.TextField({
            fieldLabel : GO.lang.strUsername,
            name : 'smtp_username'
        }), new Ext.form.TextField({
            fieldLabel : GO.lang.strPassword,
            name : 'smtp_password',
            inputType : 'password'
        })]
    };

    GO.email.subscribedFoldersStore = new GO.data.JsonStore({

        url : GO.settings.modules.email.url + 'json.php',
        baseParams : {
            task : 'subscribed_folders',
            account_id : 0
        },
        root : 'data',
        fields : ['id', 'name']
    });

    this.foldersTab = new Ext.Panel({
        title : GO.email.lang.folders,
        autoHeight : true,
        layout : 'form',
        cls : 'go-form-panel',
        defaults : {
            anchor : '100%'
        },
        defaultType : 'textfield',
        labelWidth : 150,
        tbar : [{
            iconCls : 'btn-add',
            text : GO.email.lang.manageFolders,
            cls : 'x-btn-text-icon',
            scope : this,
            handler : function() {

                if (!this.foldersDialog) {
                    this.foldersDialog = new GO.email.FoldersDialog();
                }
                this.foldersDialog.show(this.account_id);

            }
        }],

        items : [new GO.form.ComboBoxReset({
            fieldLabel : GO.email.lang.sendItemsFolder,
            hiddenName : 'sent',
            store : GO.email.subscribedFoldersStore,
            valueField : 'name',
            displayField : 'name',
            typeAhead : true,
            mode : 'local',
            triggerAction : 'all',
            editable : false,
            selectOnFocus : true,
            forceSelection : true,
            emptyText : GO.lang.disabled
        }), new GO.form.ComboBoxReset({
            fieldLabel : GO.email.lang.trashFolder,
            hiddenName : 'trash',
            store : GO.email.subscribedFoldersStore,
            valueField : 'name',
            displayField : 'name',
            typeAhead : true,
            mode : 'local',
            triggerAction : 'all',
            editable : false,
            selectOnFocus : true,
            forceSelection : true,
            emptyText : GO.lang.disabled
        }), new GO.form.ComboBoxReset({
            fieldLabel : GO.email.lang.draftsFolder,
            hiddenName : 'drafts',
            store : GO.email.subscribedFoldersStore,
            valueField : 'name',
            displayField : 'name',
            typeAhead : true,
            mode : 'local',
            triggerAction : 'all',
            editable : false,
            selectOnFocus : true,
            forceSelection : true,
            emptyText : GO.lang.disabled
        })]

    });

    this.vacationPanel = new Ext.Panel({
        disabled : true,
        title : GO.email.lang.vacation,
        cls : 'go-form-panel',
        layout : 'form',
        autoScroll : true,
        items : [{
            xtype : 'checkbox',
            name : 'vacation_active',
            anchor : '-20',
            boxLabel : GO.email.lang.vacationActive,
            hideLabel : true

        }, {
            xtype : 'textfield',
            name : 'vacation_subject',
            anchor : '-20',
            fieldLabel : GO.email.lang.vacationSubject
        }, {
            xtype : 'textarea',
            name : 'vacation_body',
            anchor : '-20',
            fieldLabel : GO.email.lang.vacationBody,
            height : 160
        }]

    });

    var items = [propertiesTab,

    this.foldersTab, this.filtersTab, this.vacationPanel];

    if (GO.settings.modules.email.write_permission) {
        items.splice(1, 0, incomingTab, outgoingTab);
    }

    this.propertiesPanel = new Ext.form.FormPanel({
        url : GO.settings.modules.email.url + 'action.php',
        // labelWidth: 75, // label settings here cascade unless
        // overridden
        defaultType : 'textfield',
        waitMsgTarget : true,
        labelWidth : 120,
        border : false,
        items : [this.tabPanel = new Ext.TabPanel({
            hideLabel : true,
            deferredRender : false,
            activeTab : 0,
            border : false,
            anchor : '100% 100%',
            items : items
        })]

    });

    typeField.on('select', function(combo, record, index) {

        var value = index == 1 ? '110' : '143';

        this.propertiesPanel.form.findField('port').setValue(value);
    }, this);

    this.encryptionField.on('select', function(combo, record, index) {
        var value = record.data.value == '' ? '25' : '465';
        this.propertiesPanel.form.findField('smtp_port')
        .setValue(value);
    }, this);

    sslCb.on('check', function(checkbox, checked) {
        if (typeField.getValue() == 'imap') {
            var port = checked ? 993 : 143;
            this.propertiesPanel.form.findField('port').setValue(port);
        } else {
            var port = checked ? 995 : 110;
            this.propertiesPanel.form.findField('port').setValue(port);
        }
    }, this)

    this.selectUser.on('select', function(combo, record, index) {
        this.propertiesPanel.form.findField('email')
        .setValue(record.data.email);
        this.propertiesPanel.form.findField('username')
        .setValue(record.data.username);
        this.propertiesPanel.form.findField('name')
        .setValue(record.data.name);
    }, this);

    GO.email.AccountDialog.superclass.constructor.call(this, {
        layout : 'fit',
        modal : false,
        height : 400,
        width : 650,
        plain : true,
        closeAction : 'hide',
        title : GO.email.lang.account,

        items : this.propertiesPanel,

        buttons : [{

            text : GO.lang.cmdOk,
            handler : function() {
                this.save(true);
            },
            scope : this
        }, {

            text : GO.lang.cmdApply,
            handler : function() {
                this.save(false);
            },
            scope : this
        }, {

            text : GO.lang.cmdClose,
            handler : function() {
                this.hide();
            },
            scope : this
        }]
    });

    this.addEvents({
        'save' : true
    });

}

Ext.extend(GO.email.AccountDialog, Ext.Window, {

    save : function(hide) {
        this.propertiesPanel.form.submit({

            url : GO.settings.modules.email.url + 'action.php',
            params : {
                'task' : 'save_account_properties',
                'account_id' : this.account_id
            },
            waitMsg : GO.lang['waitMsgSave'],
            success : function(form, action) {

                action.result.refreshNeeded = this.refreshNeeded
                || this.account_id == 0;
                if (action.result.account_id) {
                    this.account_id = action.result.account_id;
                    // this.foldersTab.setDisabled(false);
                    this.loadAccount(this.account_id);
                }

                this.refreshNeeded = false;
                this.fireEvent('save', this, action.result);

                if (hide) {
                    this.hide();
                }

            },

            failure : function(form, action) {
                var error = '';
                if (action.failureType == 'client') {
                    error = GO.lang.strErrorsInForm;
                } else if (action.result) {
                    error = action.result.feedback;
                } else {
                    error = GO.lang.strRequestError;
                }

                Ext.MessageBox.alert(GO.lang.strError, error);
            },
            scope : this

        });

    },
    show : function(account_id) {
        GO.email.AccountDialog.superclass.show.call(this);

        this.tabPanel.setActiveTab(0);

        this.aliasesButton.setDisabled(true);
        if (account_id) {
            this.loadAccount(account_id);
            GO.email.subscribedFoldersStore.baseParams.account_id = account_id;
            GO.email.subscribedFoldersStore.load();
        } else {
			
            this.propertiesPanel.form.reset();
            this.account_id = 0;
            this.foldersTab.setDisabled(true);
            this.filtersTab.setDisabled(true);
            this.vacationPanel.setDisabled(true);
            // default values

            // this.selectUser.setValue(GO.settings['user_id']);
            // this.selectUser.setRawValue(GO.settings['name']);
            // this.selectUser.lastSelectionText=GO.settings['name'];

            this.propertiesPanel.form.findField('name')
            .setValue(GO.settings['name']);
            this.propertiesPanel.form.findField('email')
            .setValue(GO.settings['email']);
            this.propertiesPanel.form.findField('username')
            .setValue(GO.settings['username']);

        }
    },

    loadAccount : function(account_id) {
        this.propertiesPanel.form.load({
            url : GO.settings.modules.email.url + 'json.php',
            params : {
                account_id : account_id,
                task : 'account'
            },
            waitMsg : GO.lang.waitMsgLoad,
            success : function(form, action) {
                this.refreshNeeded = false;
                this.account_id = account_id;
                this.selectUser.setRemoteValue(action.result.data.user_id,
                    action.result.data.user_name);
						
                this.aliasesButton.setDisabled(false);

                this.foldersTab.setDisabled(action.result.data.type == 'pop3');
                this.filtersTab.setDisabled(action.result.data.type == 'pop3');
                this.vacationPanel
                .setDisabled(typeof(action.result.data.vacation_subject) == 'undefined');
            },
            scope : this
        });
    }
});

filter = function() {
    return {
        showDialog : function(filter_id, account_id, ds) {

						this.account_id=account_id;
						
            if (!this.win) {

                this.formPanel = new Ext.form.FormPanel({
                    layout : 'form',
                    defaults : {
                        anchor : '100%'
                    },
                    defaultType : 'textfield',
                    labelWidth : 125,
                    autoHeight : true,
                    cls : 'go-form-panel',
                    waitMsgTarget : true,
                    items : [new Ext.form.ComboBox({
                        fieldLabel : GO.email.lang.field,
                        hiddenName : 'field',
                        store : new Ext.data.SimpleStore({
                            fields : ['value', 'text'],
                            data : [
                            [
                            'from',
                            GO.email.lang.sender],
                            [
                            'subject',
                            GO.email.lang.subject],
                            ['to', GO.email.lang.sendTo],
                            [
                            'cc',
                            GO.email.lang.ccField]]
                        }),
                        value : 'from',
                        valueField : 'value',
                        displayField : 'text',
                        typeAhead : true,
                        mode : 'local',
                        triggerAction : 'all',
                        editable : false,
                        selectOnFocus : true,
                        forceSelection : true
                    }), {
                        fieldLabel : GO.email.lang.keyword,
                        name : 'keyword',
                        allowBlank : false
                    }, new Ext.form.ComboBox({
                        fieldLabel : GO.email.lang.moveToFolder,
                        hiddenName : 'folder',
                        store : GO.email.subscribedFoldersStore,
                        valueField : 'name',
                        displayField : 'name',
                        typeAhead : true,
                        mode : 'local',
                        triggerAction : 'all',
                        editable : false,
                        selectOnFocus : true,
                        forceSelection : true,
                        allowBlank : false
                    }), new Ext.form.Checkbox({
                        boxLabel : GO.email.lang.markAsRead,
                        name : 'mark_as_read',
                        checked : false,
                        hideLabel : true
                    })]
                }

                );

                this.win = new Ext.Window({
                    title : GO.email.lang.filter,
                    layout : 'fit',
                    modal : false,
                    shadow : false,
                    autoHeight : true,
                    width : 400,
                    plain : false,
                    closeAction : 'hide',
                    items : this.formPanel,
                    buttons : [{
                        text : GO.lang.cmdOk,
                        handler : function() {

                            this.formPanel.form.submit({
                                url : GO.settings.modules.email.url
                                + 'action.php',
                                params : {
                                    'task' : 'save_filter',
                                    'filter_id' : this.filter_id,
                                    'account_id' : this.account_id
                                },
                                waitMsg : GO.lang.waitMsgSave,
                                success : function(form, action) {

                                    if (action.result.filter_id) {
                                        this.filter_id = action.result.filter_id;
                                    }
                                    ds.reload();

                                    this.win.hide();

                                },
                                failure : function(form, action) {
                                    var error = '';
                                    if (action.failureType == 'client') {
                                        error = GO.lang.strErrorsInForm;
                                    } else {
                                        error = action.result.feedback;
                                    }

                                    Ext.MessageBox.alert(GO.lang.strError,
                                        error);
                                },
                                scope : this
                            });
                        },
                        scope : this
                    }, {
                        text : GO.lang.cmdClose,
                        handler : function() {
                            this.win.hide();
                        },
                        scope : this
                    }]
                });
            }

            if (this.filter_id != filter_id) {
                this.filter_id = filter_id;
								

                if (this.filter_id > 0) {
                    this.formPanel.load({
                        url : GO.settings.modules.email.url
                        + 'json.php',
                        params : {
                            filter_id : filter_id,
                            task : 'filter'
                        }
                    });
                } else {
                    this.formPanel.form.reset();
                }
            }
            this.win.show();
        }
    }
}();