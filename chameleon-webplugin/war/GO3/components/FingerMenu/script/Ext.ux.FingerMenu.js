/*
The MIT License

Copyright (c) 2009 Mats Bryntse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * Ext.ux.FingerMenu
 *
 * @author    Mats Bryntse
 * @version   1.1
 *
 * This menu fires a 'change' event when an item is activated
 *
 */

Ext.ns('Ext.ux');

Ext.ux.FingerMenu = Ext.extend(Ext.util.Observable, {
    /*
     * @cfg (array) array of menu config objects
     *              The menu is built for 32x32 icons, if you need different size icons
     *              you'll have to modify the CSS.
     *
     *              Example object :
     *              {
     *                  text : 'Menu item 1',
     *                  iconCls : 'myIconClass',
     *                  tooltip : 'This option is optional'
     *              }
     *
     */
    items : [],

     /*
     * @cfg (string) id of dom element to render the menu into
     */
    renderTo : null,

    /*
     * @cfg (int) selected menu index,  -1 for no selection
     */
    selectedIndex : -1,

    /*
     * @cfg (int) the width of a collapsed menu item
     */
    collapsedWidth : 40,

    /*
     * @cfg (int) the width of a menu item on hover
     */
    hoverWidth : 43,

     /*
     * @cfg (int) the full width of a selected menu item
     */
    itemWidth : 190,

     /*
     * @cfg (int) the height of a menu item
     */
    itemHeight  : 40,

     /*
     * @cfg (int) the amount of space between two menu items
     */
    verticalPadding  : 2,

    /*
     * @public (int) returns the currently selected item index
     */
    getSelectedIndex : function() {
        return this.selectedIndex;
    },

    /*
     * @public selects the passed index
     */
    setSelectedIndex : function(index) {
        this.onItemClick(null, 'menuitem-' + index);
    },

    /*
     * @private
     */
    onItemClick : function(notUsed, t) {
        var target = Ext.get(t);

        if (!target.hasClass('fingermenu-show')){
            var current = this.el.child('.fingermenu-show');
            target.radioClass('fingermenu-show');

            if (current) {
                current.setX(this.collapsedWidth - this.itemWidth, {
                    duration : 0.3
                });
            }

            target.setX(0, {
                duration : 0.3,
                callback : function() {
                    this.selectedIndex = parseInt(target.id.substring('menuitem-'.length), 10);
                    this.fireEvent.defer(10, this, ['change', this, this.selectedIndex]);
                },
                scope : this
            });
        }
   },

   /*
     * @private
     */
   onHover : function(e, t) {
       var target = Ext.get(t);
       target = target.is('div') ? target : target.up('div');
       if (target.getX() === (this.collapsedWidth - this.itemWidth)){
           target.setX(this.hoverWidth - this.itemWidth, {
                duration : 0.1
           });
       }
   },

   /*
    * @private
    */
   onHoverLeave : function(e, t) {
       var target = Ext.get(t);
       target = target.is('div') ? target : target.up('div');

       if (!target.hasClass('fingermenu-show')){
           target.setX(this.collapsedWidth - this.itemWidth,{
                duration : 0.2
           });
       }
   },

   /*
    * @private
    */
   constructor : function(config) {
        if (!config || !config.items) throw 'Invalid arguments, see documentation';

        Ext.apply(this, config);

        var menuCfg = {
                tag: 'div',
                cls: 'fingermenu-panel ' + (config.cls || ''),
                children : []
            },
            items = config.items,
            item,
            selected,
            i;

        this.addEvents('change');

        for (i = 0; i < items.length; i++) {
            item = items[i];
            selected = (i === this.selectedIndex);

            menuCfg.children.push({
                id : 'menuitem-' + i,
                cls : selected ? 'fingermenu-show' : '',
                style : {
                    width : this.itemWidth + 'px'/*,
                    position : 'absolute',
                    left : (selected ? 0 : (this.collapsedWidth - this.itemWidth)) + 'px',
                    top : (i*(this.itemHeight + this.verticalPadding)) + 'px'*/
                },
                tag: 'div',
                title : item.tooltip || item.text,
                children : [{
                        tag : 'span',
                        cls : item.iconCls ? ('fingermenu-icon ' + item.iconCls) : '',
                        html : item.text
                    }
                ]
            });
        }

        this.el = Ext.DomHelper.append(this.renderTo || Ext.getBody(), menuCfg, true);

        this.el.on('click', this.onItemClick, this, { delegate: 'div' });

        var divs = this.el.select('div');
        divs.on('mouseenter', this.onHover, this);
        divs.on('mouseleave', this.onHoverLeave, this);

        Ext.ux.FingerMenu.superclass.constructor.call(this);
    }
});
