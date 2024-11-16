import org.eclipse.paho.client.mqttv3.*;

public class PublicationCenter {

    // Connect to the MQTT broker
    private static final String broker = "tcp://broker.hivemq.com:1883";
    private static final String clientId = "JavaPublisher";

    public MQTTPublisher() {
        try {
            MqttClient client = new MqttClient(broker, clientId, new MemoryPersistence());
            client.connect();
            System.out.println("MQTTPublisher has been connected!");

        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    // Topics to be added

    //#region Methods

    // Method to send message/data to broker
    private void publishMessage(MqttClient client, String topic, String payload) {
        try {
            MqttMessage data = new MqttMessage(payload.getBytes());
            client.publish(topic, data);
            System.out.println("Published message: " + topic + " -> " + payload);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    //#endregion
}
