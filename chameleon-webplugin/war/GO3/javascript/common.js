/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: common.js 2817 2009-07-10 12:20:44Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
Ext.namespace('GO.util');


GO.util.empty = function(v)
{
	if(!v)
	{
		return true;
	}
	if(v=='')
	{
		return true;
	}

	if(v=='0')
	{
		return true;
	}
	
	if(v=='undefined')
	{
		return true;
	}
	
	if(v=='null')
	{
		return true;
	}
	return false;
}

GO.mailTo = function(email){
	
	if(GO.email && GO.settings.modules.email.read_permission)
	{
		return '<a href="#" onclick="GO.email.showAddressMenu(event, \''+email+'\',\'\');">'+email+'</a>';
	}else
	{
		return '<a href="mailto:'+email+'">'+email+'</a>';
	}	
}

GO.util.getFileExtension = function(filename)
{
	var lastIndex = filename.lastIndexOf('.');
	var extension = '';
	if(lastIndex)
	{
		extension = filename.substr(lastIndex+1);
	}
	return extension.toLowerCase();
}

GO.playAlarm = function(){
	if(GO.util.empty(GO.settings.mute_sound))
	{
		var flashMovie= GO.util.getFlashMovieObject("alarmSound");
		if(flashMovie)
		{
			flashMovie.Play();
		}
	}	
}

GO.util.nl2br = function (v)
{
	return v.replace(/\n/g, '<br />');
}

GO.util.clone = function(o) {
    if('object' !== typeof o) {
        return o;
    }
    var c = 'function' === typeof o.pop ? [] : {};
    var p, v;
    for(p in o) {
        v = o[p];
        if('object' === typeof v) {
            c[p] = GO.util.clone(v);
        }
        else {
            c[p] = v;
        }
    }
    return c;
}  
/**
 * Handles default error messages from the Group-Office server. It checks for the 
 * precense of UNAUTHORIZED or NOTLOGGEDIN as error message. It will present a 
 * login dialog if the user needs to login
 * 
 * @param {Object} json JSON object returned from the GO server. 
 * @param (Function} callback Callback function to call after successful login
 * @param {Object} scope	Scope the function to this object
 * 
 * @returns {Boolean} True if no errors have been returned.
 */
 
GO.jsonAuthHandler = function(json, callback, scope)
{
	if(json.authError)
	{
		switch(json.authError)
		{
			case 'UNAUTHORIZED':
				alert(GO.lang['strUnauthorizedText']);
				return false;
			
			case 'NOTLOGGEDIN':			
				
				if(callback)
				{
					GO.loginDialog.addCallback(callback, scope);
				}
							
				GO.loginDialog.show();
				return false;
		}
	}
	return true;
}



//url, params, count, callback, success, failure, scope ( success & failure are callbacks)
//store. If you pass a store it will automatically reload it with the params
//it will reload with a callback that will check for deleteSuccess in the json reponse. If it
//failed it will display deleteFeedback
GO.deleteItems = function(config)
{	
	switch(config.count)
	{
		case 0:
			alert( GO.lang['noItemSelected']);
			return false;
		
		case 1:
			var strConfirm = GO.lang['strDeleteSelectedItem'];
		break;
		
		default:
			var t = new Ext.Template(
		    	GO.lang['strDeleteSelectedItems']
			);
			var strConfirm = t.applyTemplate({'count': config.count});						
		break;						
	}

	if(confirm(strConfirm)){
		if(config.store)
		{
			//add the parameters
			for(var param in config.params)
			{
				config.store.baseParams[param]=config.params[param];
			}
						
			config.store.reload({
				//params: config.params,
				callback: function(){
					if(!this.reader.jsonData.deleteSuccess)
					{
						if(config.failure)
						{
							callback = config.failure.createDelegate(config.scope);
							callback.call(config.scope, config);
						}
						alert( this.reader.jsonData.deleteFeedback);
					}else
					{
						if(config.success)
						{
							callback = config.success.createDelegate(config.scope);
							callback.call(config.scope, config);
						}
					}
					
					if(config.callback)
					{
						callback = config.callback.createDelegate(config.scope);
						callback.call(this, config);
					}	
				}
			}
			);
			
			//remove the delete params
			for(var param in config.params)
			{					
				delete config.store.baseParams[param];					
			}
			
			
		}else
		{

			Ext.Ajax.request({
				url: config.url,
				params: config.params,
				callback: function(options, success, response)
				{
					var responseParams = Ext.decode(response.responseText);
					if(!responseParams.success)
					{
						if(config.failure)
						{
							callback = config.failure.createDelegate(config.scope);
							callback.call(this, responseParams);
						}
						alert( responseParams.feedback);
					}else
					{
						if(config.success)
						{
							callback = config.success.createDelegate(config.scope);
							callback.call(this, responseParams);
						}
					}
					
					if(config.callback)
					{
						callback = config.callback.createDelegate(config.scope);
						callback.call(this, responseParams);
					}
				}
							
			});
		}	
	}
	
}

GO.util.getFlashMovieObject = function(movieName)
{
  if (window.document[movieName]) 
  {
      return window.document[movieName];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1)
  {
    if (document.embeds && document.embeds[movieName])
      return document.embeds[movieName]; 
  }
  else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
  {
    return document.getElementById(movieName);
  }
}


GO.util.unlocalizeNumber = function (number, decimal_separator, thousands_separator)
{
	
	if(!decimal_separator)
	{
		decimal_separator=GO.settings.decimal_separator;
	}
	
	if(!thousands_separator)
	{
		thousands_separator=GO.settings.thousands_separator;
	}
	
	number = number+"";
		
	var re = new RegExp('['+thousands_separator+']', 'g');	
	number = number.replace(re, "");
	return number.replace(decimal_separator, ".");	
}

String.prototype.regexpEscape = function() {
  var specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
  ];
  var re = new RegExp(
    '(\\' + specials.join('|\\') + ')', 'g'
  );

  return this.replace(re, '\\$1');
}



GO.util.numberFormat = function (number, decimals, decimal_separator, thousands_separator)
{
	if(typeof(decimals)=='undefined')
	{
		decimals=2;
	}
	
	if(!decimal_separator)
	{
		decimal_separator=GO.settings.decimal_separator;
	}
	
	if(!thousands_separator)
	{
		thousands_separator=GO.settings.thousands_separator;
	}

	if(number=='')
	{
		return '';
	}
	
/*	if(localized)
	{
		var internal_number = number.replace(thousands_separator, "");
		internal_number = internal_number.replace(decimal_separator, ".");
	}else
	{
		var internal_number=number;
	}*/
	
	var numberFloat = parseFloat(number);
	
	numberFloat = numberFloat.toFixed(decimals);
		
	
	if(decimals>0)
	{
		var dotIndex = numberFloat.indexOf(".");	
		if(!dotIndex)
		{
			numberFloat = numberFloat+".";
			dotIndex = numberFloat.indexOf(".");	
		}
		
		var presentDecimals = numberFloat.length-dotIndex;
		
		for(i=presentDecimals;i<=decimals;i++)
		{
			numberFloat = numberFloat+"0";
		}
		var formattedNumber = decimal_separator+numberFloat.substring(dotIndex+1);
		
		var dec = decimals;
		while(formattedNumber.substring(formattedNumber.length-1)=='0' && dec>decimals)
		{
			dec--;
			formattedNumber = formattedNumber.substring(0,formattedNumber.length-1);
		}
		
	}else
	{
		
		var formattedNumber = "";
		var dotIndex = numberFloat.length;
	}
	

	

	var counter=0;
	for(i=dotIndex-1;i>=0;i--)
	{		
		if(counter==3 && numberFloat.substr(i,1)!='-')
		{
			formattedNumber= thousands_separator+formattedNumber; 
			counter=0;
		}
		formattedNumber = numberFloat.substr(i,1)+formattedNumber;
		counter++;
		
	}	
	if(formattedNumber==',NaN')
	{
		formattedNumber = GO.util.numberFormat('0', decimals, decimal_separator, thousands_separator);
	}
	return formattedNumber;
}

GO.util.popup = function (config)
{
	if(!config.width)
	{
		config.width = screen.availWidth;
		config.height = screen.availHeight;
	}
	if(!config.target)
	{
		config.target='_blank';
	}

	var centered;
	x = (screen.availWidth - config.width) / 2;
	y = (screen.availHeight - config.height) / 2;
	centered =',width=' + config.width + ',height=' + config.height + ',left=' + x + ',top=' + y + ',scrollbars=yes,resizable=yes,status=no';

	var popup = window.open(config.url, config.target, centered);
	
	
	if(!popup)
	{
		alert(GO.lang.popupBlocker);
		return false;
	}
	
  if (!popup.opener) popup.opener = self;
  
	popup.focus();
	
	return popup;
}



GO.util.get_html_translation_table = function(table, quote_style) {
    // http://kevin.vanzonneveld.net
    // +   original by: Philip Peterson
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: noname
    // %          note: It has been decided that we're not going to add global
    // %          note: dependencies to php.js. Meaning the constants are not
    // %          note: real constants, but strings instead. integers are also supported if someone
    // %          note: chooses to create the constants themselves.
    // %          note: Table from http://www.the-art-of-web.com/html/character-codes/
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    
    var entities = {}, histogram = {}, decimal = 0, symbol = '';
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    
    useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
    useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
    
    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS';
    constMappingTable[1]      = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';
    
    // Map numbers to strings for compatibilty with PHP constants
    if (!isNaN(useTable)) {
        useTable = constMappingTable[useTable];
    }
    if (!isNaN(useQuoteStyle)) {
        useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
    }
    
    if (useTable == 'HTML_SPECIALCHARS') {
        // ascii decimals for better compatibility
        entities['38'] = '&amp;';
        entities['60'] = '&lt;';
        entities['62'] = '&gt;';
    } else if (useTable == 'HTML_ENTITIES') {
        // ascii decimals for better compatibility
      entities['38'] = '&amp;';
      entities['60'] = '&lt;';
      entities['62'] = '&gt;';
      entities['160'] = '&nbsp;';
      entities['161'] = '&iexcl;';
      entities['162'] = '&cent;';
      entities['163'] = '&pound;';
      entities['164'] = '&curren;';
      entities['165'] = '&yen;';
      entities['166'] = '&brvbar;';
      entities['167'] = '&sect;';
      entities['168'] = '&uml;';
      entities['169'] = '&copy;';
      entities['170'] = '&ordf;';
      entities['171'] = '&laquo;';
      entities['172'] = '&not;';
      entities['173'] = '&shy;';
      entities['174'] = '&reg;';
      entities['175'] = '&macr;';
      entities['176'] = '&deg;';
      entities['177'] = '&plusmn;';
      entities['178'] = '&sup2;';
      entities['179'] = '&sup3;';
      entities['180'] = '&acute;';
      entities['181'] = '&micro;';
      entities['182'] = '&para;';
      entities['183'] = '&middot;';
      entities['184'] = '&cedil;';
      entities['185'] = '&sup1;';
      entities['186'] = '&ordm;';
      entities['187'] = '&raquo;';
      entities['188'] = '&frac14;';
      entities['189'] = '&frac12;';
      entities['190'] = '&frac34;';
      entities['191'] = '&iquest;';
      entities['192'] = '&Agrave;';
      entities['193'] = '&Aacute;';
      entities['194'] = '&Acirc;';
      entities['195'] = '&Atilde;';
      entities['196'] = '&Auml;';
      entities['197'] = '&Aring;';
      entities['198'] = '&AElig;';
      entities['199'] = '&Ccedil;';
      entities['200'] = '&Egrave;';
      entities['201'] = '&Eacute;';
      entities['202'] = '&Ecirc;';
      entities['203'] = '&Euml;';
      entities['204'] = '&Igrave;';
      entities['205'] = '&Iacute;';
      entities['206'] = '&Icirc;';
      entities['207'] = '&Iuml;';
      entities['208'] = '&ETH;';
      entities['209'] = '&Ntilde;';
      entities['210'] = '&Ograve;';
      entities['211'] = '&Oacute;';
      entities['212'] = '&Ocirc;';
      entities['213'] = '&Otilde;';
      entities['214'] = '&Ouml;';
      entities['215'] = '&times;';
      entities['216'] = '&Oslash;';
      entities['217'] = '&Ugrave;';
      entities['218'] = '&Uacute;';
      entities['219'] = '&Ucirc;';
      entities['220'] = '&Uuml;';
      entities['221'] = '&Yacute;';
      entities['222'] = '&THORN;';
      entities['223'] = '&szlig;';
      entities['224'] = '&agrave;';
      entities['225'] = '&aacute;';
      entities['226'] = '&acirc;';
      entities['227'] = '&atilde;';
      entities['228'] = '&auml;';
      entities['229'] = '&aring;';
      entities['230'] = '&aelig;';
      entities['231'] = '&ccedil;';
      entities['232'] = '&egrave;';
      entities['233'] = '&eacute;';
      entities['234'] = '&ecirc;';
      entities['235'] = '&euml;';
      entities['236'] = '&igrave;';
      entities['237'] = '&iacute;';
      entities['238'] = '&icirc;';
      entities['239'] = '&iuml;';
      entities['240'] = '&eth;';
      entities['241'] = '&ntilde;';
      entities['242'] = '&ograve;';
      entities['243'] = '&oacute;';
      entities['244'] = '&ocirc;';
      entities['245'] = '&otilde;';
      entities['246'] = '&ouml;';
      entities['247'] = '&divide;';
      entities['248'] = '&oslash;';
      entities['249'] = '&ugrave;';
      entities['250'] = '&uacute;';
      entities['251'] = '&ucirc;';
      entities['252'] = '&uuml;';
      entities['253'] = '&yacute;';
      entities['254'] = '&thorn;';
      entities['255'] = '&yuml;';
    } else {
        throw Error("Table: "+useTable+' not supported');
        return false;
    }
    
    if (useQuoteStyle != 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    
    if (useQuoteStyle == 'ENT_QUOTES') {
        entities['39'] = '&#039;';
    }
    
    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal)
        histogram[symbol] = entities[decimal];
    }
    
    return histogram;
}


GO.util.html_entity_decode = function (string, quote_style ) {
    // http://kevin.vanzonneveld.net
    // +   original by: john (http://www.jd-tech.net)
    // +      input by: ger
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: marc andreu
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: get_html_translation_table
    // *     example 1: html_entity_decode('Kevin &amp; van Zonneveld');
    // *     returns 1: 'Kevin & van Zonneveld'
 
	string+="";
    var histogram = {}, symbol = '', tmp_str = '', i = 0;
    tmp_str = string.toString();
    
    if (false === (histogram = GO.util.get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }
    
    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    
    return tmp_str;
}

GO.util.add_slashes = function(str)
{
	return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
}

GO.util.basename = function(path)
{
	var pos = path.lastIndexOf('/');
	if(pos)
	{
		path = path.substring(pos+1);
	}
	return path;
}

GO.util.dirname = function(path)
{
	var pos = path.lastIndexOf('/');
	if(pos)
	{
		path = path.substring(0, pos);
	}
	return path;
}
