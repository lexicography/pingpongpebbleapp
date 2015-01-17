/**
 * PingPongPebble App
 *
 * This is a sample app that integrates with the open source PingPong project
 * for API monitoring. See the README for more info.
 */

var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: "PingPong",
  subtitle: "API Monitoring",
  body: "Select to check on API response times."
});

main.show();

var runKeenQuery = function(queryType, collectionName, queryParams, onSuccess) {
  var baseUrl = "http://api.keen.io/3.0";
  var params = "";
  // TODO: make this come from a real config
  var config = {
    projectId: "PROJECTIDHERE",
    readKey: "READKEYHERE"
  };
  
  queryParams.event_collection = collectionName;
  
  for (var value in queryParams) {
    params = params + "&" + value + "=" + encodeURIComponent(queryParams[value]);
  }
  params = params.slice(1);
  
  var url = baseUrl + "/projects/" + config.projectId + "/queries/" + queryType + "?" + params;
  console.log(url);
  
  ajax({
    url: url,
    type: "json",
    headers: {'Authorization' : config.readKey},
    async: true
  }, function(data) {
    onSuccess(data);
  }, function(error) {
    console.log("Error: " + error);
  });
};

main.on('click', 'select', function(e) {
  runKeenQuery("average", "checks", {
    target_property: "request.duration",
    group_by: "check.name",
    timeframe: "this_30_minutes",
    interval: "minutely"
  }, function(keenRes) {
    var items = [];
    var checks = {};
    var firstResults = keenRes.result[0].value;

    for (var ndx in firstResults) {
      checks[firstResults[ndx]["check.name"]] = {
        times: [],
        health: 'Healthy' // TODO: actually calculate the state
      };
    }

    for (var resNdx in keenRes.results) {
      var res = keenRes[resNdx];

      for (var valueNdx in res.value) {
        var val = res.value[valueNdx];
        checks[val["check.name"]].times.push(val.result);
      }
    }

    // At this point, we have all the time data points,
    // lets see what the health of the check looks like
    for (var checkKey in checks) {
      items.push({
        title: checkKey,
        subtitle: checks[checkKey].health
      });
    }

    var menu = new UI.Menu({
      sections: [{
        items: items
      }]
    });

    menu.on('select', function(e) {
      var loading = new UI.Card({
        title: "Loading Data",
        subtitle: e.item.title,
        body: "Loading last 30 minutes of data..."
      });

      loading.show();

      runKeenQuery("average", "checks", {
        target_property: "request.duration",
        group_by: "check.name",
        timeframe: "this_30_minutes",
        interval: "minutely",
        filters: JSON.stringify([{"property_name":"check.name","operator":"eq","property_value":e.item.title}])
      }, function(check) {
        var titleText = new UI.Text({
          position: new Vector2(0, 0),
          size: new Vector2(144, 25),
          text: e.item.title,
          textOverflow: 'ellipsis',
          textAlign: 'center',
          font: 'gothic-28-bold'
        });

        var subtitleText = new UI.Text({
          position: new Vector2(0, 27),
          size: new Vector2(144, 20),
          font: 'gothic-18',
          text: 'Average Response Time',
          textAlign: 'right'
        });

        // now we try to create all the rectangles for the graph
        var maxTime = 0;
        var averageTimes = []; // this will have 30 values in it

        for (var checkNdx in check.result) {
          var res = check.result[checkNdx];
          var value = res.value[0].result;

          averageTimes.push(value);

          if (value > maxTime) {
            maxTime = value;
          }
        }

        var chartBg = new UI.Rect({
          position: new Vector2(0, 50),
          size: new Vector2(144, 118),
          backgroundColor: 'white'
        });

        var checkCard = new UI.Window();
        checkCard.add(titleText);
        checkCard.add(subtitleText);
        checkCard.add(chartBg);

        // we add a 10% buffer to the top end so that the graph doesn't look bunched up
        var scalar = Math.round(maxTime * 1.1);
        var width = 3;
        var currentXPos = 23;
        var yPos = 54;
        var maxHeight = 110;

        for (var ndx in averageTimes) {
          var height = Math.floor((averageTimes[ndx] / scalar) * maxHeight);
          var currentYPos = yPos + (maxHeight - height);

          checkCard.add(new UI.Rect({
            position: new Vector2(currentXPos, currentYPos),
            size: new Vector2(width, height),
            backgroundColor: 'black'
          }));

          currentXPos += width + 1;
        }

        // now we try to add scale markers
        var firstTickMark = new UI.Rect({
          position: new Vector2(0, 84),
          size: new Vector2(3, 2),
          backgroundColor: 'black'
        });

        checkCard.add(firstTickMark);

        var firstTickText = new UI.Text({
          position: new Vector2(3, 76),
          size: new Vector2(25, 15),
          text: (Math.round(scalar * 0.667 * 100.0) / 100.0).toString(),
          color: "black",
          backgroundColor: 'white',
          borderColor: 'white',
          font: 'gothic-14'
        });

        checkCard.add(firstTickText);

        var secondTickMark = new UI.Rect({
          position: new Vector2(0, 122),
          size: new Vector2(3, 2),
          backgroundColor: 'black',
          textAlign: 'right'
        });

        checkCard.add(secondTickMark);

        var secondTickText = new UI.Text({
          position: new Vector2(3, 114),
          size: new Vector2(25, 15),
          text: (Math.round(scalar * 0.333 * 100.0) / 100.0).toString(),
          font: 'gothic-14',
          textAlign: 'right',
          backgroundColor: 'white',
          borderColor: 'white',
          color: "black"
        });

        checkCard.add(secondTickText);

        checkCard.show();
        loading.hide();
      });
    });
    
    menu.show();
  });
  
});
