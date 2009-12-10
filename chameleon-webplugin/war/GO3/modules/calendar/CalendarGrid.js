/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: CalendarGrid.js 2112 2009-03-17 13:48:23Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
 


GO.grid.CalendarGrid = Ext.extend(Ext.Panel, {
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
	
	//a map with day and index of the appointments aray. The key is the remote id
	appointmentsMap : {},
	
	//same for allday appointments.
	allDayAppointments : Array(),
	
	allDayAppointmentsMap : [],
	
	//how many rows to display for all day events
	allDayEventRows : 0,
	
	allDayColumns : Array(),
	
	//The remote database ID's can be stored in this array. Useful for database updates
	remoteEvents : Array(),
	
	//An object with the event_id as key and the value is an array with dom id's
	domIds : Array(),
	
	//amount of days to display
	days : 1,
	
	scale : 96,
	
	hourHeight : 40,
	
	loaded : false,
	
	writePermission : false,
	
	 /**
     * The amount of space to reserve for the scrollbar (defaults to 19 pixels)
     * @type Number
     */
    scrollOffset: 19,
    
    selected : Array(),

	// private
    initComponent : function(){
    	
    	this.cls='x-calGrid-panel';

		GO.grid.CalendarGrid.superclass.initComponent.call(this);
	
		this.addEvents({
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
		
		this.rowsPerHour=this.scale/24;
		this.rowHeight = this.hourHeight/this.rowsPerHour;
  },	


	//build the html grid
	doLayout : function(){
		
		GO.grid.CalendarGrid.superclass.doLayout.call(this);
		
		if(this.rendered)
		{
			//important to do here. Don't remember why :S
			this.setDate(this.startDate, this.days, false);
			
			
			//if this is not set the grid does not display well when I put a load mask on it.
			this.body.setStyle("overflow", "hidden");
			
			//Don't select things inside the grid
			this.body.unselectable();
	
			//this.renderDaysGrid();
			if(this.daysGridRendered)
			{
				this.cacheGridCells();
			}
		
			this.setStore(this.store);
		}
	},
	
	renderDaysGrid : function(){
        
    this.daysGridRendered=true;
    this.body.update('');
        
        //get content size of element
		var ctSize = this.container.getSize(true);		
		
		//column width is the container size minus the time column width
		var columnWidth = ((ctSize['width']-40-this.scrollOffset)/this.days);		
		columnWidth = Math.floor(columnWidth);		
        
    //generate table for headings and all day events
    this.headingsTable = Ext.DomHelper.append(this.body,
			{
				tag: 'table', 
				id: Ext.id(), 
				cls: "x-calGrid-headings-table", 
				style: "width:"+(ctSize['width'])+"px;"
				
			},true);
			
		var tbody = Ext.DomHelper.append(this.headingsTable,
			{
				tag: 'tbody'
			}, true); 
		this.headingsRow = Ext.DomHelper.append(tbody,
			{
				tag: 'tr',
				children:{
					tag:'td',
					style:'width:37px',
					cls: "x-calGrid-heading"
				}
			}, true);
			
			
		//create container for the grid
		this.allDayTableContainer = Ext.DomHelper.append(this.body,
				{tag: 'div', cls: "x-calGrid-all-day-table-container"}, true);
			
		this.allDayTable = Ext.DomHelper.append(this.allDayTableContainer,
			{
				tag: 'table', 
				id: Ext.id(), 
				cls: "x-calGrid-all-day-table", 
				style: "width:"+(ctSize['width']-this.scrollOffset)+"px;"
				
			},true);
		var tbody = Ext.DomHelper.append(this.allDayTable,
			{
				tag: 'tbody'
			}, true); 
		this.allDayRow = Ext.DomHelper.append(tbody,
			{
				tag: 'tr',
				children:{
					tag:'td',
					style:'width:40px',
					cls: "x-calGrid-all-day-first-col"
				}
			}, true);
			
		var yearPos = GO.settings.date_format.indexOf('Y');
		var dateFormat = 'D '+GO.settings.date_format.substring(0, yearPos-1);
		
		var now = new Date();
		var nowStr = now.format(dateFormat);
		var dt, dtStr, heading, allDayColumn, cls;	
		
		this.allDayColumns=Array();
		for(var day=0;day<this.days;day++)
		{	
			dt = this.startDate.add(Date.DAY, day);
			
			dtStr = dt.format(dateFormat);
			
			cls = dtStr==nowStr ? 'x-calGrid-heading x-calGrid-heading-today' :  "x-calGrid-heading";
			
			
			//create grid heading
			heading = Ext.DomHelper.append(this.headingsRow,
				{tag: 'td', children:[{tag:'div',cls: cls, style: "width:"+(columnWidth-3)+"px", html: dt.format(dateFormat) }]});	
				
			allDayColumn = Ext.DomHelper.append(this.allDayRow,
				{tag: 'td', id: 'all_day_'+day, cls: "x-calGrid-all-day-container", style: "width:"+(columnWidth-3)+"px;height:0px"}, true);
				
			this.allDayColumns.push(allDayColumn);
		}		

		//for the scrollbar
		Ext.DomHelper.append(this.headingsRow,
				{
					tag: 'td', 
					style: "width:"+(this.scrollOffset)+"px;height:0px",
					cls: "x-calGrid-heading"
				});		
				/*
		Ext.DomHelper.append(this.allDayRow,
				{
					tag: 'td', 
					style: "width:"+(this.scrollOffset)+"px;height:0px", 
					cls: "x-calGrid-all-day-container"
				});	*/
		
		//create container for the grid
		this.gridContainer = Ext.DomHelper.append(this.body,
				{tag: 'div', cls: "x-calGrid-grid-container"}, true);

		//calculate gridContainer size
		var headingsHeight = this.headingsTable.getHeight();

		//var gridContainerHeight = ctSize['height']-headingsHeight;

		//this.gridContainer.setSize(ctSize['width'],gridContainerHeight );

		this.gridTable = Ext.DomHelper.append(this.gridContainer,
			{
				tag: 'table', 
				id: Ext.id(), 
				cls: "x-calGrid-table", 
				style: "width:"+ctSize['width']-this.scrollWidth+"px;"
				
			},true);			
		
		this.tbody = Ext.DomHelper.append(this.gridTable,
			{
				tag: 'tbody'
			}, true); 
		
		this.gridTable.on("mousedown", this.startSelection, this);//, {delay:250});		
		
		//create an overlay to track the mousemovement
		this.gridContainer.on("mousemove", this.onEventDragMouseMove, this);			   
		this.body.on("mouseup", this.onEventDragMouseUp, this);
		this.allDayTable.on("mousemove", this.onAllDayEventDragMouseMove, this);	
		this.body.on("mouseup", this.onAllDayEventDragMouseUp, this);
		
		var gridRow =  Ext.DomHelper.append(this.tbody,
		{
			tag: 'tr'
		});
		
		var timeCol = Ext.DomHelper.append(gridRow,
			{tag: 'td', style: 'width:40px'}, true);
	
		var timeFormat;

		for (var i = 0;i<this.scale;i+=this.rowsPerHour)
		{	
			timeformat = GO.settings.time_format.substr(0,1)=='G' ? 'G:i' : 'g a';
				Ext.DomHelper.append(timeCol,
					{tag: 'div', id: 'head'+i, cls: "x-calGrid-timeHead", html: Date.parseDate(i/this.rowsPerHour, "G").format(timeformat), style: 'width:40px;height:'+(((this.rowHeight+1)*this.rowsPerHour)-1)+'px'}, true);
		}
		
		this.gridCells=[];
		
		var dayColumn, className, cell;
		
		for(var day=0;day<this.days;day++)
		{	
			//create array to cache all grid cells later
			this.gridCells[day]=[];
			
			dayColumn = Ext.DomHelper.append(gridRow,
				{tag: 'td', id: 'dayCol'+day, style:'width:'+columnWidth+'px'}, true);
		

			className = "x-calGrid-hourRow";		
	
			var hourCounter=0;
			for (var i = 0;i<this.scale;i++)
			{
				if(hourCounter==0)
				{
					className= "x-calGrid-hourRow";
				}else if(this.rowsPerHour/hourCounter==2)
				{					
					className = "x-calGrid-halfhourRow";
				}else
				{
					className = "x-calGrid-blankRow";
				}
				
				cell = Ext.DomHelper.append(dayColumn,
					{tag: 'div', id: 'day'+day+'_row'+i, cls: className, style: 'height:'+this.rowHeight+'px'}, true);
				
				this.gridCells[day].push(cell);		
				
				hourCounter++;
				if(hourCounter==this.rowsPerHour)
				{
					hourCounter=0;
				}
			}	
		}	

		//the start of the grid
		//var position = FirstCol.getXY();
		this.gridX = 0;
		this.gridY = 0;
		
		//save scroll postion because it get's lost when you switch tabs
		this.gridContainer.on('scroll', this.storeScrollPosition,this);
		
		this.daysRendered=this.days;		
		
		//create the selection proxy
		this.selector = Ext.DomHelper.append(this.body,
				{tag: 'div', id: Ext.id(), cls: "x-calGrid-selector"}, true);			
	
		this.cacheGridCells();		
		this.gridTableHeight = this.gridTable.getHeight();		
  },
    
	cacheGridCells : function(){
 		this.gridTable.xy = this.gridTable.getXY();   	
  	var columnsContainerY = this.gridTable.getY();
  	
  	var cellSize = this.gridCells[0][0].getSize();
  	var FirstCellPosition=this.gridCells[0][0].getXY();
  	
  	var x = FirstCellPosition[0];
  	var y = FirstCellPosition[1]-columnsContainerY;
  	
    for(var day=0;day<this.days;day++)
		{	
			//var currentX = x+(day*(cellSize['width']-0.5));
			var currentX = x+(day*cellSize['width']);
			for (var i = 0;i<this.scale;i++)
			{	
				var currentY = y+(i*cellSize['height']);
				
				if(this.gridCells[day])
				{
					this.gridCells[day][i].xy=[currentX, currentY];
					this.gridCells[day][i].size=cellSize;
				}else
				{
					//should never come here
					alert('error');
				}
			}
		}
		
		var FirstCol = this.gridCells[0][0];
		this.snapCol = {'x':FirstCol['size']['width'], 'y': FirstCol['size']['height']};
  },

	autoSizeGrid : function() {
		//calculate gridContainer size
		
		var ownerHeight = this.ownerCt.body.getHeight();
		
		var headingsHeight = this.headingsTable.getHeight();
		var allDayHeight = this.allDayTableContainer.getHeight();		
		
		if(allDayHeight>(ownerHeight/2))
		{
			allDayHeight=ownerHeight/2;
			this.allDayTableContainer.setHeight(allDayHeight);	
		}
		
		var gridContainerHeight = ownerHeight-headingsHeight-allDayHeight-2;		
		this.gridContainer.setHeight(gridContainerHeight);
	},

  onResize : function(adjWidth, adjHeight, rawWidth, rawHeight){
      //Ext.grid.GridPanel.superclass.onResize.apply(this, arguments);

		if(this.daysRendered==this.days)
		{
  		if(this.loaded)
  		{
  			this.store.reload();
  		}
		}	
 },
	
	setStore : function(store, initial){
    if(!initial && this.store){
    	this.store.un("beforeload", this.mask, this);	
      this.store.un("datachanged", this.reload);
    }
    if(store){
    	store.on("beforeload", this.mask, this);
        store.on("datachanged", this.reload, this);
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
		
		var offset = this.firstWeekday-weekday;
		if(offset>0)
		{
			offset-=7;
		}
		return date.add(Date.DAY, offset);
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
		
	getSnap : function()
	{
		return this.snapCol;
	},
	
	getGridXY : function()
	{
		var FirstCol = Ext.get("day0_row0");
		
		return FirstCol.getXY();		
	},
	
	getRowIdByXY : function(x,y)
	{
		var snap = this.getSnap();
	
		var day = (x-this.gridX)/snap["x"];
		var row = (y-this.gridY)/snap["y"];
		return 'day'+day+'_row'+row;
		
	},
	getRowNumberByY : function(y)
	{
		var snap = this.getSnap();
		
		var gridPosition = this.gridTable.getXY();
		
		return Math.floor((y-gridPosition[1])/snap["y"]);	
	},
	getDayByX : function(x)
	{
		var snap = this.getSnap();
		var gridPosition = this.gridTable.getXY();
		
		return Math.floor((x-gridPosition[0]-40)/snap["x"]);
	},
	startSelection : function (e){
		//check if we are not dragging an event
		if(this.writePermission && !this.dragEvent)
		{
			var coords = e.getXY();
			
			this.clickedDay = this.getDayByX(coords[0]);
			this.clickedRow = this.getRowNumberByY(coords[1]);
			
			this.dragSnap = this.getSnap(); 
			
			//get position of the row the user clicked on
			this.selectorStartRow = this.gridCells[this.clickedDay][this.clickedRow];
			
			if(this.selectorStartRow)
			{
				
				var columnsContainerY = this.gridTable.getY();
				var position = [this.selectorStartRow.xy[0],this.selectorStartRow.xy[1]+columnsContainerY];

				
				//create an overlay to track the mousemovement
				if(!this.overlay){
			    this.overlay = this.body.createProxy({tag: "div", cls: "x-resizable-overlay", html: "&#160;"});
			    this.overlay.unselectable();
			    this.overlay.enableDisplayMode("block");	
			    this.overlay.on("mousemove", this.onSelectionMouseMove, this);
					this.overlay.on("mouseup", this.onSelectionMouseUp, this);	    
				}				
				    
				this.overlay.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
				this.overlay.show();
				
				this.selector.setXY(position);
				//substract double border
				this.selector.setSize(this.snapCol['x']-3, this.snapCol['y']);
				this.selector.setVisible(true,false);
			}
		}
	},	
	onSelectionMouseMove : function (e){
		
		//update the selector proxy
		var eventPos = e.getXY();				
		var shadowPos = this.selector.getXY();		
		//var height = this.selector.getHeight();		
		var increment = this.snap(eventPos[1]-shadowPos[1],this.dragSnap["y"], 0);
		this.selector.setHeight(increment);		
	
	},	
	
	onSelectionMouseUp : function (e){
		//hide the overlay		
		this.overlay.hide();
		
		this.fireEvent("create", this, this.domToTimes(this.selector.id));
		this.clearSelection();
	
	},
	
	getDayIndex : function (unixtime)
	{
		
	},

	addDaysGridEvent : function (eventData, recalculateAppointments)
	{	
		//the start of the day the event starts
		var eventStartDay = Date.parseDate(eventData.startDate.format('Ymd'),'Ymd');
		var eventEndDay = Date.parseDate(eventData.endDate.format('Ymd'),'Ymd');
		
		//get unix timestamps
		var gridStartTime = this.startDate.format('U');		
		var eventStartTime = eventStartDay.format('U');
		
		//ceil required because of DST changes!
		var day, originalDay, endDay, originalEndDay;
		day = originalDay= Math.round((eventStartTime-gridStartTime)/86400);
		
		if(day<0)
			day=0;
		
		var eventEndTime = eventEndDay.format('U');
		endDay = originalEndDay = Math.round((eventEndTime-gridStartTime)/86400);
		
		if(endDay>this.days)
			endDay=this.days-1;

		if(day<this.days && endDay> -1)
		{			
			var startRow = eventData.startDate.getHours()*this.rowsPerHour;
			var endRow = eventData.endDate.getHours()*this.rowsPerHour-1;
			
			var gridPrecision = 60/this.rowsPerHour;
			var startMin = eventData.startDate.getMinutes();
			startRow += Math.ceil(startMin/gridPrecision);
			
			var endMin = eventData.endDate.getMinutes();
			endRow += Math.ceil(endMin/gridPrecision);
						
			if(endRow<startRow)
			{
				endRow=startRow;
			}	

			if(startRow && endRow && (originalDay==originalEndDay))
			{				
				return this.addGridEvent(eventData, day, startRow, endRow, recalculateAppointments);
			}else
			{				
				return this.addAllDayEvent(eventData, day, endDay);
			}
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
	
	clearEventSelection : function()
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
			this.clearEventSelection();
			
			var elements = this.getRelatedDomElements(eventEl.id);
			
			for (var i=0;i<elements.length;i++)
			{			
				var element = Ext.get(elements[i]);
				element.addClass('x-calGrid-selected');
				this.selected.push(element);
			}			
		}
	},
	
	removeEvent : function(domId){
	
		if(this.appointmentsMap[domId] && this.appointments[this.appointmentsMap[domId].day])
		{
			var day = this.appointmentsMap[domId].day;
			var newAppointments = [];
			for(var i=0;i<this.appointments[day].length;i++)
			{
				if(this.appointments[day][i].id!=domId)
				{
					newAppointments.push(this.appointments[day][i]);
				}
			}			
			this.appointments[day]=newAppointments;
			
		}else if(this.allDayAppointmentsMap[domId] && this.appointments[this.allDayAppointmentsMap[domId].day])
		{		
			var day = this.allDayAppointmentsMap[domId];
			var newAppointments = [];
			for(var i=0;i<this.appointments[day].length;i++)
			{
				if(this.appointments[day][i].id!=domId)
				{
					newAppointments.push(this.appointments[day][i]);
				}
			}			
			this.allDayAppointmentsMap[day]=newAppointments;
		}		
				
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
		
		if(day)
		{
			this.calculateAppointments(day);
		}		
	},
	
	unregisterDomId : function(domId)
	{
		delete this.remoteEvents[domId];
		delete this.appointmentsMap[domId];
		
		var found =false;
		
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
	
	addAllDayEvent : function (eventData, startDay, endDay)
	{		
		eventData.allDay=true;
		eventData.daySpan = endDay-startDay+1;
		
		//allday event
		//var daySpan = endDay-startDay+1;
		if(startDay < 0)
		{
			startDay=0;
		}		
		
		if(endDay > this.days-1)
		{
			endDay=this.days-1;
		}
		
		//var allDayColumn = Ext.get("all_day_"+startDay);
		//var size = allDayColumn.getSize();
		
		var snap = this.getSnap();		
		
		if(startDay!=endDay)
		{
			var format = GO.settings.date_format+' '+GO.settings.time_format;
			text = eventData.startDate.format(format)+'&nbsp;'+eventData.name;
		}else
		{
			text=eventData.name;
		}
		
		var daySpan = endDay-startDay;
			
		var count=0;
		for (var i=startDay;i<=endDay;i++)
		{
			
			var domId = Ext.id();
			this.registerEvent(domId, eventData);
			
			if(daySpan>0)
			{
				if(!this.domIds[eventData.id])
				{
					this.domIds[eventData.id]=[];
				}				
				this.domIds[eventData.id].push(domId);
			}
			
			
			var event = Ext.DomHelper.append(this.allDayColumns[i],
				{
					tag: 'div', 
					id: domId, 
					cls: "x-calGrid-all-day-event-container", 
					style:"background-color:#"+eventData.background,
					html: text , 
					qtip: GO.calendar.formatQtip(eventData),
					qtitle:eventData.name
				}, true);
			
			//add the event to the appointments array		
			if(typeof(this.allDayAppointments[i])=='undefined')
			{
				this.allDayAppointments[i]=Array();
			}
			this.allDayAppointments[i].push(event);
			this.allDayAppointmentsMap[domId]=i;
		
			
			//add events
			
			event.on('mousedown', function(e, eventEl){				
				eventEl = Ext.get(eventEl).findParent('div.x-calGrid-all-day-event-container', 2, true);					
			
				this.selectEventElement(eventEl);	
				
				this.clickedEventId=eventEl.id;
				this.eventMouseUp=false;
				this.startAllDayEventDrag(e, eventEl.id);
	
			}, this);
			
			event.on('dblclick', function(e, eventEl){

				var actionData = {}; 
				
				//do last because orginal times will be lost after this.
				var event = this.elementToEvent(this.clickedEventId);
				
				if(this.remoteEvents[this.clickedEventId]['repeats'] && this.writePermission)
				{
					this.handleRecurringEvent("eventDblClick", event, actionData);
				}else
				{
					this.fireEvent("eventDblClick", this, event, actionData);
				}				
			}, this);	
			
			event.on('mouseup', function(){
				this.eventMouseUp=true;
			}, this);	
		}
		
		return domId;
	},
	
	
	addGridEvent : function (eventData, day, startRow, endRow, recalculateAppointments)
	{		
		var text = '<span class="x-calGrid-event-time">'+eventData.startDate.format(GO.settings.time_format)+"</span>&nbsp;"+eventData.name;
		
		if(eventData.location!='')
		{
			text += ' @ '+eventData.location;
		}
		
		var domId = Ext.id();		
		this.registerEvent(domId, eventData);		
		
		var snap = this.getSnap();		
		
		if(endRow>(this.scale-1))
		{
			endRow=this.scale-1;
		}
		var event = this.gridContainer.insertFirst(
			{
				tag: 'div', 
				id: domId, 
				cls: "x-calGrid-event-container",		
				style:"background-color:#"+eventData.background,	 
				qtip: GO.calendar.formatQtip(eventData),
				qtitle:eventData.name,
				html:text
			});
			

		event.repeats=eventData.repeats;
			
		var startRowEl = Ext.get("day"+day+"_row"+startRow);
		var endRowEl = Ext.get("day"+day+"_row"+endRow);
		
		var startRowPos = startRowEl.getXY();
		var endRowPos = endRowEl.getXY();
		
		// var height = endRowPos[1]-startRowPos[1]+snap["y"]+3;		
		var height = endRowPos[1]-startRowPos[1]+snap["y"];
		
	
		event.setXY(startRowPos);
		event.setSize(snap["x"]-2, height);
		
		event.on('mousedown', function(e, eventEl){
		
			eventEl = Ext.get(eventEl).findParent('div.x-calGrid-event-container', 4, true);
				
			this.selectEventElement(eventEl);			
			
			this.clickedEventId=eventEl.id;
			this.eventMouseUp=false;
			this.startEventDrag(e, eventEl.id);
		}, this);
		

		event.on('dblclick', function(e, eventEl){			
			var actionData = {}; 
				
			//do last because orginal times will be lost after this.
			var event = this.elementToEvent(this.clickedEventId);
			
			if(this.remoteEvents[this.clickedEventId]['repeats'] && this.writePermission)
			{
				this.handleRecurringEvent("eventDblClick", event, actionData);
			}else
			{
				this.fireEvent("eventDblClick", this, event, actionData);
			}			
		}, this);
		
		event.on('mouseup', function(){
			this.eventMouseUp=true;
		}, this);
			
		//add the event to the appointments array		
		if(typeof(this.appointments[day])=='undefined')
		{
			this.appointments[day]=Array();
		}
	
		//add it to the appointments of this day for calculation
		
		this.appointments[day].push(event);
		this.appointmentsMap[domId]={day: day};
		
		if(this.writePermission && !eventData['private'])
		{
			var resizer = new Ext.Resizable(event, {
					    handles: 's',
					    //minWidth: event.getWidth(),
					    minHeight: snap["y"],
					    maxWidth: event.getWidth(),
					    //maxHeight: this.snapY*48,
					    heightIncrement: snap["y"],
					    draggable: false,
					    pinned: true
					});
				
			resizer.on('resize', function(eventEl, adjWidth, adjHeight, rawWidth, rawHeight){	
				if(adjHeight>0)
				{					
					var times = this.domToTimes(eventEl.el.id, false);
					
					var newStartTime = times.startDate.format('U');
					var newEndTime = times.endDate.format('U');					
					
					var actionData = {duration : newEndTime-newStartTime, dragDate: this.remoteEvents[eventEl.el.id].startDate}; 
					
					//do last because orginal times will be lost after this.
					var event = this.elementToEvent(eventEl.el.id);
					
					var elX = eventEl.el.getX();	
					this.clickedDay = this.getDayByX(elX);
					
					if(this.remoteEvents[eventEl.el.id]['repeats'])
					{
						event.day = this.clickedDay;
						this.handleRecurringEvent("eventResize", event, actionData);
					}else
					{
						this.resizeAppointment(eventEl.el.id, this.clickedDay);					
						this.fireEvent("eventResize", this, event, actionData);
					}
				}				
			}, this);
		}
		
		if(recalculateAppointments)
		{
			this.calculateAppointments(day);
		}
		
		return domId;
	},
	
	resizeAppointment : function(event_dom_id, day){
		var i = this.findAppointment(day, event_dom_id);
		this.appointments[day][i].size=this.appointments[day][i].getSize();
		
		this.remoteEvents[event_dom_id].repeats=false;	
		this.calculateAppointments(day);		
	},

	calculateAppointments :  function (day)
	{
		if(typeof(this.appointments[day])!='undefined')
		{
			var snap = this.getSnap();
			
			//used to calculate Y coordinate of events on the gridcontainer
			var columnsContainerY = this.gridTable.getY();
			
			//determine the maximum appointments on one row
			var maxPositions=0;
			
			//store overlaps per event in this array
			//var overlaps = Array();
			var positions = Array();
			var maxPositions = 0;			
			
			//sort the appointments on their start time (Y pos)
			this.appointments[day].sort(function(a,b){
				return a.getY()-b.getY();
			});
			
			//the left coordinate of the day column
			var dayColumnLeft=0;
			
			//create an array of rows with their positions
			this.rows=Array();

			for(var rowId=0;rowId<this.scale;rowId++)
			{
				//cached rows
				var row = this.gridCells[day][rowId];
				var rowY = row.xy[1];
								
				if(rowId==0)
				{
					//add 1 px for border
					dayColumnLeft=row.xy[0];
				}
				
				if(typeof(this.rows[rowId]) == 'undefined')
				{
					this.rows[rowId]=Array();
				}
				
				//check how many appointments are in the row area
				for(var i=0;i<this.appointments[day].length;i++)
				{										
					if(!this.appointments[day][i].xy)
					{
						this.appointments[day][i].xy=this.appointments[day][i].getXY();
						this.appointments[day][i].xy[1]-=columnsContainerY;
					}
					
					if(!this.appointments[day][i].size)
					{
						this.appointments[day][i].size=this.appointments[day][i].getSize();
					}
										
					var eventPosition = this.appointments[day][i].xy;
					var appointmentsize = this.appointments[day][i].size;
					
					//new right side is right from existing left side and 
					//new left side is left from existing right side
					
					//and
					
					//new top is above the existing bottom and 
					//new bottom is below the existing top
					
					if((
						row.xy[0]+row.size['width'])>=eventPosition[0] && 
						row.xy[0]<=eventPosition[0]+appointmentsize['width'] && 
						rowY+row.size['height']<=eventPosition[1]+appointmentsize['height'] && 
						rowY+row.size['height']>eventPosition[1])
					{
						if(typeof(positions[this.appointments[day][i].id])=='undefined')
						{
							//determine the create_exception: true,event's position
							var position=0;
						
							//find a free position
							while(typeof(this.rows[rowId][position])!='undefined')
							{
								position++;											
							}
							
							//set the space occupied
							eventRowId=rowId;
							for(var n=rowY;n<eventPosition[1]+appointmentsize['height']-3;n+=snap["y"])
							{						
								if(typeof(this.rows[eventRowId]) == 'undefined')
								{
									this.rows[eventRowId]=Array();
								}
								this.rows[eventRowId][position]=this.appointments[day][i].id;
								eventRowId++;
							}
							
							this.rows[rowId][position]=this.appointments[day][i].id;
												
							positions[this.appointments[day][i].id]=position;					
						}											
					}							
				}
				
				//update the max appointments on row per day value	
				if(position>maxPositions)
				{
					maxPositions=position;
				}							
			}			
			//we got the maximum number of appointments on one row now.
			//we know for each appointments how many overlaps they have
			//we now need to know the widths of each event
			
			var posWidth = snap["x"]/(maxPositions+1);

			for(var i=0;i<this.appointments[day].length;i++)
			{
				
				if(!this.appointments[day][i].xy)
				{
					this.appointments[day][i].xy=this.appointments[day][i].getXY();
					this.appointments[day][i].xy[1]-=columnsContainerY;
				}
				
				if(!this.appointments[day][i].size)
				{
					this.appointments[day][i].size=this.appointments[day][i].getSize();
				}
				
				var eventPosition = this.appointments[day][i].xy;
				var appointmentsize = this.appointments[day][i].size;

				var rowId = Math.floor(eventPosition[1]/snap["y"]);
				var eventRows=(appointmentsize['height']-2)/snap["y"];
				
				var eventWidth = this.getEventWidth(
					positions[this.appointments[day][i].id],
					maxPositions,
					rowId,
					eventRows,
					posWidth);
				
				this.appointments[day][i].setWidth(eventWidth);
				
				var offset = positions[this.appointments[day][i].id]*posWidth;
				this.appointments[day][i].setX(dayColumnLeft+offset);
			}
		}
	},
	
	getEventWidth : function(startPosition, maxPositions, startRowId, eventRows, posWidth)
	{
		var eventWidth = posWidth;
				
		var rowPosition = startPosition+1;
		while(rowPosition<=maxPositions)
		{			
			for(var r=0;r<eventRows;r++)
			{
				if(typeof(this.rows[startRowId+r][rowPosition])!='undefined')
				{					
					return eventWidth-2;
				}
			}
			eventWidth+=posWidth;
			rowPosition++;
		}
		return eventWidth-2;
	},
	
	inAppointmentsArray : function (id, appointments)
	{
		for(var i=0;i<appointments.length;i++)
		{
			if(appointments[i].id==id)
			{
				return true;
			}
		}
		return false;
	},
	
	clearSelection : function()
	{			
		this.selector.setVisible(false);
	},
	
	handleRecurringEvent : function(fireEvent, event, actionData){
		
		//store them here so the already created window can use these values
		this.currentRecurringEvent = event;
		this.currentFireEvent=fireEvent;
		this.currentActionData=actionData;
		
		if(!this.recurrenceDialog)
		{
			this.recurrenceDialog = new Ext.Window({				
				width:400,
				autoHeight:true,
				closeable:false,
				closeAction:'hide',
				plain:true,
				border: false,
				closable:false,
				title:GO.calendar.lang.recurringEvent,
				modal:false,
				html: GO.calendar.lang.editRecurringEvent,
				buttons: [{
						text: GO.calendar.lang.singleOccurence,
						handler: function(){
							this.currentActionData.singleInstance=true;
							this.fireEvent(this.currentFireEvent, this, this.currentRecurringEvent , this.currentActionData);
							if(!this.currentRecurringEvent.allDay)
							{
								if(this.currentFireEvent=="eventResize")
								{
									this.resizeAppointment(this.currentRecurringEvent.domId, this.currentRecurringEvent.day);
								}else if(this.currentFireEvent=='move')
								{	
									this.moveAppointment(this.currentRecurringEvent.domId, this.currentRecurringEvent.oldPos, this.currentRecurringEvent.newPos);
								}
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
	
	snapPos : function(oldPos, newPos, snap){
		
		var inc = newPos-oldPos;	
		
		var snaps = Math.floor(inc/snap);
		
		var leftOver = inc-(snaps*snap);		
	
		var m = snap/2;
		if(leftOver>m)
		{
			snaps++;
		}	
		return oldPos+(snaps*snap);
	},	
	
  snap : function(value, inc, min){
    if(!inc || !value) return value;
    var newValue = value;
    var m = value % inc;
    if(m > 0){
        if(m > (inc/2)){
            newValue = value + (inc-m);
        }else{
            newValue = value - m;
        }
    }
    return Math.max(min, newValue);
  },
    
  clearGrid : function()
	{
		this.allDayAppointmentsMap={};
		this.appointmentsMap={};
		
		this.appointments={};		
		this.allDayAppointments=Array();
		this.remoteEvents=Array();
		this.domIds=Array();
	},
	
  next : function(days)
  {
  	if(!days)
  	{
  		days = this.days;
  	}
  	this.setDate(this.startDate.add(Date.DAY, days));
  },
    
  setDays : function(days, load)
	{
		this.setDate(this.configuredDate, days, load);		
	},

  setDate : function(date, days, load)
  {  	
  	var oldStartDate = this.startDate;
  	var oldEndDate = this.endDate;
  	
  	if(days)
  	{
  		this.days=days;	
  	}
  	
  	this.configuredDate = date;
    
  	if(this.days>4)
  	{
  		this.startDate = this.getFirstDateOfWeek(date);
  	}else
  	{
  		this.startDate = date;
  	}
	    	
    this.endDate = this.startDate.add(Date.DAY, this.days);
  	this.setStoreBaseParams();
  	
  	if(load)
  	{
    	//if(!oldEndDate || !oldStartDate || oldEndDate.getElapsed(this.endDate)!=0 || oldStartDate.getElapsed(this.startDate)!=0)    	
    	//{    			     		
	    	this.store.reload();    			    	
    	//}
  	} 
  },
  
  reload : function()
  {
  	this.load();  	
  },    
    
  load : function()
  {
		var records = this.store.getRange();
		
		this.writePermission = this.store.reader.jsonData.write_permission;

		this.clearGrid();
		
		this.renderDaysGrid();
  	

    for(var i = 0, len = records.length; i < len; i++){
      var startDate = Date.parseDate(records[i].data['start_time'], this.dateTimeFormat);
			var endDate = Date.parseDate(records[i].data['end_time'], this.dateTimeFormat);
			
			var eventData = records[i].data;
			eventData['startDate']=startDate;
			eventData['endDate']=endDate;
	
			this.addDaysGridEvent(eventData);
    }
    
    this.autoSizeGrid();
    this.scrollToLastPosition();
    
    
    for(var i=0;i<this.days;i++)
		{		 	
    	this.calculateAppointments(i);
    }
		this.unmask();		
		this.loaded=true;   
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
  	
  	/*if(!this.domIds[eventData.event_id])
		{
			this.domIds[eventData.event_id]=[];
		}
	
		this.domIds[eventData.event_id].push(domId);*/
  },
  
  setNewEventId : function(domId, new_event_id){
	
		this.remoteEvents[domId].event_id=new_event_id;	
  },
  
  getEventDomElements : function(event_id)
  {
  	return GO.util.clone(this.domIds[event_id]);
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
		var time = this.domToTimes(elementId, allDay);
		this.remoteEvents[elementId]['domId']=elementId;
		this.remoteEvents[elementId]['startDate'] = time.startDate;
		this.remoteEvents[elementId]['endDate'] = time.endDate;
	
		return this.remoteEvents[elementId];
	},
	
	domToTimes : function(domId, allDay)
	{
		if(!allDay)
		{
			allDay=false;
		}		

		var el = Ext.get(domId);
		if(!el)
		{
			return false;
		}
		
		var position=el.getXY();		
		
		if(!allDay)
		{
			var size = el.getSize();
			
			var startRow = this.getRowNumberByY(position[1]);
			if(startRow<0)
			{
				startRow=0;
			}				
			var endRow = this.getRowNumberByY(position[1]+size['height']);
			if(endRow<=startRow)
			{
				endRow=startRow+1;
			}
		}else
		{
			startRow=0;
			endRow=0;
		}
		
		var day = this.getDayByX(position[0]);

		var date = this.startDate.add(Date.DAY, day);
		
		var gridPrecision = 60/this.rowsPerHour;

		var startDate = date.add(Date.MINUTE,startRow*gridPrecision);
		var endDate = date.add(Date.MINUTE,endRow*gridPrecision);
				
		return { 'startDate': startDate, 'endDate':endDate, 'day':day};	
	},
	
	scrollToRow : function(row)
	{
		var snap = this.getSnap();
		if(!snap)
		{
			return false;
		}
		this.gridContainer.scrollTo("top", snap['y']*row);
	},

	scrollToLastPosition : function(){
    	
    	if(this.gridContainer)
    	{
    		if(this.scrollPosition && this.scrollPosition['top']>0)
    		{
    			this.gridContainer.scrollTo('top', this.scrollPosition['top']);
    		}else
    		{
    			//scroll to 7am
    			this.scrollToRow(7*this.rowsPerHour);
    		}	
    	}
    },
	storeScrollPosition : function(e,container){
		var scrollPos = Ext.get(container).getScroll();
		if(scrollPos['top']>0)
		{
			this.scrollPosition=Ext.get(container).getScroll();
		}
	},
	onShow : function(){
		GO.grid.CalendarGrid.superclass.onShow.call(this);
		
		this.scrollToLastPosition();		
	},

  startEventDrag : function(e, eventId) {
		//don't start dragging when a doubleclick is recorded
		if(this.writePermission && !this.eventMouseUp)
		{		
			this.dragClickEventPosition=e.getXY();
			
			this.originalEvent = this.elementToEvent(eventId);
			if(!this.originalEvent['private'])
			{
				
				this.dragEvent= Ext.get(eventId);
				this.dragEvent.size=this.dragEvent.getSize();
				this.dragappointmentstartPos=this.dragEvent.getXY();
				this.dragXoffset = this.dragClickEventPosition[0]-this.dragappointmentstartPos[0];
				this.dragYoffset = this.dragClickEventPosition[1]-this.dragappointmentstartPos[1];
				
				this.lastDragX = this.dragappointmentstartPos[0];
				this.lastDragY = this.dragappointmentstartPos[1];
			
				this.dragSnap = this.getSnap();
				
				this.columnsContainerY = this.gridTable.getY();
			}
		}		
	},

	
	onEventDragMouseMove : function (e){
		
		//if(!this.eventMouseUp)
		if(this.dragEvent)
		{
			//update the selector proxy
			var mouseEventPos = e.getXY();				
	
			
			//adjust with offsets so event will not jump to mouse position
			var x = this.snapPos(this.dragappointmentstartPos[0],mouseEventPos[0]-this.dragXoffset,this.dragSnap["x"],this.days);
			var y = this.snapPos(this.dragappointmentstartPos[1],mouseEventPos[1]-this.dragYoffset,this.dragSnap["y"],this.scale);
			
			//var gridRight = (this.gridX+this.days*this.dragSnap["x"]);
			//var gridBottom = (this.gridY+48*this.dragSnap["y"]);

			var gridTop = this.columnsContainerY-4;
			var gridLeft = this.gridCells[0][0].xy[0]-4;
			var gridBottom= this.columnsContainerY+this.gridTableHeight-this.dragEvent.size['height']+5;
			var gridRight=this.gridCells[this.days-1][47].xy[0]+4;
			
			//gridBottomRight[0]=gridBottomRight[0]+this.gridCells[this.days-1][47].size['width'];
		//	gridBottomRight[1]=gridBottomRight[1]+this.gridCells[this.days-1][47].size['height'];
	
			//this.dragEvent.update(x+' = '+this.dragappointmentstartPos[0]);
			if(x != this.lastDragX  && x<gridRight && x>gridLeft)
			{
			  this.lastDragX=x;
				this.dragEvent.setX(x);
			}
	
			
			if(y != this.lastDragY && y<gridBottom && y>gridTop)
			{
			  this.lastDragY=y;
				this.dragEvent.setY(y);
			}
	
			//this.dragEvent.setXY([x, y]);	
			//this.dragEvent.dom.innerHTML = "X:"+x+" Y:"+y+" TopLeft: "+gridLeft+","+gridTop+" BottomRight:"+gridRight+","+gridBottom;
		}
	},	
	onEventDragMouseUp : function (e){
		
		//unset the drag stuff
		
		if(this.dragEvent)
		{			
			var newPos = this.dragEvent.getXY();			
			
			if(newPos[0] != this.dragappointmentstartPos[0] || newPos[1] != this.dragappointmentstartPos[1])
			{			
				var times = this.domToTimes(this.dragEvent.id, false);
				
				var dropTime = times.startDate.format('U');
				var dragTime = this.remoteEvents[this.dragEvent.id].startDate.format('U');
				
				var actionData = {offset : dropTime-dragTime, dragDate: this.remoteEvents[this.dragEvent.id].startDate}; 
				
				//do last because orginal times will be lost after this.
				var event = this.elementToEvent(this.dragEvent.id);
				
				var element = Ext.get(this.dragEvent.id);
				var timeEl = element.select('span.x-calGrid-event-time');
				if(timeEl)
				{
					timeEl.update(event.startDate.format(GO.settings.time_format));
					element.set({'ext:qtip': GO.calendar.formatQtip(event)});
				}
				
				if(this.remoteEvents[this.dragEvent.id]['repeats'])
				{
					event['oldPos']=this.dragappointmentstartPos;
					event['newPos']=newPos;
					this.handleRecurringEvent("move", event, actionData);
				}else
				{
					this.moveAppointment(this.dragEvent.id, this.dragappointmentstartPos, newPos);
					this.fireEvent("move", this, event, actionData);
				}
			}
			
			this.dragEvent=false;
		}
	},
	
	
	findAppointment : function(day, event_id)
	{
		for(var i=0;i<this.appointments[day].length;i++)
		{
			if(this.appointments[day][i].id==event_id)
			{
				return i;
			}
		}
	},
	
	moveAppointment : function (event_dom_id, oldPos, newPos)
	{
		
		var oldDay = this.getDayByX(oldPos[0]);
		var newDay = this.getDayByX(newPos[0]);
		
		var columnsContainerY = this.gridTable.getY();

		var i = this.findAppointment(oldDay, event_dom_id);
		
		this.appointments[oldDay][i].xy=newPos;
		this.appointments[oldDay][i].xy[1]-=columnsContainerY;
		this.appointments[oldDay][i].size=this.appointments[oldDay][i].getSize();
		
		this.remoteEvents[event_dom_id].repeats=false;
		
		if(oldDay!=newDay)
		{
			if(!this.appointments[newDay])
			{
				this.appointments[newDay]=[];
			}
			
			this.appointments[newDay].push(this.appointments[oldDay][i]);
			this.appointments[oldDay].splice(i,1);	
			this.calculateAppointments(oldDay);
			this.calculateAppointments(newDay);
		}else
		{
			this.calculateAppointments(newDay);
		}
	},	
	
	startAllDayEventDrag : function(e, eventId) {
		//don't start dragging when a doubleclick is recorded
		if(!this.eventMouseUp && this.writePermission)
		{		
			this.dragClickEventPosition=e.getXY();			 
			
			this.originalEvent = this.elementToEvent(eventId, true);
			this.allDayDragDate = this.originalEvent.startDate;
			
			if(!this.originalEvent['private'])
			{			
				this.allDayDragEvent= Ext.get(eventId);
				this.allDayDragEvent.size=this.allDayDragEvent.getSize();
				this.dragappointmentstartPos=this.allDayDragEvent.getXY();
				this.currentDragDay = this.getDayByX(this.dragappointmentstartPos[0]+1);
				this.dragXoffset = this.dragClickEventPosition[0]-this.dragappointmentstartPos[0];
			
				this.dragSnap = this.getSnap();
			}
		}		
	},
	
	currentDragDay : false,
	
	onAllDayEventDragMouseMove : function (e){
		
		//if(!this.eventMouseUp)
		if(this.allDayDragEvent)
		{
			//update the selector proxy
			var mouseEventPos = e.getXY();				

			//adjust with offsets so event will not jump to mouse position
			var x = this.snapPos(this.dragappointmentstartPos[0],mouseEventPos[0]-this.dragXoffset,this.dragSnap["x"],this.days);
			
			var day = this.getDayByX(mouseEventPos[0]+1);
			
			//var gridLeft = this.gridCells[0][0].xy[0]-4;
			//var gridRight=this.gridCells[this.days-1][47].xy[0]+4;
			if(this.currentDragDay != day && this.allDayColumns[day])
			{
				this.currentDragDay=day;
				this.allDayColumns[day].appendChild(this.allDayDragEvent);
			}
		}
	},	
	onAllDayEventDragMouseUp : function (e){
		
		//unset the drag stuff
		
		if(this.allDayDragEvent)
		{			
			var newPos = e.getXY();			
			
			if(newPos[0] != this.dragappointmentstartPos[0])
			{
				var dragDay = this.getDayByX(this.dragappointmentstartPos[0]+1);
				var dropDay = this.getDayByX(newPos[0]+1);
				
				if(dragDay!=dropDay && this.allDayColumns[dropDay])
				{				
					var offsetDays = dropDay-dragDay;
					
					//do last because orginal times will be lost after this.
					var event = this.elementToEvent(this.allDayDragEvent.id, true);
					
					var actionData = {offsetDays : offsetDays, dragDate: this.allDayDragDate}; 		
					
					if(this.remoteEvents[this.allDayDragEvent.id]['repeats'])
					{
						this.handleRecurringEvent("move", event, actionData);
					}else
					{
						this.fireEvent("move", this, event, actionData);
						
						this.removeEvent(this.allDayDragEvent.id);
							
						event.startDate = Date.parseDate(event.start_time, this.dateTimeFormat).add(Date.DAY, offsetDays);
						event.endDate = Date.parseDate(event.end_time, this.dateTimeFormat).add(Date.DAY, offsetDays);						
						event.start_time=event.startDate.format(this.dateTimeFormat);
						event.end_time=event.endDate.format(this.dateTimeFormat);
						
						this.addDaysGridEvent(event);												
					}
				}
				this.autoSizeGrid();
			}			
			this.allDayDragEvent=false;
		}
	}
});