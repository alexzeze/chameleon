Ext.ns('Ext.ux.grid');

Ext.ux.grid.ExplorerView = Ext.extend(Ext.grid.GridView, {
    /**
     * @cfg {Ext.Template} Template to use when rendering rows, null if default grid row rendering  
     */
    rowTemplate: null,

    /**
     * Changes the current row-template and refreshes the view.
     * @param {Ext.Template} template Use this template, set to null if you want grid default row rendering.
     */
    changeTemplate: function(template) {
        this.rowTemplate = template;
        this.initTemplates();
        this.refresh();
    },
    
    initTemplates: function() {
        Ext.ux.grid.ExplorerView.superclass.initTemplates.apply(
        	this, arguments);

		// Store original row template
        if (!this.templates.orgrow)
            this.templates.orgrow = this.templates.row;
        
        if (this.rowTemplate != null)
            this.templates.row = this.rowTemplate.compile();
        else
            this.templates.row = this.templates.orgrow;
    },
    
    doRender: function(cs, rs, ds, startRow, colCount, stripe){
        if (this.rowTemplate == null) {
            // Let GridView class handle "normal" rows
            return Ext.ux.grid.ExplorerView.superclass.doRender.apply(
                this, arguments);
        } else {
	        var ts = this.templates, rt = ts.row;
	        // buffers
	        var buf = [], r, c, p = {};			
			for(var j = 0, len = rs.length; j < len; j++){
			    r = rs[j];

			    // Make sure we get data that isnt visible also.
			    for(var i = 0; i < r.fields.items.length; i++)
					p[r.fields.items[i].name] = r.data[r.fields.items[i].name];
					
				// Use the column renderer if any
			    var rowIndex = (j+startRow);
	            for(var i = 0; i < colCount; i++){
	                p[cs[i].name] = cs[i].renderer(r.data[cs[i].name], p, r, rowIndex, i, ds);
	                if(p[cs[i].name] == undefined || p[cs[i].name] === "") p[cs[i].name] = "&#160;";
	            }

			    buf[buf.length] =  rt.apply(p);
			}
			return buf.join("");
        }
    },
    
    updateAllColumnWidths : function(){
        if (this.rowTemplate == null) {
            // Let GridView class handle "normal" rows
            return Ext.ux.grid.ExplorerView.superclass.updateAllColumnWidths.apply(
                this, arguments);
        } else {
	        var tw = this.getTotalWidth();
	        var clen = this.cm.getColumnCount();
	        var ws = [];
	        for(var i = 0; i < clen; i++){
	            ws[i] = this.getColumnWidth(i);
	        }
	        this.innerHd.firstChild.style.width = this.getOffsetWidth();
	        this.innerHd.firstChild.firstChild.style.width = tw;
	        this.mainBody.dom.style.width = tw;
	        for(var i = 0; i < clen; i++){
	            var hd = this.getHeaderCell(i);
	            hd.style.width = ws[i];
	        }
	
	        this.onAllColumnWidthsUpdated(ws, tw);
        }
    },
    
    updateColumnWidth : function(col, width){
        if (this.rowTemplate == null) {
            // Let GridView class handle "normal" rows
            return Ext.ux.grid.ExplorerView.superclass.updateColumnWidth.apply(
                this, arguments);
        } else {
	        var w = this.getColumnWidth(col);
	        var tw = this.getTotalWidth();
	        this.innerHd.firstChild.style.width = this.getOffsetWidth();
	        this.innerHd.firstChild.firstChild.style.width = tw;
	        this.mainBody.dom.style.width = tw;
	        var hd = this.getHeaderCell(col);
	        hd.style.width = w;

	        this.onColumnWidthUpdated(col, w, tw);
        }
    },
    
    updateColumnHidden : function(col, hidden){
    	if (this.rowTemplate == null) {
            // Let GridView class handle "normal" rows
            return Ext.ux.grid.ExplorerView.superclass.updateColumnHidden.apply(
                this, arguments);
        } else {
	        var tw = this.getTotalWidth();
	        this.innerHd.firstChild.style.width = this.getOffsetWidth();
	        this.innerHd.firstChild.firstChild.style.width = tw;
	        //this.mainBody.dom.style.width = tw;
	        var display = hidden ? 'none' : '';
	        var hd = this.getHeaderCell(col);
	        hd.style.display = display;
	        
	        this.onColumnHiddenUpdated(col, hidden, tw);
	        delete this.lastViewWidth; // force recalc
	        //this.layout();
	    }
    }
});

// Make sure ExplorerView is used in GridPanel
Ext.override(Ext.grid.GridPanel, {
    getView : function(){
        if(!this.view){
            this.view = new Ext.ux.grid.ExplorerView(this.viewConfig);
        }

        return this.view;
    }
});