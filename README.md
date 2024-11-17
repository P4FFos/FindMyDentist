# System Architecture
Our team decided to use a Service-Oriented Architecture (SOA) with a dual-database strategy to improve both security and availability. The system will rely on a main database that stores all essential data for dentists, patients, appointments, and logs/statistics. A second database, functioning as a real-time replica of the main one, will ensure data redundancy, enhancing data security, high availability, and disaster recovery. The architecture is split into two main subsystems: one for dentists and the other to patients. These subsystems will communicate with the frontend through an API. Additionally, to manage appointments and notifications services an MQTT broker will be used, utilising a publish/subscribe style to manage communication and ensure efficient coordination between the dentist and patient subsystems

### Component Diagram 
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/Component%20diagram.png?ref_type=heads)

### ER Diagram
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/development/docs/ER%20Diagram.png?ref_type=heads)
