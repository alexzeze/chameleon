/*
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * 
 * Copyright 1997-2007 Sun Microsystems, Inc. All rights reserved.
 * 
 * The contents of this file are subject to the terms of either the GNU
 * General Public License Version 2 only ("GPL") or the Common Development
 * and Distribution License("CDDL") (collectively, the "License").  You
 * may not use this file except in compliance with the License. You can obtain
 * a copy of the License at https://jersey.dev.java.net/CDDL+GPL.html
 * or jersey/legal/LICENSE.txt.  See the License for the specific
 * language governing permissions and limitations under the License.
 * 
 * When distributing the software, include this License Header Notice in each
 * file and include the License file at jersey/legal/LICENSE.txt.
 * Sun designates this particular file as subject to the "Classpath" exception
 * as provided by Sun in the GPL Version 2 section of the License file that
 * accompanied this code.  If applicable, add the following below the License
 * Header, with the fields enclosed by brackets [] replaced by your own
 * identifying information: "Portions Copyrighted [year]
 * [name of copyright owner]"
 * 
 * Contributor(s):
 * 
 * If you wish your version of this file to be governed by only the CDDL or
 * only the GPL Version 2, indicate your decision by adding "[Contributor]
 * elects to include this software in this distribution under the [CDDL or GPL
 * Version 2] license."  If you don't indicate a single choice of license, a
 * recipient has the option to distribute your version of this file under
 * either the CDDL, the GPL Version 2 or to extend the choice of license to
 * its licensees as provided above.  However, if you add GPL Version 2 code
 * and therefore, elected the GPL Version 2 license, then the option applies
 * only if the new code is made subject to such option by the copyright
 * holder.
 */

package org.mbuni.service.web;

import com.sun.jersey.api.NotFoundException;
import java.math.BigInteger;
import java.net.URI;
import java.security.MessageDigest;
import java.util.Date;
import java.util.GregorianCalendar;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.UriInfo;

import javax.ws.rs.GET;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Cookie;

import java.net.URI;
import java.util.Iterator;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.QueryParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import java.net.URL;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import java.net.URI;
import java.util.List;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import javax.ws.rs.GET;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import com.sun.jersey.api.NotFoundException;

import javax.persistence.EntityManager;
import javax.ws.rs.ConsumeMime;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.ws.rs.ProduceMime;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyReader;
import javax.ws.rs.ext.MessageBodyWriter;
import javax.ws.rs.ext.Provider;
import java.util.*;

/**
 *
 * @author Paul.Sandoz@Sun.Com
 */
@Path("/resolver/")
//@Views({"index.jsp"})
@ProduceMime("application/json")
//@Path("/resource3/{arg1}/{arg2}")
public class Resolver {

    @Context UriInfo uriInfo;
    @Context Request request;

    @PersistenceUnit(unitName = "BookmarkPU")
    EntityManagerFactory emf;

    String container;
    String item;

    public Resolver(){
    	
    }
    
    @GET
    @ProduceMime("application/json")
    //@ConsumeMime("application/json")
    public String getModules() {
        /**/
    	return "{\"success\": true}";
    }
    
    @GET
    @Path("{userid}/")
    @ProduceMime("application/json")
    public String getUser(@PathParam("userid") String userid) {
        //return new UserResource(uriInfo, emf.createEntityManager(), userid);
    	return "{\"success\": true}";
    }
    
    @POST
    @Path("{userid}/{submodule}")
    @ProduceMime("application/json")
    @ConsumeMime("application/x-www-form-urlencoded")
    public String getUser(@Context UriInfo ui, @Context HttpHeaders hh) {
        //return new UserResource(uriInfo, emf.createEntityManager(), userid);
    	MultivaluedMap<String, String> queryParams = ui.getQueryParameters();
        MultivaluedMap<String, String> pathParams = ui.getPathParameters();
        
        MultivaluedMap<String, String> headerParams = hh.getRequestHeaders();
        Map<String, Cookie> pathParams2 = hh.getCookies();

    	return "{\"success\": true}";
    }

    @Path(value="{item}", limited=false)
    public ItemResource getItemResource(@PathParam("item") String item) {
        return new ItemResource(uriInfo, request, container, item);
    }

@PUT
    public Response putContainer() {
        System.out.println("PUT CONTAINER " + container);
        
        URI uri =  uriInfo.getAbsolutePath();
        Container c = new Container(container, uri.toString());
        
        Response r;
        if (!MemoryStore.MS.hasContainer(c)) {
            r = Response.created(uri).build();
        } else {
            r = Response.noContent().build();
        }
        
        MemoryStore.MS.createContainer(c);
        return r;
    }

@DELETE
    public void deleteContainer() {
        System.out.println("DELETE CONTAINER " + container);
        
        Container c = MemoryStore.MS.deleteContainer(container);
        if (c == null)
            throw new NotFoundException("Container not found");
    }

@ProduceMime("text/plain")
//@ProduceMime({"application/json", "application/xml"})
    @GET
    public String getStringRep(@PathParam("arg1")String arg1, 
            @PathParam("arg2")String arg2) {
        return "representation: StringRepresentation: arg1: "
                        +arg1+" arg2: "+arg2+"\n\n";
    }

@ProduceMime("image/jpg")
    @GET
    public DataSource getImageRep() {
        URL jpgURL = this.getClass().getResource("java.jpg");
        return new FileDataSource(jpgURL.getFile());
      
    }

    @GET
    public Container getContainer(@QueryParam("search") String search) {
        System.out.println("GET CONTAINER " + container + ", search = " + search);

        Container c = MemoryStore.MS.getContainer(container);
        if (c == null)
            throw new NotFoundException("Container not found");
        
        
        if (search != null) {
            c = c.clone();
            Iterator<Item> i = c.getItem().iterator();
            byte[] searchBytes = search.getBytes();
            while (i.hasNext()) {
                if (!match(searchBytes, container, i.next().getName()))
                    i.remove();
            }
        }
        
        return c;
    }

    @Path("{container}")
    public ContainerResource getContainerResource(@PathParam("container") String container) {
        return new ContainerResource(uriInfo, request, container);
    }
    
    public ItemResource(UriInfo uriInfo, Request request,
            String container, String item) {
        this.uriInfo = uriInfo;
        this.request = request;
        this.container = container;
        this.item = item;
    }
    
    @GET
    public Response getItem() {
        System.out.println("GET ITEM " + container + " " + item);
        
        Item i = MemoryStore.MS.getItem(container, item);
        if (i == null)
            throw new NotFoundException("Item not found");
        Date lastModified = i.getLastModified().getTime();
        EntityTag et = new EntityTag(i.getDigest());
        ResponseBuilder rb = request.evaluatePreconditions(lastModified, et);
        if (rb != null)
            return rb.build();
            
        byte[] b = MemoryStore.MS.getItemData(container, item);
        return Response.ok(b, i.getMimeType()).
                lastModified(lastModified).tag(et).build();
    }    
    
    @PUT
    public Response putItem(
            @Context HttpHeaders headers,
            byte[] data) {
        System.out.println("PUT ITEM " + container + " " + item);
        
        URI uri = uriInfo.getAbsolutePath();
        MediaType mimeType = headers.getMediaType();
        GregorianCalendar gc = new GregorianCalendar();
        gc.set(GregorianCalendar.MILLISECOND, 0);
        Item i = new Item(item, uri.toString(), mimeType.toString(), gc);
        String digest = computeDigest(data);
        i.setDigest(digest);
        
        Response r;
        if (!MemoryStore.MS.hasItem(container, item)) {
            r = Response.created(uri).build();
        } else {
            r = Response.noContent().build();
        }
        
        Item ii = MemoryStore.MS.createOrUpdateItem(container, i, data);
        if (ii == null) {
            // Create the container if one has not been created
            URI containerUri = uriInfo.getAbsolutePathBuilder().path("..").
                    build().normalize();
            Container c = new Container(container, containerUri.toString());
            MemoryStore.MS.createContainer(c);
            i = MemoryStore.MS.createOrUpdateItem(container, i, data);
            if (i == null)
                throw new NotFoundException("Container not found");
        }
        
        return r;
    }    
    
    @DELETE
    public void deleteItem() {
        System.out.println("DELETE ITEM " + container + " " + item);
        
        Item i = MemoryStore.MS.deleteItem(container, item);
        if (i == null) {
            throw new NotFoundException("Item not found");
        }
    }
    
    
    private String computeDigest(byte[] content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA");
            byte[] digest = md.digest(content);
            BigInteger bi = new BigInteger(digest);
            return bi.toString(16);
        } catch (Exception e) {
            return "";
        }
    }

public List<UserEntity> getUsers() {
        return emf.createEntityManager().createQuery("SELECT u from UserEntity u").getResultList();
    }
    
    

    

}
