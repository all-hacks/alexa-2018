'use strict'

var config = require('../models/config')
var skill = require('../index').skill
var respond = require('./respond')
var utils = require('./utils')
var quotes = require('../models/quotes')

function processUtterance ( intent, session, request, response, utterance ) {

  console.log("quotes -> " + JSON.stringify(quotes));

  utterance = ( utterance || '' ).toLowerCase()

  console.log("utterance -> " + utterance);

  var intentHandlers = skill.intentHandlers

  console.log("processUtterance::intentHandlers -> " + JSON.stringify(intentHandlers));

  Object.keys( config.commands ).forEach( function ( intentName ) {
    if ( utils.getCommandsForIntent( intentName) .indexOf( utterance ) > -1 ) {
      console.log("call intent -> " + intentName);

      intentHandlers[ intentName ]( intent, session, request, response )
      return // exit
    }
  })


  var currentScene = utils.findResponseBySceneId( session.attributes.currentSceneId )

  console.log("current scene -> " + JSON.stringify(currentScene));


  if (!currentScene || !currentScene.options) {
    utils.swapScenes();
    
    intentHandlers["LaunchIntent"](intent, session, request, response)
    return
  }

  // incase this scene uses the previous scenes options
  if ( currentScene.readPreviousOptions ) {
    var previousSceneId = session.attributes.breadcrumbs[ session.attributes.breadcrumbs.length -1 ]
    currentScene = utils.findResponseBySceneId( previousSceneId )
  }

  var option = currentScene.options.find( function ( option ) {
    return ( option.utterances.indexOf( utterance ) > -1 )
  })

  // option found
  if ( option ) {
    var nextScene = utils.findNextScene( currentScene, option );

    // get random quote, this is you win scene
    if (nextScene.color == "green") {  
      let quote = "\"" + quotes[Math.floor(Math.random() * quotes.length)] + "\"";
      nextScene.card.text += quote;
      nextScene.voice.intro += quote;
    }

    session.attributes.breadcrumbs.push( currentScene.id )
    session.attributes.currentSceneId = nextScene.id
    respond.readSceneWithCard( nextScene, session, response )
  }

  // no match
  else {
    intentHandlers.UnrecognizedIntent( intent, session, request, response )
  }

}

module.exports = processUtterance
