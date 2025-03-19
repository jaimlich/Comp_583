# Snow Mountain Tracker

## Overview
Snow Mountain Tracker is a free-to-use application that provides real-time snowfall updates, secure ski lift booking, and trip coordination tools for skiing enthusiasts, resort managers, and casual tourists.

## Project Structure
- **backend/**: Node.js/Express server for API endpoints, database integration (PostgreSQL), caching, and third-party services.
- **frontend/**: Next.js (React) application using Mapbox GL JS and Chakra UI for an interactive map-based UI.

## Setup Instructions

### Backend
1. Navigate to the `backend/` folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your API keys and database connection details (see sample).
4. Start the server with `npm run dev` for development or `npm start` for production.

### Frontend
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
- Use PostgreSQL to store booking data and other application data.
- Update the `DATABASE_URL` in `backend/.env` with your PostgreSQL connection string.

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
