# Campus Events System — Deployment Guide

This document explains how to run and deploy the Campus Events System for development and evaluation purposes as part of the course project.

---

## Deployment Overview

The Campus Events System is currently deployed **locally**.  
It follows a client–server architecture consisting of:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Database: SQLite

The system can be run locally using Node.js, and it is structured to be Docker-ready for future deployment.

---

## Local Deployment (Current Setup)

This is the deployment method currently used for development and testing.

### 1. Clone the repository
```bash
git clone https://github.com/kamel1314/Software-Project.git
cd Software-Project/CampusEventsSystem
