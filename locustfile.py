from locust import HttpUser, task, between, events
import paho.mqtt.client as mqtt
import json
import random
import time

# MQTT settings
BROKER = "test.mosquitto.org"
PORT = 1883
KEEP_ALIVE_INTERVAL = 60

# MQTT Topics
PATIENT_CREATE_TOPIC = "patients/create"
PATIENT_CREATE_RESPONSE_TOPIC = "patients/create/response"
DENTISTS_GET_ALL_TOPIC = "dentists/get/all"
DENTISTS_GET_ALL_RESPONSE_TOPIC = "dentists/get/all/response"

class RegisterUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """Set up the MQTT client when a user starts."""
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(BROKER, PORT, KEEP_ALIVE_INTERVAL)
        self.client.loop_start()
        self.response_received = False
        self.response_data = None

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            client.subscribe(PATIENT_CREATE_RESPONSE_TOPIC)
            client.subscribe(DENTISTS_GET_ALL_RESPONSE_TOPIC)
        else:
            print(f"Failed to connect to MQTT broker: {rc}")

    def on_message(self, client, userdata, message):
        """Handle responses from the MQTT broker."""
        try:
            response = json.loads(message.payload.decode("utf-8"))
            self.response_data = response
            self.response_received = True
            print(f"Received response: {response}")
        except Exception as e:
            print(f"Error decoding response: {e}")

    def on_stop(self):
        """Clean up when a user stops."""
        self.client.loop_stop()

    @task
    def register_patient(self):
        """Simulate a patient registration."""
        patient_data = {
            "firstName": f"John{random.randint(1, 1000)}",
            "secondName": f"Doe{random.randint(1, 1000)}",
            "email": f"patient{random.randint(1, 100000000)}@example.com",
            "password": "password123",
            "phone": f"123-456-{random.randint(1000, 9999)}"
        }

        start_time = time.time()
        self.response_received = False
        self.client.publish(PATIENT_CREATE_TOPIC, json.dumps(patient_data))
        print(f"Published patient registration: {patient_data}")

        timeout = 5
        while not self.response_received:
            if time.time() - start_time > timeout:
                self.environment.events.request_failure.fire(
                    request_type="MQTT",
                    name="register_patient",
                    response_time=(time.time() - start_time) * 1000,
                    exception=Exception("Timeout waiting for MQTT response"),
                )
                return
            time.sleep(0.1)

        # Process the response
        if self.response_data and self.response_data.get("status") == "success":
            self.environment.events.request.fire(
                request_type="MQTT",
                name="register_patient",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(json.dumps(self.response_data)),
                exception=None,
            )
        else:
            self.environment.events.request.fire(
                request_type="MQTT",
                name="register_patient",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception(f"Error response: {self.response_data}"),
            )

    @task
    def get_all_dentists(self):
        """Simulate retrieving all dentists."""
        start_time = time.time()
        self.response_received = False
        self.client.publish(DENTISTS_GET_ALL_TOPIC, json.dumps({}))
        print("Published request to get all dentists")

        timeout = 5
        while not self.response_received:
            if time.time() - start_time > timeout:
                self.environment.events.request_failure.fire(
                    request_type="MQTT",
                    name="get_all_dentists",
                    response_time=(time.time() - start_time) * 1000,
                    exception=Exception("Timeout waiting for MQTT response"),
                )
                return
            time.sleep(0.1)

        if self.response_data and self.response_data.get("status") == "success":
            self.environment.events.request.fire(
                request_type="MQTT",
                name="get_all_dentists",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(json.dumps(self.response_data)),
                exception=None,
            )
        else:
            self.environment.events.request.fire(
                request_type="MQTT",
                name="get_all_dentists",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception(f"Error response: {self.response_data}"),
            )
            
@events.test_stop.add_listener
def test_stop(environment, **kwargs):
    print("Test finished.")