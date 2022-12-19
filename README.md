# Google-Authentication--NodeJs
In this project we simply use the passport google Strategy. Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application.
A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.

## Configure Strategy
The Google authentication strategy authenticates users using a Google account and OAuth 2.0 tokens. The client ID and secret obtained when creating an application are supplied as options when creating the strategy.

# Google Credentials
you must register an application with Google. If you have not already done so, a new project can be created in the [Google Developers Console](https://console.developers.google.com/). Your application will be issued a client ID and client secret, which need to be provided to the strategy. You will also need to configure a redirect URI which matches the route in your application.

1. Create a new project

2. Select the project and click credentials and the select OAuth client ID

3. Now Select Web Application in application type.

4. Input your app name or whatever else you like , in Authorized JavaScript origins add this line 'http://localhost:3000'  and in Authorized redirect URIs field add this    line 'http://localhost:5000/auth/google/callback' and the click to create .

5. Now copy your Google client ID and Google client secret.

# Structure of Project

![alt text]( "Logo Title Text 1")




