
<p align="center">
<img src="https://github.com/cmusv-fse/18652-fse-f23-group-project-sb-5/assets/143555875/9a503eeb-851e-4485-8959-a06bcc755a8b" height="400"/>
</p>

# Emergency Social Network
> Author: Group SB5
## Technologies
### Frontend 
  - EJS: A template system for generating web page dynamic data provided by Node.js.
  - CSS: For styling the frontend pages.
  - JavaScript: For implementation of interactive behaviors in web pages.
  - Bootstrap: A well-known UI component dependency.
  - JQuery: A great tool to simplify JavaScript code.
### Backend
  - Node.js: A powerful JavaScript-based runtime environment for building server-side application.
  - Express.js: A framework works on Node.js which makes easier to develop application's functionalities like routings and middlewares.
  - Passport.js: A middleware dependency for user authentication and authorization.
  - Socket.io: Provides event-based real-time communication between clients and server, for functions like dynamic status update.
  - Swagger UI: For backend API documentation. 
### Database
  - MongoDB: A NoSQL database which is a great fit for Node.js, and it provides flexibility to change the database design.
### Development Tools
  - Nodemon: Automatically restarting the node application when file changes are detected.
## File Structure
```
├── src                     
│   ├── controllers      # Responsible for handling incoming requests and returning responses.
│   ├── models           # Models of objects.
│   ├── public           # Contains static files.
│   │   ├── js           # js
│   │   ├── images       # images
│   │   ├── css          # css
│   ├── routes           # Contains router files used to route requests to controllers.
│   ├── services         # Files with actual business logic used to access the database. 
│   └── views            # Contains frontend files.
├── app.js               # main entry point
└── package.json           
```
## API Documentation
Our [RESTful API](http://localhost:3000/docs) is documented using Swagger.io, offering an interactive interface for exploring the API and testing its capabilities.