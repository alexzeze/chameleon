package org.chameleon.messagebus.activemq;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.TextMessage;

import org.slf4j.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.JmsException;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessagePostProcessor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.jms.ConnectionFactory;

@Component("dbManager")
@Service
public class Endpoint implements MessageListener, Serializable{

	@Autowired
	private ConnectionFactory connectionFactory;
	
	@Autowired
	private JmsTemplate jmsTemplate;
	
	public void sendWithConversion() {
		Map map = new HashMap();
		map.put("Name", "fghj");
		map.put("Name2", new Integer(47));
		map.put("Name", new byte[5]);
		jmsTemplate.convertAndSend("activemq:topic:observation.examinations", map, new MessagePostProcessor() {
			public Message postProcessMessage(Message message) throws JMSException {
				message.setIntProperty("AccountID", 1234);
				message.setJMSCorrelationID("123-00001");
				return message;
			}
		});		
	}
	
	public void unsubscribe(String topic) {
		//TopicConnection topicConn =  connectionFactory.cr
	}
	
	public void onMessage(Message message) {
		if(message instanceof TextMessage) {
			try {
				System.out.println(((TextMessage)message).getText());
			}catch(JMSException ex) {
				throw new RuntimeException(ex);
			}
		}else {
			throw new IllegalArgumentException("message must type textmessage");
		}
	}
}
