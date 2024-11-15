import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SubscriptionCenter {
    // Attributes to initialise MQTT broker, client id and topic
    private static final String broker = "tcp://broker.hivemq.com:1883";
    private static final String clientId = "SubscriptionHub";

    // Method to subscribe to a topic
    public MQTTSubscriber() {
        try {
            // Initialise MQTT client and connect to broker using broker and client id
            MqttClient client = new MqttClient(broker, clientId, new MemoryPersistence());
            MqttConnectOptions connection = new MqttConnectOptions();
            
            client.connect(connection);
            System.out.println("Connected");

            // Defines what will happen when the connection is lost, message is arrived and delivery is completed
            client.setCallback(new MqttCallback() {
                // Method to show in case connection is lost
                public void connectionLost(Throwable cause) {
                    System.out.println("Connection is lost");
                }
                // Method to see that delivery is completed
                public void deliveryComplete(IMqttDeliveryToken token) {
                    System.out.println("Complete");
                }
            });
            
            // Subscribe to different topics to receive message
            client.subscribe("appointmentTopic");
            client.subscribe("notificationTopic");
            client.subscribe("patientTopic");
            client.subscribe("dentistTopic");

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed");
        }
    }

    //#region Methods
    
    // Forward payload to specific service
    private void forwardToService(String topic, String payload) {
        System.out.println("Forwarding to service: " + topic + " -> " + payload);
    }

    //#endregion
}