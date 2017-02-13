#Building an Alexa skill with Qrvey API
This a sample for building an Alexa skill (https://developer.amazon.com/alexa) using Qrveys' API  (https://qrvey.com).

## Alexa skill examples and instructions
I used the samples available on github to build this skill. Could not find a link to the original samples as they seem to have moved to a new repository but here's a link to closest one I could find. It has the intstructions on how to setup the lambda function and configure the skill in Amazon's developer portal.

https://github.com/alexa/skill-sample-nodejs-trivia

## API Reference

More information about Qrvey API can be found at https://www.qrvey.com/developers.html

API documentation is available at https://apidocs.qrvey.com


## How to run
After setting up the Lambda function and registering the skill in developer portal

1. Update APP_ID, APP_URL, APIKEY, userid, myemail in index.js and your_lambda_function_name in gulpfile.
2. Run 'gulp build' to deploy the code and test the skill in developer portal or a configured device.

## Result
Here's a video of my test

https://youtu.be/L-JR7_PdA6M
