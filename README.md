# Pingpong Pebble App
This beta Pebble App requires a running [Pingpong](https://github.com/keen/pingpong) instance. You will also need a [Keen IO](http://keen.io) account to add your project and read keys.

This app was written as a demo for integrating [Keen IO](http://keen.io) into a Pebble app. It does work, but there are lots of improvements that could be made, and there's a good chance some of the charting math is a little off.

The app lets you browse the different API check's set up in Pingpong and see the last 30 minutes of average response times in a small bar graph.

![Pingpong Pebble App example](https://raw.githubusercontent.com/keen/pingpongpebbleapp/master/img/screen_shot.png)

## Installation

Create a new pebble app on [cloudpebble.net](http://www.cloudpebble.net) and choose to make a new pebble.js app. Copy the app.js into the main js file for the app, and add your projectId and readKey from your [Pingpong](https://github.com/keen/pingpong) [Keen IO](http://keen.io) collection.

```ruby
  var config = { 
    projectId: "PROJECTIDHERE",
    readKey: "READKEYHERE"
  };  
```

## Contributions

Feel free to use this as a template for another application, or build this out as a cool monitoring tool.
