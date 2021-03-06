// Set up a collection to contain pronunciation information. On the server,
// it is backed by a MongoDB collection named "pronunciations".

Pronunciations = new Meteor.Collection("pronunciations");

if (Meteor.isClient) {
  //Find all current items
  Template.pronounce.pronunciations = function () {
      return Pronunciations.find({}, {sort: {name: -1}});
  }

  //Update the selected item
  Template.pronounce.selected_item = function () {
    var item = Pronunciations.findOne(Session.get("selected_item"));
    return item;
  };

  //Set selected item
  Template.item_template.selected = function () {
    return Session.equals("selected_item", this._id) ? "selected" : '';
  };

  Template.pronounce.events({
    'click input.submitVariation': function (event, template) {
      Pronunciations.update(Session.get("selected_item"), {$inc: {numVariations: 1}});

      var variations = Pronunciations.findOne(Session.get("selected_item")),
          newVariationNumber = "variation" + variations.numVariations,
          newVariationValue = template.find(".new_variation").value;

      Pronunciations.update(Session.get("selected_item"), {$push:{variations:{var: newVariationValue, score: 0}}});
    },

    'click input.newItem': function (event, template) {
      var name = template.find(".new_name").value,
          pronunciation = template.find(".new_pronunciation").value;

      Pronunciations.insert({name: name, variations: [ {"var": pronunciation, score:0 } ] , numVariations: 1});
    },

    'click input.upVote': function (event, template) {
      var varName = event.target.id,
        currentItem = Pronunciations.findOne(Session.get("selected_item")),
        currentVariations = currentItem.variations;

      for(var i=0; i<currentVariations.length;i++) {
        if(currentVariations[i].var == varName) {
          var currentScore = currentVariations[i].score;

          // minimongo doesn't support $ submodifier
          // Workaround found here: https://github.com/meteor/meteor/blob/master/examples/parties/model.js#L123
          var modifier = {$set: {}};
          modifier.$set["variations." + i + ".score"] = currentScore + 1;
          Pronunciations.update(Session.get("selected_item"), modifier);
        }
      } 
    },

    'click input.downVote': function (event, template) {
      var varName = event.target.id,
        currentItem = Pronunciations.findOne(Session.get("selected_item")),
        currentVariations = currentItem.variations;

      for(var i=0; i<currentVariations.length;i++) {
        if(currentVariations[i].var == varName) {
          var currentScore = currentVariations[i].score;

          // minimongo doesn't support $ submodifier
          // Workaround found here: https://github.com/meteor/meteor/blob/master/examples/parties/model.js#L123
          var modifier = {$set: {}};
          modifier.$set["variations." + i + ".score"] = currentScore - 1;
          Pronunciations.update(Session.get("selected_item"), modifier);
        }
      } 
    }
  });

  Template.item_template.events({
    'click': function() {
      Session.set("selected_item", this._id);
    }
  });
}

// On server startup, create some pronunciations if the database is empty.
if (Meteor.isServer) {

  Meteor.startup(function () {

    // Repopulate the collection every time...remove this for production
    Pronunciations.remove({});
    if (Pronunciations.find().count() === 0) {
      var data = [{"name": "GDAL",
      "pronunciations":[
        {"variation": "Gee-dahl"},
        {"variation": "Goo-dahl"}
      ]},
      {"name": "OGR",
      "pronunciations":[
        {"variation": "Oh-gee-are"},
        {"variation": "Oh-gur"}
      ]},
      {"name": "Python",
      "pronunciations":[
        {"variation": "Pie-thon"},
        {"variation": "Pih-thin"}
      ]},
      {"name": "Esri",
      "pronunciations":[
        {"variation": "Ez-ree"},
        {"variation": "Eee-ess-are-eye"}
      ]},
      {"name": "PostGIS",
      "pronunciations":[
        {"variation": "Post-Jiss"},
        {"variation": "Post-gee-eye-ess"}
      ]},
      {"name": "QGIS",
      "pronunciations":[
        {"variation": "Queue-jiss"},
        {"variation": "Queue-gee-eye-ess"}
      ]},
      {"name": "Topojson",
      "pronunciations":[
        {"variation": "Toe-po-jay-sahn"},
        {"variation": "Tah-po-jay-sahn"}
      ]},
      {"name": "Mapbox",
      "pronunciations":[
        {"variation": "Mahp-bohx"},
        {"variation": "Maap-bahx"}
      ]},
      {"name":"iD",
      "pronunciations":[
        {"variation": "Eye-dee"},
        {"variation": "ehd"}
      ]},
      {"name":"JSON",
      "pronunciations":[
        {"variation": "Jay-sahn"},
        {"variation": "Jay-sehn"}
      ]},
      {"name":"SQL",
      "pronunciations":[
        {"variation": "Ess-queue-el"},
        {"variation": "See-quell"}
      ]}];
      for (var i = 0; i < data.length; i++)
        Pronunciations.insert({name: data[i].name, variations: [ {"var": data[i].pronunciations[0].variation, score: 0}, {"var":data[i].pronunciations[1].variation, score: 0} ] , numVariations: 2});
      }
  });
}

