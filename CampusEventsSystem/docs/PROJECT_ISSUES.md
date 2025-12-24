# Campus Events System — Project Issues Log

This document lists the main issues encountered during the development of the Campus Events System project, along with their resolution status.  
It demonstrates problem identification, troubleshooting, and resolution as part of the software engineering process.

---

## Issue 1: Git Branch Deletion — kamel-branch-temp Worktree Issue

**Status:** Resolved  

**Description:**  
An issue occurred when attempting to delete a temporary Git branch that was still attached to an active worktree. Git prevented the deletion to avoid data loss.

**Resolution:**  
The worktree was properly detached, and the branch was safely removed after switching to a different branch.

---

## Issue 2: Incomplete Use Case Diagram

**Status:** Resolved  

**Description:**  
The initial use case diagram was missing important system features, specifically authentication-related actions and admin management functionalities.

**Resolution:**  
The diagram was reviewed and updated to include all relevant student and admin use cases, ensuring alignment with the implemented system features.

---

## Issue 3: Draw.io XML Fragility

**Status:** Resolved  

**Description:**  
Manual editing of Draw.io diagram XML files caused formatting corruption, making the diagrams unreadable.

**Resolution:**  
Diagram edits were performed only through the Draw.io graphical editor, avoiding direct XML modification.

---

## Issue 4: Docker / WSL Setup Failure

**Status:** Resolved  

**Description:**  
Docker and WSL setup failed on the local machine, preventing Docker-based deployment during development.

**Resolution:**  
Docker was deemed unnecessary for the current development phase. The project was successfully run using local Node.js deployment instead.

---

## Issue 5: PowerShell Execution Policy Blocking npm Scripts

**Status:** Resolved  

**Description:**  
PowerShell execution policies prevented npm scripts from running, causing issues when starting the backend server.

**Resolution:**  
The execution policy was adjusted to allow script execution, enabling npm commands to run normally.

---

## Issue 6: Unclear Deployment Documentation

**Status:** Open (Planned Improvement)  

**Description:**  
The initial deployment documentation did not clearly distinguish between local deployment and Docker-based deployment, leading to confusion.

**Planned Resolution:**  
Deployment documentation will be improved to clearly explain local deployment as the current setup and Docker as an optional, future enhancement.

---

## Current Project Status

- Frontend and backend are fully operational
- No blocking issues remain
- System is stable and ready for evaluation

---

## Notes

This issue log is maintained to document development challenges and demonstrate effective problem-solving during the project lifecycle.
