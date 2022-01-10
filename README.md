# Algorand Blockchain Analysis Dashboard - Frontend

## Requirements

- You will need Node.js and the npm package manager installed in your environement.
- You will need the algorand-dashboard-backend project running on your maching to provide the api for the frontend project.

### Node

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

### Backend

- Clone the repo: `git clone https://github.com/FinHubSA/algorand-dashboard-backend.git`
- Follow readme instructions to get it running and listening to the specified port.

## Configure app

- The app can be run in development or production mode.
- The settings for development and production modes are located in the root folder files .env.dev and .env.prod respectively.
- Specify the url and port that backend server is listening on in these configuration files.

## Quick start

Quick start options:

- Clone the repo: `git clone https://github.com/FinHubSA/algorand-dashboard-frontend.git`
- `npm install`

### Docker

- Copy the file docker-compose.yml and put into the root directory containing the frontend and the backend like this:
.
├── algorand-dashboard-backend
├── algorand-dashboard-frontend
└── docker-compose.yml

- From this root directory run the following commands:
- `sudo docker-compose build`
- If you get an error about archive/tar: invalid tar header run:
- `sudo chown -R 777 ./`
- This is in the folder with the frontend and backend. NB make sure you are not calling this for the root folder. REMEMBER the dot in front of the forward slash.
- `sudo docker-compose up -d`
- The app will be on localhost:3000 and the api on localhost:8000
- To stop the docker container
- `sudo docker-compose down`


### Development

- `npm run dev`

### Production

- `npm start`

## Technical Support or Questions

If you have questions or need help please [contact us](https://www.finhub.org.za/#contact-form) or open an issue.

## Acknowledgement

Big acknowledgement to Creative Tim (https://www.creative-tim.com) from which a template material-UI frontend was sourced. 

## Licensing

- Copyright 2021 Algorand-UCT Financial Innovation Hub (www.finhub.org.za)
- Licensed under MIT 

Social Media:

LinkedIn: <https://www.linkedin.com/company/algorand-uct-financial-innovation-hub/>

Web: <https://www.finhub.org.za>


