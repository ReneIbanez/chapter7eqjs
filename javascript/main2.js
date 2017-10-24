// this is are map
var plan = ["############################",
            "#      #    #      o      ##",
            "#                          #",
            "#          #####           #",
            "##         #   #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o             #",
            "# o  #         o       ### #",
            "#    #                     #",
            "############################"];


document.getElementById("start").onclick = go;
document.getElementById("stop").onclick = freeze;
// setting are coorfdinites
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
// plus meathod to return a new vector with updated coordinites
Vector.prototype.plus = function(other) {
  //todo a conditional to max x+x < 10 and y+y < 10
  return new Vector(this.x + other.x, this.y + other.y);
}

//constructor for Grid to start to build a grid to start to make the plan array come to life
function Grid(width, height) {
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
  }
// going to see if it in the vector coordinates you have created
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height;
};
// 
Grid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value != null)
        f.call(context, value, new Vector(x, y));
    }
  }
};

//these next two methods finding the position in the array and setting or getting the value from that position in the space array

Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y];
};
// takes a two deminaial array and turn it into a singal demitianal array
Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};

// object of strings and new object vector.plus (vector.x >= 0 && vector.x < this.width &&)
var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
};
//used with directions array it will move critters random directions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
var directionNames = "n ne e se s sw w nw".split(" ");

//empty function that helps creat the wall in the world
function Wall(){
  }

function BouncingCritter() {
  this.direction = randomElement(directionNames);
};
//this will have the critter look to make sure the space is empty or go south
BouncingCritter.prototype.act = function(view) {
  if (view.look(this.direction) != " ")
    this.direction = view.find(" ") || "s";
  return {type: "move", direction: this.direction};
};

// In elementFromChar, first we create an instance of the right type by looking up the character’s constructor
// and applying new to it.

// it taking the legend creating a new object form the legend and returning a new object
function elementFromChar(legend, ch) {
  if (ch == " ")
    return null;

//it is taking the legend and creating a new object from the legend and returning that new object
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}

function charFromElement(element) {
  if (element == null)
    return " ";
  else
    return element.originChar;
}

function View(world, vector) {
  this.world = world;
  this.vector = vector;
}
//detecting connection and if the critter is going into another object. returning # or char at the target

View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir ]);
  if (this.world.grid.isInside(target))
    return charFromElement(this.world.grid.get(target));
  else
    return "#";
};

View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions)
    if (this.look(dir) == ch)
      found.push(dir);
  return found;
};

View.prototype.find = function(ch) {
  var found = this.findAll(ch);
  if (found.length == 0) return null;
  return randomElement(found);
};


function World(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;
 // map.forEach for every item inside the array do this
  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x++)
      grid.set(new Vector(x, y),
               elementFromChar(legend, line[x]));
  });
}

//
World.prototype.toString = function() {
  var output = ""; //resets
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += "\n";
  }
  return output;
};


World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest))
      return dest;
  }
};
//  let the critter move
World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) == null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
};
//checking to see if the critter has acted
World.prototype.turn = function() {
  var acted = [];
  this.grid.forEach(function(critter, vector) {
    if (critter.act && acted.indexOf(critter) == -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
};
//sets the legend into a world object and the plan array to create the world and how it looks
var world = new World(plan, {"#": Wall,"o": BouncingCritter});

// for (var i = 0; i < 5; i++) {
//   world.turn();
//   console.log(world.toString());
//   }

var goWorld = null;
function go(){
  goWorld = setInterval(function(){
    world.turn();
    document.getElementById("display").innerHTML = '<pre>'+world+'</pre>' ;
  },400);
}


function freeze(){
  clearInterval(goWorld);
}
