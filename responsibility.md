# Thermal-X — Team Responsibilities

## Project Timeline

Hackathon: **16–17 September**

The project is divided into modules so that all 6 members can work in parallel and integrate their work during the hackathon.

---

# Member 1 & Member 2 — Data Processing + Classification (Piush & Mukesh)
Branch assign - Branch_Piush
## Responsibility
Handle the complete data pipeline from raw data to classified/predicted output.

### Tasks
- Collect and understand the available GeoJSON / thermal data
- Preprocess and clean the data
- Handle missing or invalid values
- Remove duplicate/unnecessary records
- Perform feature engineering
- Prepare the data for the classification model
- Build and test the classification model
- Generate predictions
- Generate confidence scores where applicable
- Prepare the final processed/predicted data for database storage

### Input
Raw thermal / GeoJSON data

### Output
Processed and classified thermal-event data

### Handoff
Send the final structured output to **Member 5 (Backend + MongoDB)**.

---

# Member 3 & Member 4 — Frontend + UI/UX + GIS (Pradip & Jagan)
Branch assign - Branch_Pradip
## Responsibility
Build the user-facing Thermal-X application.

### Member 3 — UI/UX
- Design the overall application layout
- Dashboard
- Navigation
- Cards and statistics
- Filters
- Event details
- Styling and responsiveness
- Overall visual consistency

### Member 4 — GIS + Frontend Integration (Prakash)
Branch assign - Branch_Prakash
# Responsibility
- Interactive map
- GeoJSON visualization
- Thermal-event markers
- Map layers
- Location-based visualization
- Connect frontend with backend APIs
- Display classification, confidence, persistence and priority

### Input
Data received from the backend API

### Output
Complete Thermal-X frontend and GIS interface

---

# Member 5 — Backend + MongoDB (Deepika)
Branch Assign - Branch_Deepika
## Responsibility
Build the backend layer and manage communication between the database, processing modules and frontend.

### Tasks
- Design the Thermal Event database structure
- Store processed/predicted data in MongoDB Atlas
- Create REST APIs
- Fetch thermal events from MongoDB
- Provide data to the React frontend
- Handle API errors and validation
- Integrate the backend with the other modules

### Main Flow

Processed Data
→ Backend
→ MongoDB Atlas
→ REST API
→ React

### Input
Processed/predicted data from Members 1 & 2

### Output
MongoDB data + REST APIs

---

# Member 6 — Thermal Analysis

## Responsibility
Handle spatial and temporal analysis of thermal observations and identify persistent thermal events.

### Tasks
- Analyze thermal observations based on location
- Perform spatial analysis
- Perform temporal analysis
- Group nearby/repeated observations
- Detect recurring/persistent thermal activity
- Calculate persistence-related information
- Analyze supporting evidence
- Develop priority/risk logic
- Produce explainable evidence for the identified events

### Main Flow

Cleaned Thermal Data
→ Spatial Analysis
→ Temporal Analysis
→ Persistent Event Detection
→ Evidence Analysis
→ Priority

### Input
Cleaned data from the data-processing module

### Output
Persistent thermal events with analysis/evidence/priority information

---

# Module Integration

The complete Thermal-X pipeline will be:

Raw Data
↓
Data Preprocessing
↓
Feature Engineering
↓
Thermal Analysis
↓
Persistent Event Detection
↓
Classification
↓
Evidence + Priority
↓
MongoDB Atlas
↓
REST API
↓
React + GIS
↓
Thermal-X Dashboard

---

# Team Integration Rules

1. Each member should keep their module/code organized.
2. Define the input and output format before integration.
3. Do not wait until the final day to integrate.
4. Test each module independently first.
5. Regularly share working outputs with the dependent module.
6. Keep common data formats consistent across modules.
7. Document important decisions and algorithms.
8. Keep the main branch stable.

---

# Hackathon Review Progress

## Review 1
- Data collection
- Data preprocessing
- Initial frontend
- Initial backend setup

## Review 2
- Persistent thermal-event detection
- Classification
- Working database structure
- Frontend map prototype

## Review 3
- Evidence fusion
- Priority/risk output
- Backend APIs
- Real data displayed on frontend

## Final Review
Complete integrated Thermal-X system:

Data
→ Analysis
→ Classification
→ Priority
→ MongoDB
→ API
→ React + GIS



**Rule:** Everyone must work only on their assigned branch.
All completed work will be merged into `main` later.