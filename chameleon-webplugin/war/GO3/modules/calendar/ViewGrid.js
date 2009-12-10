/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: ViewGrid.js 1847 2009-02-09 14:40:39Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

 
GO.grid.ViewGrid = Ext.extend(Ext.Panel, {
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
	
	//An object with the event_id as key and the value is an array with dom id's
	domIds : Array(),
	
	//amount of days to display
	days : 1,
	
	selected : Array(),
	
	view_id : 0,
	
	//a collection of all the gridcells
	gridCells : Array(),

	// private
    initComponent : function(){
        GO.grid.ViewGrid.superclass.initComponent.call(this);
	
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
		    "eventDblClick" : true,
		    "zoom" : true
	
	    });
	    
   

		if(!this.startDate)
		{
			//lose time
			var date = new Date();
			this.startDate=Date.parseDate(date.format(this.dateFormat), this.dateFormat);
		}
		
		this.configuredDate=this.startDate;
    },
    
    setViewId : function(view_id)
    {
    	this.view_id=view_id;
    	//this.load();
    },

	//build the html grid
	onRender : function(ct, position){
		
		GO.grid.ViewGrid.superclass.onRender.apply(this, arguments);
		
		//important to do here. Don't remember why :S
		this.setDate(this.startDate, false);
		

		
		//if this is not set the grid does not display well when I put a load mask on it.
		this.body.setStyle("overflow", "hidden");
		
		//Don't select things inside the grid
		this.body.unselectable();

		//this.renderViewView();
		
		this.initDD();
	},
	
	renderView : function()
	{
	
		this.body.update('');
        
        //get content size of element
		var ctSize = this.container.getSize(true);
		
		//column width is the container size minus the time column width
		var columnWidth = (ctSize['width']-150)/this.days;
        
        //generate table for headings and all day events
        this.headingsTable = Ext.DomHelper.append(this.body,
			{
				tag: 'table', 
				id: Ext.id(), 
				cls: "x-calGrid-headings-table", 
				style: "width:"+ctSize['width']+"px;"
				
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
					style:'width:147px',
					cls: "x-calGrid-heading"
				}
			}, true);
			
			
		var yearPos = GO.settings.date_format.indexOf('Y');
		var dateFormat = 'D '+GO.settings.date_format.substring(0, yearPos-1);
		
		for(var day=0;day<this.days;day++)
		{	
			
			var dt = this.startDate.add(Date.DAY, day);
			//create grid heading
			var heading = Ext.DomHelper.append(this.headingsRow,
				{tag: 'td', cls: "x-calGrid-heading", style: "width:"+(columnWidth)+"px", html: dt.format(dateFormat) });	
		}
		

		//for the scrollbar
		Ext.DomHelper.append(this.headingsRow,
		{
			tag: 'td', 
			style: "width:"+(this.scrollOffset-3)+"px;height:0px",
			cls: "x-calGrid-heading"
		});
	
	
		//create container for the grid
		this.gridContainer = Ext.DomHelper.append(this.body,
				{tag: 'div', cls: "x-calGrid-grid-container"}, true);

		//calculate gridContainer size
		var headingsHeight = this.headingsTable.getHeight();

		var gridContainerHeight = ctSize['height']-headingsHeight;
		this.gridContainer.setSize(ctSize['width'],gridContainerHeight );
			
			
		
		this.gridTable = Ext.DomHelper.append(this.gridContainer,
		{
			tag: 'table', 
			id: Ext.id(), 
			cls: "x-viewGrid-table", 
			style: "width:"+ctSize['width']-this.scrollWidth+"px;"
			
		},true);
		
	
		this.tbody = Ext.DomHelper.append(this.gridTable,
			{
				tag: 'tbody'
			}, true); 
		
		this.gridCells = {};
		for(var calendar_id in this.jsonData)
		{
			var gridRow =  Ext.DomHelper.append(this.tbody,
			{
				tag: 'tr'
			});
			
			
			
			var cell = Ext.DomHelper.append(gridRow, {
				tag: 'td', 
				cls: 'x-viewGrid-calendar-name-cell',				
				style:'width:150px'
			}, true);			
			
			var link = Ext.DomHelper.append(cell, {
				tag: 'a', 
				id: 'view_cal_'+calendar_id,
				href:'#',
				cls:'normal-link',
				html:this.jsonData[calendar_id].name				
			}, true);
			
			link.on('click', function(e, target){			
				e.preventDefault();
				this.fireEvent('zoom', {calendar_id: target.id.substring(9)});				
			}, this);
			
			this.gridCells[calendar_id]={};
			
			for(var day=0;day<this.days;day++)
			{	
				var dt = this.startDate.add(Date.DAY, day)
				
				this.gridCells[calendar_id][dt.format('Ymd')]= Ext.DomHelper.append(gridRow,{
					tag: 'td', 
					id: 'cal'+this.jsonData[calendar_id].id+'_day'+dt.format('Ymd'), 
					cls: 'x-viewGrid-cell',
					style:'width:'+columnWidth+'px'
				}, true);				
			}			
		}
		
		
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
		
		/*found=false;
		
		for(var e in this.eventIdToDomId)
		{
			for(var i=0;i<this.eventIdToDomId[e].length;i++)
			{
				if(this.eventIdToDomId[e][i]==domId)
				{
					this.eventIdToDomId[e].splice(i,1);
					found=true;
					break;
				}
			}
			if(found)
			{
				break;
			}
		}*/
	},
	
	setNewEventId : function(dom_id, new_event_id){	
		this.remoteEvents[dom_id].event_id=new_event_id;
  },
  
	initDD :  function(){
		
		var dragZone = new GO.calendar.dd.ViewDragZone(this.body, {
            ddGroup: 'view-grid',
            scroll: false,
            viewGrid: this
        });
        
    var dropTarget = new GO.calendar.dd.ViewDropTarget(this.body, {
        ddGroup: 'view-grid',
        onNotifyDrop : function(dd, e, data) {
        		
	    		//number of seconds moved
	    		
	    		var dragTime = data.dragDate.format('U');
	    		var dropTime = data.dropDate.format('U');
	    		
	    		offsetDays = Math.round((dropTime-dragTime)/86400);
	    		
	    		var actionData = {offsetDays:offsetDays, dragDate: data.dragDate, calendar_id: data.calendar_id};
	
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
						remoteEvent.calendar_id=data.calendar_id;						
						remoteEvent.startDate = remoteEvent.startDate.add(Date.DAY, offsetDays);
						remoteEvent.endDate = remoteEvent.endDate.add(Date.DAY, offsetDays);
						remoteEvent.start_time = remoteEvent.startDate.format('U');
						remoteEvent.end_time = remoteEvent.endDate.format('U');									
						this.addViewGridEvent(remoteEvent);
					}
      	},
        scope : this
    });
	},
	
  onResize : function(adjWidth, adjHeight, rawWidth, rawHeight){
    //Ext.grid.GridPanel.superclass.onResize.apply(this, arguments);

		if(this.viewGridTable)
		{
			this.viewGridTable.setSize(adjWidth, adjHeight);
		}

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
	
	addViewGridEvent : function (eventData)
	{
		
	
		//the start of the day the event starts
		var eventStartDay = Date.parseDate(eventData.startDate.format('Ymd'),'Ymd');
		var eventEndDay = Date.parseDate(eventData.endDate.format('Ymd'),'Ymd');
		
		//get unix timestamps
		var eventStartTime = eventStartDay.format('U');
		var eventEndTime = eventEndDay.format('U');
		
		//ceil required because of DST changes!
		var daySpan = Math.round((eventEndTime-eventStartTime)/86400)+1;
		
		
		for(var i=0;i<daySpan;i++)
		{
			var date = eventStartDay.add(Date.DAY, i);
			
			
			var domId = eventData.domId ? eventData.domId : Ext.id();
			
			//related events for dragging
			if(daySpan>1)
			{
				if(!this.domIds[eventData.id])
				{
					this.domIds[eventData.id]=[];
				}				
				this.domIds[eventData.id].push(domId);
			}
			
			var col = this.gridCells[eventData['calendar_id']][date.format('Ymd')];
			
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
						id: domId, 
						cls: "x-viewGrid-event-container", 
						style:"background-color:#"+eventData.background,
						html: text, 		
						qtitle:eventData.name,
						qtip: GO.calendar.formatQtip(eventData)
					}, true);			
					
				this.registerEvent(domId, eventData);
				
				
				
				event.on('mousedown', function(e, eventEl){
				
					eventEl = Ext.get(eventEl).findParent('div.x-viewGrid-event-container', 2, true);
					
					this.selectEventElement(eventEl);					
					this.clickedEventId=eventEl.id;
		
				}, this);
				
				event.on('dblclick', function(e, eventEl){
					
					eventEl = Ext.get(eventEl).findParent('div.x-viewGrid-event-container', 2, true);
					
					//this.eventDoubleClicked=true;
					var event = this.elementToEvent(this.clickedEventId);
					
					if(event['repeats'] && event['write_permission'])
					{
						this.handleRecurringEvent("eventDblClick", event, {});
					}else
					{
						
						this.fireEvent("eventDblClick", this, event, {singleInstance : event['write_permission']});
					}
					
				}, this);	
			}
		}
		
		return domId;	
	},

	removeEventFromArray : function (day, event_id)
	{
		for(var i=0;i<this.appointments[day].length;i++)
		{
			if(this.appointments[day][i].id==event_id)
			{
				return this.appointments[day].splice(i,1);				
			}
		}
		return false;
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
				html: GO.calendar.lang.deleteRecurringEvent,
				buttons: [{
						text: GO.calendar.lang.singleOccurence,
						handler: function(){
							
							this.currentActionData.singleInstance=true;
							
							var remoteEvent = this.currentRecurringEvent;
							
							this.fireEvent(this.currentFireEvent, this, remoteEvent , this.currentActionData);
							
							
							this.removeEvent(remoteEvent.domId);			
							remoteEvent.calendar_id=this.currentActionData.calendar_id;			
							remoteEvent.repeats=false;			
							remoteEvent.startDate = remoteEvent.startDate.add(Date.DAY, offsetDays);
							remoteEvent.endDate = remoteEvent.endDate.add(Date.DAY, offsetDays);
							remoteEvent.start_time = remoteEvent.startDate.format('U');
							remoteEvent.end_time = remoteEvent.endDate.format('U');									
							this.addViewGridEvent(remoteEvent);
							
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
		this.appointments=Array();		
		this.remoteEvents=Array();
		this.domIds=Array();
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

  	if(load)
  	{ 
    	//if(!oldEndDate || !oldStartDate || oldEndDate.getElapsed(this.endDate)!=0 || oldStartDate.getElapsed(this.startDate)!=0)
    	//{    		    		
    		this.reload();
    	//}    	
  	}
 
  },
  
  reload : function()
  {
  	/*this.clearGrid();
  	if(!this.viewView)
  	{
  		this.createHeadings();
  	}    	*/
  	this.load();
  	
  },
  
  load : function(params)
  {		
  	
  	if(!params)
  	{
  		params={};
  	}
  	params['task']='view_events';
  	params['view_id']=this.view_id;
  	params['start_time']=this.startDate.format(this.dateTimeFormat);
  	params['end_time']=this.endDate.format(this.dateTimeFormat);
  	
  	this.mask();
  	Ext.Ajax.request({
  		url: GO.settings.modules.calendar.url+'json.php',
			params: params,
			callback: function(options, success, response)
			{

				if(!success)
				{
					Ext.MessageBox.alert(GO.lang.strError, response.result.feedback);
				}else
				{					
					this.jsonData = Ext.decode(response.responseText);
					
					this.clearGrid();
					
					this.renderView();
					
					
					
					for(var calendar_id in this.jsonData)
					{
						
						var events = this.jsonData[calendar_id].events;
						
						for(var i=0; i< events.length;i++)
						{						
							
							var eventData = events[i];
							eventData['startDate'] = Date.parseDate(events[i]['start_time'], this.dateTimeFormat);
							eventData['endDate'] = Date.parseDate(events[i]['end_time'], this.dateTimeFormat);
							
							this.addViewGridEvent(eventData);
						}
					}						
				}
				this.unmask();
			},
			scope:this		
		});

  
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
		this.remoteEvents[elementId].domId=elementId;
		return this.remoteEvents[elementId];
	}/*,

    // private
    destroy : function(){
    	
    	this.store.un("beforeload", this.reload, this);
        this.store.un("datachanged", this.reload, this);
        this.store.un("clear", this.reload, this);
        
        this.el.update('');
		
		GO.grid.CalendarGrid.superclass.destroy.call(this);
		
		delete this.el;
		this.rendered=false;
		
    }*/

});


GO.calendar.dd.ViewDragZone = function(el, config) {
    config = config || {};
    Ext.apply(config, {
        ddel: document.createElement('div')
    });
    GO.calendar.dd.ViewDragZone.superclass.constructor.call(this, el, config);
};
 
Ext.extend(GO.calendar.dd.ViewDragZone, Ext.dd.DragZone, {
	onInitDrag: function(e) {
	    this.ddel.innerHTML = this.dragData.item.dom.innerHTML;
	    this.ddel.className = this.dragData.item.dom.className;
	    this.ddel.style.width = this.dragData.item.getWidth() + "px";
	    this.proxy.update(this.ddel);
	    
	    this.eventDomElements = this.viewGrid.getRelatedDomElements(this.dragData.item.id);
	    
	    var td = Ext.get(this.dragData.item).findParent('td', 10, true);
	    
	   	//this.proxyCount = eventDomElements.length;
	    
	    this.eventProxies=[];
	    this.proxyDragPos = 0;
	    for(var i=0;i<this.eventDomElements.length;i++)
	    {
	    	this.eventProxies.push(Ext.DomHelper.append(document.body,
					{
						tag: 'div', 
						id: Ext.id(), 
						cls: "x-viewGrid-event-proxy", 
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
						el.setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
	    	}	    	   	
	    }
	},
	
	removeEventProxies : function(){
		var proxies = Ext.query('div.x-viewGrid-event-proxy');
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
				el.setStyle({'position' : 'static', 'top': '', 'display':'block'});
	  }
	},
	
	afterRepair : function(){
		GO.calendar.dd.ViewDragZone.superclass.afterRepair.call(this);
		
		this.removeEventProxies();
		
	},
	getRepairXY: function(e, data) {
	    data.item.highlight('#e8edff');
	    return data.item.getXY();
	},
  getDragData: function(e) {
    var target = Ext.get(e.getTarget());
    
    if(target.hasClass('x-viewGrid-event-container'))
    {
	    var td = target.parent();
	    
	    var dateIndex = td.id.indexOf('_day')+4;    
	    var calendar_id = td.id.substr(3,dateIndex-7);
	    
	    if(!this.viewGrid.remoteEvents[target.id]['private'] && this.viewGrid.jsonData[calendar_id].write_permission)
	    {
		    var dateStr = td.id.substr(dateIndex);
		    var dragDate = Date.parseDate(dateStr,'Ymd');
		    
	     
	      return {
	      	ddel:this.ddel, 
	      	item:target,
	      	dragDate: dragDate
	      	};
	    }
	    return false;
    }
            
  }
});


GO.calendar.dd.ViewDropTarget = function(el, config) {
    GO.calendar.dd.ViewDropTarget.superclass.constructor.call(this, el, config);
};
Ext.extend(GO.calendar.dd.ViewDropTarget, Ext.dd.DropTarget, {
    notifyDrop: function(dd, e, data) {
 		
	 		var td = Ext.get(e.getTarget()).findParent('td', 10, true);
	 		if(!td)
	 		{
	 			return false;
	 		}
	 		var dateIndex = td.id.indexOf('_day')+4;
	 		 
		  var calendar_id = td.id.substr(3,dateIndex-7);
		    
	    if(!this.scope.jsonData[calendar_id] || !this.scope.jsonData[calendar_id].write_permission)
	    {
	    	return false;
	    }
	 		
	        
	    var dateStr = td.id.substr(dateIndex);
	    data.dropDate = Date.parseDate(dateStr,'Ymd');
	    
	    data.calendar_id=td.id.substr(3,dateIndex-7);
	
	 		dd.removeEventProxies();
	 		   	
	    this.el.removeClass(this.overClass);
	    td.appendChild(data.item);
	    
	    
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
    },
    
    notifyOver : function(dd, e, data){
        var tdOver = Ext.get(e.getTarget()).findParent('td.x-viewGrid-cell', 10, true);
         
        if(tdOver)
        {
        	var dateIndex = tdOver.id.indexOf('_day');    
			    var calendar_id = tdOver.id.substr(3,dateIndex-3);
			    
			    if(this.scope.jsonData[calendar_id] && this.scope.jsonData[calendar_id].write_permission)
			    {
		        if(dd.lastTdOverId!=tdOver.id)
		        {
		        	var currentTd=tdOver;
		        	for(var i=0;i<dd.proxyDragPos;i++)
		        	{
		        		if(currentTd)
		        		{
			        		var nextTd = currentTd.prev('td.x-viewGrid-cell');		        		
			        		currentTd = nextTd; 
		        		}	        		
		        		if(nextTd)
		        		{	    
		        			//dd.eventProxies[i].insertAfter(nextTd.first());		
		        			nextTd.insertFirst(dd.eventProxies[i].id);
		   					dd.eventProxies[i].setStyle({'position' : 'static', 'top': '', 'display':'block'});
		        		}else
		        		{
		        			dd.eventProxies[i].setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
		        		} 		
		        	}
		        	
		        	tdOver.insertFirst(dd.eventProxies[i].id);
		        	//dd.eventProxies[i].insertAfter(tdOver.first());	
		        	var currentTd=tdOver;
		        	for(var i=dd.proxyDragPos+1;i<dd.eventProxies.length;i++)
		        	{
		        		if(currentTd)
		        		{
			        		var nextTd = currentTd.next('td.x-viewGrid-cell');		        		
			        		currentTd = nextTd;
		        		}
		        		
		        		if(nextTd)
		        		{	     
		        			//dd.eventProxies[i].insertAfter(nextTd.first());
		        			nextTd.insertFirst(dd.eventProxies[i].id); 
		        			 			
		   						dd.eventProxies[i].setStyle({'position' : 'static', 'top': '', 'display':'block'});
		        		}else
		        		{
		        			dd.eventProxies[i].setStyle({'position' : 'absolute', 'top':-10000, 'display':'none'});
		        		}
		        	}
		        	
		        }
		        
		        dd.lastTdOverId=tdOver.id;
		        return this.dropAllowed;
	        }
        }
        return false;
    }
    
});