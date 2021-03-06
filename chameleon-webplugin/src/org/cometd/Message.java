// ========================================================================
// Copyright 2007 Dojo Foundation
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.cometd;

import java.util.Map;


/* ------------------------------------------------------------ */
/** A Bayeux Message
 * A Map of String to Object that has been optimized for conversion to JSON messages.
 * 
 */
public interface Message extends Map<String,Object>, Cloneable
{
    public String getClientId();
    public String getChannel();
    public String getId();
    public Object getData();
    public Map<String,Object> getExt(boolean create);
    public Message getAssociated();
    public Object clone();
}


