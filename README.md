# Algorand Blockchain Analysis Dashboard - Frontend

## Requirements

- You will need Node.js and the npm package manager installed in your environement.
- You will need the algorand-dashboard-backend project running on your maching to provide the api for the frontend project.

### Node

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Node installation on Mac

  First insall homebrew

      $ brew install node
  
  To install specific node version

      $ brew unlink node
      $ brew install node@6 // to install version 6
      $ brew link node@6

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

- #### Docker installation on Mac

  - $ brew install --cask docker

- Copy the file docker-compose.yml and put into the root directory containing the frontend and the backend like this:
.
├── algorand-dashboard-backend
├── algorand-dashboard-frontend
└── docker-compose.yml

- If you want to query your local db:
  - Copy the local_settings_copy.py into local_settings.py
  - Make sure you use the parameters marked for docker usage
- If you want to insert actual blockchain data:
  - Clone the algorand testing sandbox from: https://github.com/algorand/sandbox.git
  - Set the sandbox to run in dev so its faster: .active_config
  - Run the sandbox as instructed i.e. cd sandbox -> ./sandbox up
  - In localsettings, set the ALGOD_FUNDING_ADDRESS and the ALGOD_FUNDING_MNEMONIC
  - You get these by running: 
  - ./sandbox goal account list
  - This will first get you the default account address which will have some algos. Then run and put the above address below:
  - ./sandbox goal account export --address HVSTYAQWRQNIBZVXXHHTRT2MVOG54P5UHRFLM5OYT7BDXFOMZAUCQ6UY5E
- To run the tasks of creating transactions using celery you must first register a django admin:
  - docker exec -it container_id python manage.py createsuperuser
  - container id is by running the command: docker ps. Take the algorand backend container id.
  - Then go to this url: http://localhost:8000/admin/ and login using those credentials
  - Click on 'Add Periodic Task'
  - Then add the task 
- There are 2 main tasks process_blockchain_data_task and process_json_data_task.
  - process_blockchain_data_task takes the simulated data and puts it into the algorand sandbox first, then takes it from there and puts it into the dashboard DB. The indexer is used to take it from the blockchain to the app's DB.
  - process_json_data_task takes the simulated data and puts it straight into the dashboard DB without going through the algorand sandbox blockchain.
  - There are other subtasks which fall in these main tasks that can be found in the dashboard_analytics/tasks.py script.
- From this root directory run the following commands:
- `sudo docker-compose build`
- If you get an error about archive/tar: invalid tar header run:
- `sudo chown -R 777 ./`
- This is in the folder with the frontend and backend. NB make sure you are not calling this for the computer root folder because it might mess up your computer :(. REMEMBER the dot in front of the forward slash if on a linux system. If on a mac get the full path to the algorand app.
- `sudo docker-compose up -d`
- The app will be on localhost:3000 and the api on localhost:8000
- To stop the docker container
- `sudo docker-compose down`
- If you make changes to the backend code you don't need to rebuild, just run restart command to have the changes.
- `sudo docker-compose restart`

- #### Connect to postgres in docker

- Run this command to view the container ids:
```
docker ps
```
- Run this command to get into the postgres docker container:
```
docker exec -it postgres_container_id bash
psql algorand_dashboard algorand_admin
```
- Then run this command to show the tables:
`\dt`
- Then run this command to show table columns:
`select * from dashboard_analytics_transaction where false;`


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


