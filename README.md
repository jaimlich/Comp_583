# Snow Mountain Tracker

## Overview
Snow Mountain Tracker is a free-to-use application that provides real-time snowfall updates, secure ski lift booking, and trip coordination tools for skiing enthusiasts, resort managers, and casual tourists.

## Project Structure
- **backend/**: Node.js/Express server for API endpoints, database integration (MySQL), caching, and third-party services.
- **frontend/**: Next.js (React) application using Mapbox GL JS and Chakra UI for an interactive map-based UI.

## Setup Instructions

### **Enviornment Files to add for utilizing APIs**
These instructions must be followed to utilize the APIs, for security reasons the API keys will not be displayed to the public.<br />
Follow the steps below to recreate the ".env" files

*Everywhere you see a ".env.example" or anything similar, you will remove the ".example" part of the file and input your own secret/personal API keys in there.*
Listed below are all the locations of the .env files that you must edit/fill in with your API keys and other information.

Mapbox API (Map): https://www.mapbox.com/<br />
IP Info (Gelocation): https://ipinfo.io/<br />
Visual Crossing API (Weather): https://www.visualcrossing.com/weather-api/<br />
MySQL (Database): https://www.mysql.com/<br />

1. Root Directory<br />
/.env.example -> /.env
```
NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_key_here
```
<br />

2. Frontend Directory /frontend<br />
/frontend/.env.local.example -> /frontend/.env.local
```
NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Backend Directory /backend<br />
/backend/.env.example -> /backend/.env<br />
```
PORT=5000
IPINFO_TOKEN=ipinfo_token_here
VISUAL_CROSSING_WEATHER_API_KEY=visual_crossing_weather_api_key_here
REACT_APP_MAPBOX_TOKEN=react_app_mapbox_token_here
NODE_ENV=development
DATABASE_ENABLED=false
MYSQL_HOST=mysql_host_here
MYSQL_USER=mysql_user_here
MYSQL_PASSWORD=mysql_password_here
MYSQL_DATABASE=mysql_database_here
```

### Running via Docker
1. Install Docker
   <br />Depending on what OS you use, check the link here: https://docs.docker.com/get-started/get-docker/
   <br />*Note - on Windows, ensure you have added the bin folder of Docker as a system path.*
   <br />Enviornment Path (example): ```C:\Program Files\Docker\Docker\resources\bin```
   <br />
2. Navigate to the root directory of this project
   <br />
   ```
   backend/
   database/
   frontend/
   ```
3. Run the following command: ```docker-compose up --build```
4. Visit the following webpage to view the frontend (main entry) of the web application: http://localhost:3000/ <br />
   Visit the following webpage to view the backend (debugging) of the web applicaiton: http://localhost:5000/

### Running the Web Application Locally

#### Backend
1. Navigate to the `backend/` folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your API keys and database connection details (see sample).
4. Start the server with `npm run dev` for development or `npm start` for production.

#### Frontend
1. Navigate to the `frontend/` folder.
2. Run `npm install` to install dependencies.
3. Create a `.env.local` file with your Mapbox token.
4. Start the development server with `npm run dev`.

## Deployment
- **Local:** Use the above instructions to run both backend and frontend locally.
- **EC2:** Deploy the backend (Node.js/Express) on an AWS EC2 instance (or via Docker/AWS Elastic Beanstalk). The frontend can be deployed on Vercel or AWS Amplify.
- **Network Routing:** Use Nginx as a reverse proxy to route requests to the backend and serve static assets.
- **CI/CD:** Use GitHub Actions or AWS CodePipeline for automated testing and deployment.

## Database Setup
- Use MySQL to store booking data and other application data.
- Update the `DATABASE_URL` in `backend/.env` with your MySQL connection string.

## Free-tier API Usage Limits
1. Visual Crossing (Weather API): Limit at 1K per day
2. Mapbox (Map API): 50K total
3. IPInfo (Geolocation lookup - locate me feature): 50k lookups per month. No additional lookups

## Future Mobile Porting
- The frontend built with React/Next.js can share components with a React Native mobile application for easy porting to iOS.

## Implementation Plan
1. **Initial Setup (Weeks 1–2):**
   - Finalize project requirements, gather API keys, and set up development environments.
   - Configure Git repository and project management tools.
2. **Frontend Development (Weeks 3–4):**
   - Build the basic UI with Next.js and integrate Mapbox GL JS.
   - Develop interactive map components and responsive design using Chakra UI.
   - Implement geolocation detection and user-driven search.
3. **Backend Development (Weeks 5–6):**
   - Build RESTful API endpoints with Express.
   - Integrate OpenWeatherMap, ipinfo.io, and Stripe.
   - Implement caching and error handling.
4. **Integration & Testing (Week 7):**
   - Connect frontend with backend endpoints.
   - Conduct testing for functionality, performance, and error handling.
5. **Deployment & Refinement (Week 8):**
   - Deploy the application using AWS (EC2, Nginx) and Vercel/AWS Amplify.
   - Optimize performance and security.
   - Finalize documentation and prepare for demonstration.
