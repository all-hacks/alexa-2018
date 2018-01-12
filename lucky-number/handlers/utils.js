'use strict'

var config = require('../models/config.json')
var scenes = require('../models/scenes.json')

var utils = {

  swapScenes: function () {
    var arr = [2, 3, 4];
    arr = shuffle(arr);

    console.log("arr -> " + arr);

    scenes[2].id = arr[0];
    scenes[3].id = arr[1];
    scenes[4].id = arr[2];

    console.log("utils scenes -> " + JSON.stringify(scenes));    

  },

  getSkillName: function () {
    return config.skillName
  },

  getCommandsForIntent: function ( intentName ) {
    return config.commands[ intentName ]
  },

  findFirstScene: function () {
    return scenes[0]
  },

  findResponseByType: function ( type ) {
    return cloneScene( config.responses[ type ] )
  },

  findResponseBySceneId: function ( sceneId ) {
    var scene = scenes.find( function ( scene ) {
      return scene.id === sceneId
    })
    return cloneScene( scene )
  },

  findNextScene: function ( currentScene, option ) {
    var nextScene = utils.findResponseBySceneId( option.sceneId )
    if ( nextScene.readPreviousOptions ) {
      var index = currentScene.options.indexOf( option )
      currentScene.options.splice( index , 1 ) // remove current option
      nextScene.options = currentScene.options
    }
    return nextScene
  },

  findPreviousScene: function ( session ) {
    var sceneId = session.attributes.breadcrumbs[ session.attributes.breadcrumbs.length -1 ]
    return utils.findResponseBySceneId( sceneId )
  }

}

module.exports = utils

function cloneScene ( scene ) {
  var scene   = Object.assign( {}, scene )
  scene.card  = Object.assign( {}, scene.card )
  scene.voice = Object.assign( {}, scene.voice )
  if ( 'options' in scene ) scene.options = scene.options.slice()
  return scene
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
