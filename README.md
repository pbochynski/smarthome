[![Build Status](https://travis-ci.org/pbochynski/smarthome.svg?branch=master)](https://travis-ci.org/pbochynski/smarthome)

# Smarthome

## Requirements

Install MongoDB and set MONGO_URL environment variable

## Install & run

    npm install
    npm start
    
## Deployment to CloudFoundry

Modify manifest.yml and set MONGO_URL. Then deploy first time using:

    cf push -f manifest.yml
      
Blue-green deployment is done by Travis CI. Set proper values in .travis.yml file, 
configure MONGO_URL environment variable in your travis settings, and push the changes to repository.



