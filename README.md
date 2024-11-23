# System Architecture
Our team decided to use a **Service-Oriented Architecture (SOA)** with a dual-database strategy to improve both security and availability. The system will rely on a main database that stores all essential data for dentists, patients, appointments, and logs/statistics. A second database, functioning as a real-time replica of the main one, will ensure data redundancy, enhancing data security, high availability, and disaster recovery. The architecture is split into two main subsystems: one for dentists and the other for patients and two services (Notification and Appointment). Subsystems communicate with the frontend through an API and use CRUD operations to communicate with the Database, while services use MQTT topics to send and receive needed data  

**Subsystem: Patient**
- Authentication: Manages user authentication, handling patient registration and login
- Booking Handler: Responsible for booking appointments, with CRUD operations for creating, modifying, and canceling bookings within the main database

**Subsystem: Dentist**
- Authentication: Manages dentist registration and login
- Scheduler: Helps dentists to manage their availability and appointment slots 
- Appointment Handler: Manages the lifecycle of appointments, including confirmation and rescheduling

**Notification Service**
- NodeMailer: Manages email notifications
- Notification Handler: Subscribes to topics in order to send notification
- Notification Sender: Sends notifications based on the topic

**Appointment Service**
- Appointment Controller: Coordinates the scheduling and updating of appointments. It communicates with both the Dentist and Patient subsystems

**An MQTT broker** is used to manage appointments and notifications services, utilising a publish/subscribe pattern to manage communication and ensure efficient coordination between the dentist and patient subsystems.

**QoS Level 1:** We decided to use Quality of Service (QoS) Level 1 for the MQTT broker configuration, as it provides a balance between reliability and speed. This level ensures that messages are delivered at least once, addressing our need to avoid data loss (QoS 0) while maintaining fast system responsiveness (unlike QoS 2)

### Component Diagram 
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/Component%20diagram.png?ref_type=heads)

### ER Diagram
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/ER%20Diagram.png?ref_type=heads)

### MQTT Diagram 
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/MQTTDiagram.png?ref_type=heads)

### SPEM 2.0 Diagram
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/SPEM%202.0%20diagram.png?ref_type=heads)