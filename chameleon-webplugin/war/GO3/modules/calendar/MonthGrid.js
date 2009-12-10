/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: MonthGrid.js 2780 2009-07-06 14:40:08Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

 
GO.grid.MonthGrid = Ext.extend(Ext.Panel, {
	/**
     * @cfg {String} The components handles dates in this format
     */
	dateFormat : 'Y-m-d',
	/**
     * @cfg {String} The components handles dates in this format
     */
	dateTimeFormat : 'Y-m-d H:i',
	
	timeFormat : 'H:i',
	/**
     * @cfg {Number} Start day of the week. Monday or sunday
     */
	firstWeekday : 1,
	/**
     * @cfg {Date} The date set by the user
     */
	configuredDate : false,
	/**
     * @cfg {Date} The date where the grid starts. This can be recalculated after a user sets a date
     */
	startDate : false,
	
	//private var that is used when an event is dragged to another location
	dragEvent : false,
	
	//all the grid appointments are stored in this array. First index is day and second is the dom ID.
	appointments : Array(),
	
	//The remote database ID's can be stored in this array. Useful for database updates
	remoteEvents : Array(),
	
	//domids that need to be moved along with another. When an event spans multiple days
	domIds : Array(),
	
	//eventIdToDomId : {},
	
	//amount of days to display
	days : 1,
	
	selected : Array(),
	
	writePermission : false,
	
	/**
   * The amount of space to reserve for the scrollbar (defaults to 19 pixels)
   * @type Number
   */
  scrollOffset: 22,
  
  gridEvents : {},
  
  weekNumberWidth : 16,


	// private
  initComponent : function(){	
		this.autoScroll=true;	
		this.addEvents({
				'showday' :true,
	        /**
		     * @event click
		     * Fires when this button is clicked
		     * @param {Button} this
		     * @param {EventObject} e The click event
		     */
		    "create" : true,
	        /**
		     * @event toggle
		     * Fires when the "pressed" state of this button changes (only if enableToggle = true)
		     * @param {Button} this
		     * @param {Boolean} pressed
		     */
		    "move" : true,	    
		    "eventResize" : true,	    
		    "eventDblClick" : true
	
	    });    
    
	    if(this.store){
	        this.setStore(this.store, true);
	    }

		if(!this.startDate)
		{
			//lose time
			var date = new Date();
			this.startDate=Date.parseDate(date.format(this.dateFormat), this.dateFormat);
		}
		
		this.configuredDate=this.startDate;
		
		GO.grid.MonthGrid.superclass.initComponent.call(this);
  },

	//build the html grid
	afterRender : function(){
		
		GO.grid.MonthGrid.superclass.afterRender.call(this);
		
		//important to do here. Don't remember why :S
		this.setDate(this.startDate, false);
		

		
		//if this is not set the grid does not display well when I put a load mask on it.
		//this.body.setStyle("overflow", "hidden");
		
		//Don't select things inside the grid
		this.body.unselectable();

		//this.renderMonthView();
		
		this.setStore(this.store);
		
		this.initDD();
	},
	
	renderMonthView : function()
	{	
		this.body.update('');		
		
		var currentMonthStr = this.configuredDate.format('Ym');
		var currentDate = new Date();
		var currentDateStr = currentDate.format('Ymd');
		
		var weekDay=0;
		var cellClass = '';
		var dateFormat;
		
		this.cellWrap = Ext.DomHelper.append(this.body,{tag:'div'}, true);
			
	
		this.gridCells={};
		this.weekNumberCells=[];
		
		for(var day=0;day<this.days;day++)
		{	
			var dt = this.startDate.add(Date.DAY, day);
			
			if(day == 0 || dt.format('j')==1)
			{
				dateFormat = 'j F';
			}else
			{
				dateFormat = 'j';
			}			
			
			var weekday = dt.format('w');
			var monthStr = dt.format('Ym');			
			var dateStr = dt.format('Ymd');
			
			
			if(weekday==this.firstWeekday)
			{
				var weekNo = dt.format('W');
				
				var cell = Ext.DomHelper.append(this.cellWrap,
				{
					tag: 'div',
					style: 'width:'+(this.weekNumberWidth-1)+'px',
					cls: 'cal-monthgrid-week-no'
				}, true);
				
				var weekLink = Ext.DomHelper.append(cell,{
						tag: 'a',
						cls: 'x-monthGrid-cell-day-text',
						href: '#',
						id:'wl-'+dateStr,
						html: weekNo
					}, true);
					
				weekLink.on('click', this.onWeekClick, this);
				
				this.weekNumberCells.push(cell);
			}
			
			
			
			if(dateStr==currentDateStr)
			{
				cellClass = 'cal-monthGrid-cell x-monthGrid-cell-today';
			}else if(monthStr==currentMonthStr && (weekday==0 || weekday==6))
			{
				cellClass = 'cal-monthGrid-cell x-monthGrid-cell-weekend';
			}else if (monthStr==currentMonthStr)
			{
				cellClass = 'cal-monthGrid-cell x-monthGrid-cell-current';
			}else
			{
				cellClass = 'cal-monthGrid-cell';
			}			
			
			var id = 'd'+dateStr;
			
			var cell = Ext.DomHelper.append(this.cellWrap,
				{
					tag: 'div', 
					id: id, 
					cls: cellClass
				}, true);
			
			var dayLink = Ext.DomHelper.append(cell,{
						tag: 'a',
						cls: 'x-monthGrid-cell-day-text',
						href: '#',
						html: dt.format(dateFormat)
					}, true);
					
			dayLink.on('click', this.onAddClick, this);
			
			this.gridCells[dateStr]=cell;
		}
		this.syncSize();
	},
	
	onMoreClick : function(e, target)
	{
		var cell = Ext.get(target).findParent('div.cal-monthGrid-cell', 3);				
		var date = Date.parseDate(cell.id.substring(1, cell.id.length),'Ymd');
		this.fireEvent('changeview', this, 1, date);
	},
	
	onWeekClick : function(e, target){				
		var date = Date.parseDate(target.id.substring(3, target.id.length),'Ymd');
		this.fireEvent('changeview', this, 7, date);
	},
	
	onAddClick : function(e, target){			
		var cell = Ext.get(target).findParent('div.cal-monthGrid-cell', 3);				
		var date = Date.parseDate(cell.id.substring(1, cell.id.length),'Ymd');
		this.fireEvent('create', this, date);
	},
		    
  onResize : function(adjWidth, adjHeight, rawWidth, rawHeight){
    Ext.grid.GridPanel.superclass.onResize.apply(this, arguments);

		this.syncSize();
		this.checkOverflow();
  },
  
  calcCellSize : function (ctSize, scrollOffsetUsed)
  {
  	this.cellHeight = (ctSize['height']/(this.days/7));
		if(this.cellHeight<100)
		{
			this.cellHeight=100;
			if(!scrollOffsetUsed)
			{
				ctSize['width']-= this.scrollOffset;
			}
		}									
		
		this.cellWidth = ((ctSize['width']-this.weekNumberWidth)/7);
		if(this.cellWidth<100)
		{
			this.cellWidth=100;
			ctSize['height']-= this.scrollOffset;
			
			if(!scrollOffsetUsed)
			{
				this.calcCellSize(ctSize, true);
			}
		}
		
		this.cellHeight=Math.floor(this.cellHeight);
		this.cellWidth=Math.floor(this.cellWidth);
		
		
  },
  
  checkOverflow : function(){
  	if(this.overflowIndicators)
		{
			for(var i=0;i<this.overflowIndicators.length;i++)
				this.overflowIndicators[i].remove();
		}
		
		this.overflowIndicators=[];
		
  	for(var i in this.gridCells)
		{			
			if(this.gridCells[i].dom.scrollHeight>this.gridCells[i].dom.clientHeight)
			{				
				var el = Ext.DomHelper.append(this.gridCells[i],
				{
					tag: 'a', 
					cls: 'cal-overflow-indicator',
					href: '#',
					html: GO.lang.more+'...'
				}, true);
				
				el.on('click', this.onMoreClick, this);
				
				var pos = this.gridCells[i].getXY();				
				el.setXY(pos);					
				this.overflowIndicators.push(el);
			}
		}
  },
  
  syncSize : function(){  
  	
  	if(this.cellWrap)
		{			
			//get content size of element
			var ctSize = this.container.getSize(true);			
			this.calcCellSize(ctSize);	
			
			this.cellWrap.setSize(this.cellWidth*7+this.weekNumberWidth, this.cellHeight*(this.days/7));			

			for(var i in this.gridCells)
			{
				this.gridCells[i].setSize(this.cellWidth, this.cellHeight);
			}
			
			for(var i=0;i<this.weekNumberCells.length;i++)
			{
				this.weekNumberCells[i].setHeight(this.cellHeight);
			}
			
			for(var d in this.gridEvents)
			{
				for(var i=0;i<this.gridEvents[d].length;i++)
					this.gridEvents[d][i].setWidth(this.cellWidth-3);
			}
			
			
		}	
  },
	
	initDD :  function(){
		
		var dragZone = new GO.calendar.dd.MonthDragZone(this.body, {
            ddGroup: 'month-grid',
            scroll: false,
            monthGrid: this
        });
        
        var dropTarget = new GO.calendar.dd.MonthDropTarget(this.body, {
            ddGroup: 'month-grid',
            onNotifyDrop : function(dd, e, data) {
            		
            		//number of seconds moved
            		
            		var dragTime = data.dragDate.format('U');
            		var dropTime = data.dropDate.format('U');
            		
            		offsetDays = Math.round((dropTime-dragTime)/86400);
            		
            		var actionData = {offsetDays:offsetDays, dragDate: data.dragDate};
            		
            		var remoteEvent = this.elementToEvent(data.item.id);
            		
				
								if(remoteEvent['repeats'])
								{
									this.handleRecurringEvent("move", remoteEvent, actionData);
								}else
								{
									this.fireEvent("move", this, remoteEvent, actionData);
									
									this.removeEvent(remoteEvent.domId);
									delete remoteEvent.domId;
									remoteEvent.repeats=false;
									remoteEvent.startDate = remoteEvent.startDate.add(Date.DAY, offsetDays);
									remoteEvent.endDate = remoteEvent.endDate.add(Date.DAY, offsetDays);
									remoteEvent.start_time = remoteEvent.startDate.format('U');
									remoteEvent.end_time = remoteEvent.endDate.format('U');									
									this.addMonthGridEvent(remoteEvent);
								}           		
            	},
            scope : this
        });
	},
  
	setStore : function(store, initial){
    if(!initial && this.store){
    	this.store.un("beforeload", this.reload);
        this.store.un("datachanged", this.reload);
        this.store.un("clear", this.reload);
    }
    if(store){
    	store.on("beforeload", this.mask, this);
        store.on("datachanged", this.reload, this);
        store.on("clear", this.reload, this);
        
    }
    this.store = store;
  },
  
  setStoreBaseParams : function(){
  	this.store.baseParams['start_time']=this.startDate.format(this.dateTimeFormat);
    this.store.baseParams['end_time']=this.endDate.format(this.dateTimeFormat);
  },
	
	getFirstDateOfWeek : function(date)
	{
		//Calculate the first day of the week		
		var weekday = date.getDay();
		if(weekday<this.firstWeekday)
			weekday=7;
			
		return date.add(Date.DAY, this.firstWeekday-weekday);
	},	
	mask : function()
	{
		if(this.rendered)
		{
		 	this.body.mask(GO.lang.waitMsgLoad,'x-mask-loading');
		}
	},	
	unmask : function()
	{
		if(this.rendered)
		{
			this.body.unmask();		
		}
	},
	getSelectedEvent : function()
	{
		if(this.selected)
		{
			return this.elementToEvent(this.selected[0].id);
		}
	},
	isSelected : function(eventEl)
	{
		for (var i=0;i<this.selected.length;i++)
		{
			if(this.selected[i].id==eventEl)
			{
				return true;
			}
		}
		return false;
	},	
	clearSelection : function()
	{
		for (var i=0;i<this.selected.length;i++)
		{
			this.selected[i].removeClass('x-calGrid-selected');
		}
		this.selected=[];
	},
	selectEventElement : function(eventEl)
	{
		if(!this.isSelected(eventEl))
		{
			this.clearSelection();
			
			var elements = this.getRelatedDomElements(eventEl.id);
			
			for (var i=0;i<elements.length;i++)
			{			
				var element = Ext.get(elements[i]);
				if(element)
				{
					element.addClass('x-calGrid-selected');
					this.selected.push(element);
				}
			}
		}

	},
	addMonthGridEvent : function (eventData)
	{
		//the start of the day the event starts
		var eventStartDay = Date.parseDate(eventData.startDate.format('Ymd'),'Ymd');
		var eventEndDay = Date.parseDate(eventData.endDate.format('Ymd'),'Ymd');
		
		//get unix timestamps
		var eventStartTime = eventStartDay.format('U');
		var eventEndTime = eventEndDay.format('U');
		
		//ceil required because of DST changes!
		var daySpan = Math.round((eventEndTime-eventStartTime)/86400)+1;
		//var daySpan = Math.round((eventEndTime-eventStartTime)/86400);
		
		
		for(var i=0;i<daySpan;i++)
		{
			var date = eventStartDay.add(Date.DAY, i);
			
			eventData.domId = Ext.id();
			
			//related events for dragging
			if(daySpan>1)
			{
				if(!this.domIds[eventData.id])
				{
					this.domIds[eventData.id]=[];
				}				
				this.domIds[eventData.id].push(eventData.domId);
			}
			
			var col = Ext.get('d'+date.format('Ymd'));
			
			if(col)
			{
				var text = '';
				if(eventData.startDate.format('G')!='0')
				{
					text += eventData.startDate.format(GO.settings.time_format)+'&nbsp;';
				}				
				text += eventData['name'];
			
				var event = Ext.DomHelper.append(col,
					{
						tag: 'div', 
						id: eventData.domId, 
						cls: "x-calGrid-month-event-container", 
						style:"background-color:#"+eventData.background+';width:'+(this.eventWidth)+'px',
						html: text, 						
						qtip: GO.calendar.formatQtip(eventData),
						qtitle:eventData.name
					}, true);				
					
				var dateStr = date.format('Ymd');
				if(!this.gridEvents[dateStr])
				{
					this.gridEvents[dateStr]=[];
				}
				
				this.gridEvents[dateStr].push(event);
				
				this.registerEvent(eventData.domId, eventData);				
				
				event.on('mousedown', function(e, eventEl){				
					eventEl = Ext.get(eventEl).findParent('div.x-calGrid-month-event-container', 2, true);
					
					this.selectEventElement(eventEl);					
					this.clickedEventId=eventEl.id;		
				}, this);
				
				event.on('dblclick', function(e, eventEl){
					
					eventEl = Ext.get(eventEl).findParent('div.x-calGrid-month-event-container', 2, true);
					
					//this.eventDoubleClicked=true;
					var event = this.elementToEvent(this.clickedEventId);
					
					if(event['repeats'] && this.writePermission)
					{
						this.handleRecurringEvent("eventDblClick", event, {});
					}else
					{						
						this.fireEvent("eventDblClick", this, event, {singleInstance : this.writePermission});
					}
					
				}, this);	
			}
		}
		
		if(!this.loading)
			this.checkOverflow();
		
		return eventData.domId;
	},
	
	/*
	 * Removes a single event and it's associated dom elements
	 */
	removeEvent : function(domId){		
		var ids = this.getRelatedDomElements(domId);
		
		if(ids)
		{
			for(var i=0;i<ids.length;i++)
			{
				var el = Ext.get(ids[i]);
				if(el)
				{
					el.removeAllListeners();
					el.remove();
				}					
				this.unregisterDomId(ids[i]);
			}			
		}		
		
		this.checkOverflow();
	},
	
	unregisterDomId : function(domId)
	{
		delete this.remoteEvents[domId];
		
		var found = false;
		
		for(var e in this.domIds)
		{
			for(var i=0;i<this.domIds[e].length;i++)
			{
				if(this.domIds[e][i]==domId)
				{
					this.domIds[e].splice(i,1);
					found=true;
					break;
				}
			}
			if(found)
			{
				break;
			}
		}
	},
	

	setNewEventId : function(dom_id, new_event_id){	
		this.remoteEvents[dom_id].event_id=new_event_id;
  },
  
	handleRecurringEvent : function(fireEvent, event, actionData){
		
		//store them here so the already created window can use these values
		this.currentRecurringEvent = event;
		this.currentFireEvent=fireEvent;
		this.currentActionData = actionData;
		
		if(!this.recurrenceDialog)
		{
			
			this.recurrenceDialog = new Ext.Window({				
				width:400,
				autoHeight:true,
				closeable:false,
				closeAction:'hide',
				plain:true,
				border: false,
				title:GO.calendar.lang.recurringEvent,
				modal:false,
				html: GO.calendar.lang.editRecurringEvent,
				buttons: [{
						text: GO.calendar.lang.singleOccurence,
						handler: function(){
							
							this.currentActionData.singleInstance=true;						
							
							var remoteEvent = this.currentRecurringEvent;
							
							this.fireEvent(this.currentFireEvent, this, remoteEvent , this.currentActionData);
							
							if(this.currentActionData.offsetDays)
							{
								this.removeEvent(remoteEvent.domId);		
								remoteEvent.repeats=false;						
								remoteEvent.startDate = remoteEvent.startDate.add(Date.DAY, offsetDays);
								remoteEvent.endDate = remoteEvent.endDate.add(Date.DAY, offsetDays);
								remoteEvent.start_time = remoteEvent.startDate.format('U');
								remoteEvent.end_time = remoteEvent.endDate.format('U');									
								this.addMonthGridEvent(remoteEvent);
							}
							
							this.recurrenceDialog.hide();
						},
						scope: this
		   			},{
						text: GO.calendar.lang.entireSeries,
						handler: function(){
							
							this.currentActionData.singleInstance=false;
							
							this.fireEvent(this.currentFireEvent, this, this.currentRecurringEvent, this.currentActionData);
							this.recurrenceDialog.hide();
						},
						scope: this
		   			}]				
			});
		}
		this.recurrenceDialog.show();
	},
  clearGrid : function()
	{
		this.gridEvents={};
		this.appointments=Array();		
		this.remoteEvents=Array();
		this.domIds=Array();
	},	
  setDate : function(date, load)
  {      	
  	var oldStartDate = this.startDate;
  	var oldEndDate = this.endDate;  	
  	
  	this.configuredDate = date;    	

  	//calculate first date of month
  	var firstDateOfMonth = date.getFirstDateOfMonth();
		var lastDateOfMonth = date.getLastDateOfMonth();
		
		//start at the monday of the week the current month starts in
		this.startDate=this.getFirstDateOfWeek(firstDateOfMonth);
				
		var startTime = this.startDate.format('U');
		var endTime = lastDateOfMonth.format('U');
		
		var daysToShow = ((endTime-startTime)/86400)+1;
		
		var rows = Math.ceil(daysToShow/7);
		
		this.days = rows*7;
	    	
    this.endDate = this.startDate.add(Date.DAY, this.days);
  	this.setStoreBaseParams();
  	
  	
  	if(!oldEndDate || !oldStartDate || oldEndDate.getElapsed(this.endDate)!=0 || oldStartDate.getElapsed(this.startDate)!=0)
  	{		
  		if(load)
  		{     		
    		this.store.reload();
  		}else
  		{	
    	  this.loadRequired=true;
  		}	    	
  	} 
  },
  
  reload : function()
  {
  	/*this.clearGrid();
  	if(!this.monthView)
  	{
  		this.createHeadings();
  	}    	*/
  	this.load();  	
  },
  
  load : function()
  {		
  	if(this.rendered)
  	{
  		this.loading=true;
  		this.clearGrid();
  		this.renderMonthView();
  		
  		this.writePermission = this.store.reader.jsonData.write_permission;
  		
			var records = this.store.getRange();
		
      for(var i = 0, len = records.length; i < len; i++){            
            
        var startDate = Date.parseDate(records[i].data['start_time'], this.dateTimeFormat);
				var endDate = Date.parseDate(records[i].data['end_time'], this.dateTimeFormat);
				
				var eventData = records[i].data;
				eventData['startDate']=startDate;
				eventData['endDate']=endDate;			
				
				this.addMonthGridEvent (eventData);            
    	}
    	
    	this.checkOverflow();
    	
    	this.unmask();
      
      this.loading=false;
    	this.loadRequired=false;
  	}
  
  },
  /**
   * An array of domId=>database ID should be kept so that we can figure out
   * which event to update when it's modified.
   * @param {String} domId The unique DOM id of the element
   * @param {String} remoteId The unique database id of the element     
   * @return void
   */
  registerEvent : function(domId, eventData)
  {
  	this.remoteEvents[domId]=eventData;
  	
		/*if(!this.eventIdToDomId[eventData.event_id])
		{
			this.eventIdToDomId[eventData.event_id]=[];
		}				
		this.eventIdToDomId[eventData.event_id].push(domId);*/
		
  },
  
  getEventDomElements : function(id)
  {
  	return GO.util.clone(this.domIds[id]);
  },
  
  getRelatedDomElements : function(eventDomId)
  {
  	var eventData = this.remoteEvents[eventDomId];
  	
  	if(!eventData)
  	{
  		return false;
  	}
  	var domElements = this.getEventDomElements(eventData.id);
  	
  	if(!domElements)
  	{
  		domElements = [eventDomId];
  	}
  	return domElements;
  },
  
  elementToEvent : function(elementId, allDay)
	{
		this.remoteEvents[elementId]['domId']=elementId;
		return this.remoteEvents[elementId];
	}
});


GO.calendar.dd.MonthDragZone = function(el, config) {
    config = config || {};
    Ext.apply(config, {
        ddel: document.createElement('div')
    });
    GO.calendar.dd.MonthDragZone.superclass.constructor.call(this, el, config);
};
 
Ext.extend(GO.calendar.dd.MonthDragZone, Ext.dd.DragZone, {
	onInitDrag: function(e) {
		
		if(!this.monthGrid.writePermission || this.monthGrid.remoteEvents[this.dragData.item.id]['private'])
		{
			return false;
		}else
		{		
	    this.ddel.innerHTML = this.dragData.item.dom.innerHTML;
	    this.ddel.className = this.dragData.item.dom.className;
	    this.ddel.style.width = this.dragData.item.getWidth() + "px";
	    this.proxy.update(this.ddel);
	    
	    this.eventDomElements = this.monthGrid.getRelatedDomElements(this.dragData.item.id);

	    var td = Ext.get(this.dragData.item).findParent('div.cal-monthGrid-cell', 3, true);
	    
	   	//this.proxyCount = eventDomElements.length;
	    this.eventProxies=[];
	    this.proxyDragPos = 0;
	    for(var i=0;i<this.eventDomElements.length;i++)
	    {
	    	this.eventProxies.push(Ext.DomHelper.append(document.body,
			{
				tag: 'div', 
				id: Ext.id(), 
				cls: "x-calGrid-month-event-proxy", 
				style: "width:"+this.ddel.style.width+"px;"				
			},true));
			
	    	if (this.eventDomElements[i]==this.dragData.item.id)
	    	{
	    		this.proxyDragPos=i;
	    	}else
	    	{	 
    	   	//hide event element
    	   	var el = Ext.get(this.eventDomElements[i]);
    	   	if(el)
    	   	{
    	   		el.setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
    	   	}
	    	}	    	   	
	    }
		}
	},
	
	removeEventProxies : function(){
		var proxies = Ext.query('div.x-calGrid-month-event-proxy');
		for (var i=0;i<proxies.length;i++)
		{
			Ext.get(proxies[i]).remove();
		}
		
		delete this.lastTdOverId;		
		
		//unhide event elements
		for(var i=0;i<this.eventDomElements.length;i++)
	  {
	  	var el = Ext.get(this.eventDomElements[i]);
	   	if(el)
	   	{
				el.setStyle({'position' : 'static', 'top': '', 'display':'block'});
	   	}
	  }
	},
	
	afterRepair : function(){
		GO.calendar.dd.MonthDragZone.superclass.afterRepair.call(this);
		
		this.removeEventProxies();
		
	},
	getRepairXY: function(e, data) {
	    data.item.highlight('#e8edff');
	    return data.item.getXY();
	},
  getDragData: function(e) {
  	if(!this.monthGrid.writePermission)
		{
			return false;
		}else
		{
      var target = Ext.get(e.getTarget());
           
      var td = target.parent();
      var dragDate = Date.parseDate(td.id.substr(1),'Ymd');
      
      if(target.hasClass('x-calGrid-month-event-container') && !this.monthGrid.remoteEvents[target.id]['private']) { 
        return {
        	ddel:this.ddel, 
        	item:target,
        	dragDate: dragDate
        	};
      }else
      {
      	return false;
      }
		} 
  }
});


GO.calendar.dd.MonthDropTarget = function(el, config) {
    GO.calendar.dd.MonthDropTarget.superclass.constructor.call(this, el, config);
};
Ext.extend(GO.calendar.dd.MonthDropTarget, Ext.dd.DropTarget, {
    notifyDrop: function(dd, e, data) {
 		
 				if(!this.scope.writePermission)
 				{
 					return false;
 				}else
 				{
			 		var target = Ext.get(e.getTarget()).findParent('div.cal-monthGrid-cell', 3, true);
			 		
			 		data.dropDate = Date.parseDate(target.id.substr(1),'Ymd');
			 		
			 		dd.removeEventProxies();
	 		   	
	        this.el.removeClass(this.overClass);
	        target.appendChild(data.item);
	        
	        if(this.onNotifyDrop)
					{
						if(!this.scope)
						{
							this.scope=this;
						}
						
						var onNotifyDrop = this.onNotifyDrop.createDelegate(this.scope);
						onNotifyDrop.call(this, dd, e, data);
					}
	        return true;
 				}
    },
    
    notifyOver : function(dd, e, data){
        var tdOver = Ext.get(e.getTarget()).findParent('div.cal-monthGrid-cell', 3, true);
        
        if(tdOver)
        {
	        if(dd.lastTdOverId!=tdOver.id)
	        {
	        	var currentTd=tdOver;
	        	for(var i=0;i<dd.proxyDragPos;i++)
	        	{
	        		if(currentTd)
	        		{
		        		var nextTd = currentTd.prev('div.cal-monthGrid-cell');		        		
		        		currentTd = nextTd; 
	        		}	        		
	        		if(nextTd)
	        		{	    
	        			dd.eventProxies[i].insertAfter(nextTd.first());		
	   						dd.eventProxies[i].setStyle({'position' : 'static', 'top': '', 'display':'block'});
	        		}else
	        		{
	        			dd.eventProxies[i].setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
	        		}	    		
	        	}
	        	
	        	dd.eventProxies[i].insertAfter(tdOver.first());	
	        	var currentTd=tdOver;
	        	for(var i=dd.proxyDragPos+1;i<dd.eventProxies.length;i++)
	        	{
	        		if(currentTd)
	        		{
		        		var nextTd = currentTd.next('div.cal-monthGrid-cell');
		        		
		        		currentTd = nextTd;
	        		}
	        		
	        		if(nextTd)
	        		{	     
	        			dd.eventProxies[i].insertAfter(nextTd.first()); 			
	   					dd.eventProxies[i].setStyle({'position' : 'static', 'top': '', 'display':'block'});
	        		}else
	        		{
	        			dd.eventProxies[i].setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
	        		}
	        	}
	        	
	        }
	        
	        dd.lastTdOverId=tdOver.id;
        }
        return this.dropAllowed;
    }
    
    
});