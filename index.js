

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.[your-unique-value-here]";//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var APP_URL = "[your-qrvey-url-here]";
var APIKEY = "[your-qrvey-apikey-here]";
var userid = "[your-qrvey-unique-userid-here]";
var myemail = "[your-email]";

var request = require("request");

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var _ = require('lodash');
var AWS = require('aws-sdk');

var ses = new AWS.SES({region: "us-east-1"});

/**
 * QrveyAPISkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var QrveyAPISkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
QrveyAPISkill.prototype = Object.create(AlexaSkill.prototype);
QrveyAPISkill.prototype.constructor = QrveyAPISkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
QrveyAPISkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
QrveyAPISkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("QrveyAPISkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    getWelcomeResponse(response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
QrveyAPISkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

QrveyAPISkill.prototype.intentHandlers = {
    "GetSurveyListIntent": function (intent, session, response) {
        handleGetSurveyListIntent(session, response);
    },

    "GetSurveyTemplatesIntent": function (intent, session, response) {
        handleGetSurveyTemplateIntent(session, response);
    },
    "CreateSurveyFromTemplate": function (intent, session, response) {
        handleCreateSurveyFromTemplate(intent, session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask, what are my qrveys";

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.YesIntent": function(intent, session, response){
        handleYesIntent(intent, session, response);
    },

    "AMAZON.NoIntent": function(intent, session, response){
         var speechOutput = "Ok, Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Qrvey";
    var repromptText = "With Kur-vey, you can create a new survey using a template. You can say How many surveys do I have? Or ask me to plan a vacation or trip";
    var speechText = "<p>Welcome to Kur-vey</p> <p>what would you like to do?</p>";
    var cardOutput = "Welcome to Qrvey, What would you like to do?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

function handleGetSurveyListIntent(session, response) {
    var speechText = "";

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say, get my surveys";

    request.get({
        url: APP_URL + '/user/' + userid + '/survey', headers: {
            'x-api-key': APIKEY
        }
    }, function (err, httpResponse, body) {
        if (err) return done(err);

        console.log("Got response for Qrvey API")
        console.log(body);

        var jsonBody = JSON.parse(body);

        if (jsonBody.Items && jsonBody.Items.length > 0) {

            speechText = "You have " + jsonBody.Items.length + " surveys";

        } else {
            speechText = "You do not have any surveys";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
    });
}

function handleGetSurveyTemplateIntent(session, response) {
    var speechText = "";

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say, get my surveys";

    getTemplatesList(function (err, jsonBody) {
        if (err) return done(err);

        if (jsonBody && jsonBody.length > 0) {

            speechText = "You have " + jsonBody.length + " survey templates";

        } else {
            speechText = "You do not have any survey templates";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
    });
}

function getTemplatesList(done) {

    request.get({
        url: APP_URL + '/survey/templates', headers: {
            'x-api-key': APIKEY
        }
    }, function (err, httpResponse, body) {
        if (err) return done(err);

        console.log("Got response for Qrvey API")
        console.log(body);

        var jsonBody = JSON.parse(body);

        done(null, jsonBody);
    });
}

function handleCreateSurveyFromTemplate(intent, session, response) {
    var speechText = "";
    //var speechText = "you said " + intent.slots.Template.value;

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say, Yes or No";

    getTemplatesList(function (err, templatesList) {
        var template = getMatchingTemplate(intent.slots.Template.value, templatesList);

        if (template) {
            speechText = "I found a matching template called " + template.name + ". Would you like to use it?"
            session.attributes.stage = 1;
            session.attributes.templateJson = template;
        }else{
            speechText = "I could not find any matching templates. Try another option";
            session.attributes.stage = 0;
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
    });


}

function getMatchingTemplate(templateName, templatesList){
    var searchString = templateName;

    if(templateName.toLowerCase().indexOf("vacation") >= 0) searchString = "vacation";
    else if (templateName.toLowerCase().indexOf("trip") >= 0) searchString = "vacation";
    else if (templateName.toLowerCase().indexOf("event") >= 0) searchString = "event";

    console.log("matching template for: " + searchString);

    return _.find(templatesList, function(tmplt){
        return tmplt.name.toLowerCase().indexOf(searchString) >= 0;
    })

}

function handleYesIntent(intent, session, response) {

    var speechText = "";
    //var speechText = "you said " + intent.slots.Template.value;

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "You can say, Yes or No";

    if (session.attributes.stage == 1) {
        createSurveyUsingAPI(session.attributes.templateJson, function (err, qDetails) {
            if(err) return response.tell("There was an error. Please try again later");

            session.attributes.stage = 2;
            session.attributes.qrveyid = qDetails.qrveyid
            speechText = '<speak>A survey with ID <say-as interpret-as="spell-out">' + qDetails.qrveyid + '</say-as> has been created. Would you like to activate and send it?</speak>';
            console.log(speechText);

            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
        });
    }else if (session.attributes.stage == 2){

        activateSurveyUsingAPI(session.attributes.qrveyid, function (err, actDetails) {
            if(err) return response.tell("There was an error. Please try again later");

            session.attributes.stage = 0;
            speechText = '<speak>Survey is active. You can use lookup code <say-as interpret-as="spell-out">' + actDetails.lookupID + '</say-as> to answer it.</speak>';
            repromptText = "Would you like to continue?";
            console.log(speechText);

            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
        });
    } else {
        var speechText = "This is not a valid option."
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, "Qrvey API", speechText);
    }

}

function createSurveyUsingAPI(template, done){
    var qModel = {
        name: template.name,
        description: template.description,
        templateid: template.templateID,
        duration: {
            number: 1,
            period: "day",
            neverExpires: true
        }
    }
    request.post({
        url: APP_URL + '/user/' + userid + '/survey', json: qModel, headers: {
            'x-api-key': APIKEY
        }
    }, function (err, httpResponse, body) {
        if (err) return done(err);

        console.log("Got response for Qrvey API")
        console.log(body);

        //var jsonBody = JSON.parse(body);

        done(null, body);
    });
}

function activateSurveyUsingAPI(qrveyid, done){

    request.post({
        url: APP_URL + '/user/' + userid + '/survey/' + qrveyid + '/activate', json: {}, headers: {
            'x-api-key': APIKEY
        }
    }, function (err, httpResponse, body) {
        if (err) return done(err);

        console.log("Got response for Qrvey API")
        console.log(body);

        //var jsonBody = JSON.parse(body);
        var toEmail = [myemail];
        var subject = "You have a new Qrvey";
        var htmlBody = "<html><head></head><body>Hi you have a new Survey. Use this link to Answer it: <br/><br/> " + body.url + "</body></html>";

        sendEmail(toEmail, subject, htmlBody, function(err, data){
            done(null, body);
        });
    });
}

function sendEmail(toemail, subject, htmlBody, done) {
    // send to list
    //var toemail = ['amit@qrvey.com']
    
    // this must relate to a verified SES account
    var fromemail = myemail;
    
    
    // this sends the email
    ses.sendEmail( { 
        Source: fromemail, 
        Destination: { ToAddresses: toemail },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: htmlBody,
                }
            }
        }
    }
    , function(err, data) {
        if(err) {
            console.log(err);
            return console.log('Email failed to send');
        }
        console.log("Email sent");

        //console.log('Email sent:');
        //console.log(data);
        done(err, data);
    });
}


exports.handler = function (event, context) {
    // Create an instance of the QrveyAPI Skill.
    var skill = new QrveyAPISkill();
    skill.execute(event, context);
};
