// Array data for the grids
Ext.grid.dummyData = [
    ['Program Files', '2008-01-01 00:00', 'File Folder', 0, 'folder.png'],
    ['Program Files (x86)', '2008-01-01 00:03', 'File Folder', 0, 'folder.png'],
    ['ProgramData', '2008-02-06 13:21', 'File Folder', 0, 'folder.png'],
    ['temp', '2007-12-05 00:59', 'File Folder', 0, 'folder.png'],
    ['Users', '2008-05-01 18:08', 'File Folder', 0, 'folder.png'],
    ['Windows', '2008-01-01 04:57', 'File Folder', 0, 'folder.png'],

    ['install.exe', '2008-08-17 03:42', 'Application', 561671, 'application.png'],
    ['globdata.ini', '2008-10-01 16:01', 'Configuration Settings', 3214, 'application-settings.png'],
    ['VC_RED.MSI', '2008-10-09 07:31', 'Application', 9498742, 'application-installer.png'],
    ['VC_RED.cab', '2008-10-09 07:31', 'WinRAR Archive', 65789416, 'winrar-archive.png']
];

// Predefined templates
var largeIcons = new Ext.Template(
	'<div class="x-grid3-row ux-explorerview-large-icon-row {alt}">',
	'<table class="x-grid3-row-table"><tbody><tr><td class="x-grid3-col x-grid3-cell ux-explorerview-icon"><img src="images/large-{icon}"></td></tr>',
	'<tr><td class="x-grid3-col x-grid3-cell"><div class="x-grid3-cell-inner" unselectable="on">{name}</div></td></tr>',
	'</tbody></table></div>'
);

var detailedIcons = new Ext.Template(
	'<div class="x-grid3-row ux-explorerview-detailed-icon-row {alt}">',
	'<table class="x-grid3-row-table"><tbody><tr><td class="x-grid3-col x-grid3-cell ux-explorerview-icon"><img src="images/medium-{icon}"></td>',
	'<td class="x-grid3-col x-grid3-cell"><div class="x-grid3-cell-inner" unselectable="on">{name}<br><span>{type}<br>{size}</span></div></td></tr>',
	'</tbody></table></div>'
);

Ext.onReady(function() {
    var reader = new Ext.data.ArrayReader({}, [
        {name: 'name'},
        {name: 'modified', type: 'date', dateFormat: 'Y-m-d H:i'},
        {name: 'type'},
        {name: 'size'},
        {name: 'icon'}
    ]);

	var grid = new Ext.grid.GridPanel({
	    store: new Ext.data.Store({
	        reader: reader,
	        data: Ext.grid.dummyData,
	        sortInfo: {field: 'modified', direction: 'DESC'}
	    }),

	    columns: [
	        {id: 'name', header: 'Name', sortable: true, dataIndex: 'name'},
	        {header: 'Modified', width: 120, sortable: true, renderer: Ext.util.Format.dateRenderer('Y-m-d H:i'), dataIndex: 'modified'},
	        {header: 'Type', width: 120, sortable: true, dataIndex: 'type'},
	        {header: 'Size', width: 120, sortable: true, dataIndex: 'size', align: 'right', renderer: Ext.util.Format.fileSize}
	    ],

	    viewConfig: {
	        // Let this grid be special :)
		rowTemplate: largeIcons//detailedIcons
	    },

	    // Also using a customized version of the DragSelector made for DataView
	    plugins: [new Ext.ux.grid.DragSelector()],

	    enableDragDrop: true,

	    autoExpandColumn: 'name',
	    frame: true,
	    width: 700,
	    height: 450,
	    collapsible: true,
	    animCollapse: false,
	    title: 'ExplorerView Example without Grouping',
	    iconCls: 'icon-grid',
	    renderTo: document.body
	});
});