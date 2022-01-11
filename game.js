// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
	this.name = name;
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
	this.currentFace = motionType.RIGHT;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
	if (node.nodeName != "rect" ) {continue;}

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var DOG_SIZE = new Size(40, 40);        // The speed of a bullet


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var name_Tag = null;
var BULLET_FULL = 8; 						// The maximum number of bullets
var total_game_time = 120;					// initial time
var remaining_time = 0;						// time displayed in game
var remaining_time_Timer = null;			// device for timer
var width_of_timer_device=null ;			// device for width of timer
var width_of_timer = 0;						// width of timer
var MATERIAL_SIZE = new Size(15, 15);		// size of material
var exit_allowed = false;					// if exit is allowed, used in material and gameover (?)
var disappearingPlatform_first = null;
var disappearingPlatform_second = null;
var disappearingPlatform_third = null;		// the three disappearing platforms
var PORTAL_SIZE = new Size(40, 80);			// size of protal
var willBeTrans = false;					// status of portal
var isCheatMode = false;					// the on off of cheatmode
var EXIT_SIZE = new Size(50, 60);			// size of exit_door
var shootSound = new Audio("Gun+Shot2.wav");// gunshot sound
var passSound = new Audio("applause10.wav");		// played when at exit_point
var dogSound = new Audio("chasdog.wav");	// dogs win
var dogDeadSound = new Audio("dogwhine.wav"); //dogs dead
var bgSound = new Audio("52908__m-red__winning.mp3");
bgSound.loop = true;



//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

	bgSound.play();
}

//
//This function restarts the game
//

function restart(name) {

// Remove objects

cleanUpGroup("player_name", false);
cleanUpGroup("dogs", false);
cleanUpGroup("bullets", false);

svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
name=name;

initializeByButton(isZoomMode);

}




//
// This function initializes the game
//

function initializeByButton(isZoom) {

name = prompt("How can I call you?", name);
if(name == "") {name = "Anonymous";}

svgdoc.getElementById("starting_screen").style.setProperty("visibility", "hidden", null);

isCheatMode = false;
isZoomMode = isZoom;

if(isZoomMode)	{zoom = 2.0;}
level = 0;
score = 0;
remaining_time = 0;

// Create the exit door
createExitDoor();

// Initialize a stage
initializeStage();
}

function initializeStage() {

	clearInterval(gameInterval);
	clearInterval(remaining_time_Timer);
	clearInterval(width_of_timer_device);

// Remove previous dogs or bullets

	cleanUpGroup("player_name", false);
	cleanUpGroup("dogs", false);
	cleanUpGroup("bullets", false);

// Create the player
	player = new Player();

// Display the player name
	svgdoc.getElementById("name_value").childNodes[0].data = name;
	name_Tag = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	name_Tag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
	svgdoc.getElementById("player_name").appendChild(name_Tag);
	name_Tag.setAttribute("x", player.position.x);
	name_Tag.setAttribute("y", player.position.y - 5);



// Setup the game



	willBeTrans = false;

	remaining_time += total_game_time;
	
	width_of_timer = remaining_time;

	player.bullet = BULLET_FULL;

	svgdoc.getElementById("score").childNodes[0].data = score;

	svgdoc.getElementById("bulletNum").childNodes[0].data = player.bullet;

//dogBullet = 1;



// Create the dogs

    createDog();
    


// Create the good things

	createMaterial();



// Create disappearing platforms

	initializeDisappearingPlatforms();

// Start the timer

	remaining_time_Timer = setInterval("timing()", 1000);
	width_of_timer_device = setInterval("timing_timer()", 100);

// Start the game interval

gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

}




//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

// This is a helper function for timer

function timing() {

	remaining_time=remaining_time-1;
	svgdoc.getElementById("time_remaining").childNodes[0].data = remaining_time;
//width_of_timer=remaining_time;
	//svgdoc.getElementById("time_remaining_bar").setAttribute("width", Math.floor(remaining_time / total_game_time * 140 ))
	//setInterval(timing_timer(width_of_timer), 100);
	
	if(remaining_time <= 0) {
		dogSound.load();dogSound.play();game_over();
		
		}

}

function timing_timer(){
	if(remaining_time < total_game_time/2){width_of_timer = width_of_timer-0.12;}
	else if(remaining_time < total_game_time/5){width_of_timer = width_of_timer-0.17;}
		else
		{width_of_timer = width_of_timer-0.1;}
	
	svgdoc.getElementById("time_remaining_bar").setAttribute("width", width_of_timer / total_game_time * 140 )
}


//
// This function sets up the screen for game over
//

function game_over() {

	zoom = 1.0;
	
	if(isZoomMode){score=score+remaining_time*2;}
	else{score=score+remaining_time;}
	
	clearInterval(gameInterval);

	clearInterval(remaining_time_Timer);
	clearInterval(width_of_timer_device);

	// Get the high score table from cookies
	table = getHighScoreTable();

	// Create the new score record
	name = player.name;
	var record = new ScoreRecord(player.name, score);

	// Insert the new score record
	var pos = table.length;
	for (var i = 0; i < table.length; i++) 
	{
		if (record.score > table[i].score) 
		{
			pos = i;
			break;			
		}
}



table.splice(pos, 0, record);
setHighScoreTable(table);
showHighScoreTable(table);

var restart_name = prompt("Name: "+player.name+" Score: "+score, name);
if(confirm("Start again?"))
{restart(restart_name);}
}




//
// This function creates the dogs in the game
//
function createDog() { 
    //var dog = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    //dog.setAttribute("x", x);
    //dog.setAttribute("y", y);
    //dog.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#dog");
    //svgdoc.getElementById("dogs").appendChild(dog);
	
	var i = 0;
	var platforms = svgdoc.getElementById("platforms");
	var hasCollision = false;
	while(i < 6){
		var a = Math.floor(Math.random() * 600);
		var b = Math.floor(Math.random() * 300);
		
		var hasCollision = false;
		
		for (var j = 0; j < platforms.childNodes.length; j++) {
			
			var node = platforms.childNodes.item(j);
			if (node.nodeName != "rect") continue;
			
			var x = parseInt(node.getAttribute("x"));
			var y = parseInt(node.getAttribute("y"));
			var w = parseInt(node.getAttribute("width"));
			var h = parseInt(node.getAttribute("height"));
			
			var pos = new Point(x, y);
			var size = new Size(w, h);

	if (intersect(new Point(a,b), DOG_SIZE, pos, size)) {hasCollision = true;}

	}

	if(a + DOG_SIZE.w > SCREEN_SIZE.w) {hasCollision = true;}

	if(!hasCollision) {

var dog = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

dog.setAttribute("x", a);
dog.setAttribute("y", b);

var random_type = Math.floor(Math.random() * 10) % 2;

if(random_type == 0){ dog.setAttribute("type", "left"); }
else{
dog.setAttribute("type", "right"); 
//alert(dog.getAttribute("x"));
}

if(i == 5) {
dog.setAttribute("boss", 0);
dog.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#king_dog");
}

else {
dog.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#dog");
}
//alert(svgdoc.getElementById("dogs").length);
svgdoc.getElementById("dogs").appendChild(dog);

i++;

}

}

	
	
}


//
//This function creates the good things in the game
//

function createMaterial() {

	var i=0;
	var platforms = svgdoc.getElementById("platforms");
	var hasCollision = false;

	while( i<8 ){
	
	var a = Math.floor(Math.random() * SCREEN_SIZE.w);
	var b = Math.floor(Math.random() * SCREEN_SIZE.h);

	var hasCollision = false;

	for (var j = 0; j < platforms.childNodes.length; j++) { 

		var node = platforms.childNodes.item(j);

		if (node.nodeName != "rect") continue;
		
		var w = parseInt(node.getAttribute("width"));
		var h = parseInt(node.getAttribute("height"));
		var size = new Size(w, h);

		var x = parseInt(node.getAttribute("x"));
		var y = parseInt(node.getAttribute("y"));
		var pos = new Point(x, y);
		
		
	if (intersect(new Point(a,b), MATERIAL_SIZE, pos, size)) 
	{	hasCollision = true; }

}

	if(!hasCollision) {

		var material = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

		material.setAttribute("x", a);
		material.setAttribute("y", b);
//alert(a,b);
		material.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#material");

		svgdoc.getElementById("materials").appendChild(material);
		i++;
	}

}

}


//
// This function creates the exit door in the game
//

function createExitDoor() {

var exit_point = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

exit_point.setAttribute("x", 25);
exit_point.setAttribute("y", 25);

exit_point.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
svgdoc.getElementById("exit_door").appendChild(exit_point);

}




//
// This function creates the disappearing platforms in the game
//

function initializeDisappearingPlatforms() {
	

	
	var platforms = svgdoc.getElementById("platforms");
	
disappearingPlatform_first = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
disappearingPlatform_first.setAttribute("x", 180);
disappearingPlatform_first.setAttribute("y", 100);
disappearingPlatform_first.setAttribute("width", 80);
disappearingPlatform_first.setAttribute("height", 20);
disappearingPlatform_first.setAttribute("type", "disappearing");
disappearingPlatform_first.style.setProperty("opacity", 1, null);
disappearingPlatform_first.style.setProperty("stroke", "black", null);
disappearingPlatform_first.style.setProperty("stroke-width", 1, null);

platforms.appendChild(disappearingPlatform_first);

disappearingPlatform_second = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
disappearingPlatform_second.setAttribute("x", 80);
disappearingPlatform_second.setAttribute("y", 220);
disappearingPlatform_second.setAttribute("width", 80);
disappearingPlatform_second.setAttribute("height", 20);
disappearingPlatform_second.setAttribute("type", "disappearing");
disappearingPlatform_second.style.setProperty("opacity", 1, null);
disappearingPlatform_second.style.setProperty("stroke", "black", null);
disappearingPlatform_second.style.setProperty("stroke-width", 1, null);

platforms.appendChild(disappearingPlatform_second);

disappearingPlatform_third = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
disappearingPlatform_third.setAttribute("x", 280);
disappearingPlatform_third.setAttribute("y", 420);
disappearingPlatform_third.setAttribute("width", 80);
disappearingPlatform_third.setAttribute("height", 20);
disappearingPlatform_third.setAttribute("type", "disappearing");
disappearingPlatform_third.style.setProperty("opacity", 1, null);
disappearingPlatform_third.style.setProperty("stroke", "black", null);
disappearingPlatform_third.style.setProperty("stroke-width", 1, null);

platforms.appendChild(disappearingPlatform_third);

}


//
// This function shoots a bullet from the player
//
function shootBullet() {
	
	if(!isCheatMode) {

		if(player.bullet <= 0) {return;}

		player.bullet--;
		svgdoc.getElementById("bulletNum").childNodes[0].data = player.bullet;
}

shootSound.load();
shootSound.play();
	
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	
    if(player.currentFace != motionType.RIGHT)
	{bullet.setAttribute("x", player.position.x - PLAYER_SIZE.w / 2 + BULLET_SIZE.w / 2);}

	else
	{bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);}
	
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
	bullet.setAttribute("bullet_direction", player.currentFace);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
		
            player.motion = motionType.LEFT;
		player.currentFace = motionType.LEFT;	
            break;

        case "D".charCodeAt(0):
		
            player.motion = motionType.RIGHT;
			player.currentFace = motionType.RIGHT;
            break;
			
        case "W".charCodeAt(0):
		
			if(isCheatMode)
			{player.verticalSpeed = JUMP_SPEED;}
			else{
				if(player.isOnPlatform())
				{player.verticalSpeed = JUMP_SPEED;}
			}
		
            break;

        case 32:
            if (canShoot) shootBullet();
            break;
			
		case "C".charCodeAt(0):
			isCheatMode = true;
			playerObject = svgdoc.getElementById("player");
			playerObject.setAttribute("style", "fill-opacity:0.5");
			break;
			
		case "V".charCodeAt(0):
			isCheatMode = false;
			playerObject = svgdoc.getElementById("player");
			playerObject.setAttribute("style", "fill-opacity:1");
			break;
			
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a dog
    var dogs = svgdoc.getElementById("dogs");
	if(!isCheatMode){
    for (var i = 0; i < dogs.childNodes.length; i++) {
        var dog = dogs.childNodes.item(i);
        var x = parseInt(dog.getAttribute("x"));
        var y = parseInt(dog.getAttribute("y"));

        if (intersect(new Point(x, y), DOG_SIZE, player.position, PLAYER_SIZE)) {
			
			dogSound.load();
			dogSound.play();
			game_over();
            return;
        }
    }
	}

    // Check whether a bullet hits a dog
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < dogs.childNodes.length; j++) {
            var dog = dogs.childNodes.item(j);
            var mx = parseInt(dog.getAttribute("x"));
            var my = parseInt(dog.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), DOG_SIZE)) {
                dogs.removeChild(dog);
                j--;
                bullets.removeChild(bullet);
                i--;

                //write some code to update the score
				if(isZoomMode) {dogDeadSound.load(); dogDeadSound.play(); score += 30;}
				else {dogDeadSound.load(); dogDeadSound.play(); score += 10;}
				svgdoc.getElementById("score").childNodes[0].data = score;
				
            }
        }
    }
	
	// Check whether the player collects a good thing

	var materials = svgdoc.getElementById("materials");

	for (var i = 0; i < materials.childNodes.length; i++) {
		
		var material = materials.childNodes.item(i);
		var x = parseInt(material.getAttribute("x"));
		var y = parseInt(material.getAttribute("y"));
		
		
		if (intersect(new Point(x, y), MATERIAL_SIZE, player.position, PLAYER_SIZE)) 
		{			
			materials.removeChild(material);
			i--;
			
			if(isZoomMode) {score += 20;}
			else {score += 10;}
			//alert(materials.childNodes.length);
			if(materials.childNodes.length == 0 ) {exit_allowed=true;}

		svgdoc.getElementById("score").childNodes[0].data = score;

		}
}


// Check if the player can exit

var exits = svgdoc.getElementById("exit_door");
var exit = exits.childNodes[0];

var x = parseInt(exit.getAttribute("x"));
var y = parseInt(exit.getAttribute("y"));

if(intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE) && exit_allowed) {
//alert('woow');
passSound.load();
passSound.play();

game_over();

return; 

}



	
	// Check whether the player is on the disappearing platforms
	
	var platforms = svgdoc.getElementById("platforms");

	if(disappearingPlatform_first != null && 
	(player.position.x + PLAYER_SIZE.w > 180 && 
	player.position.x + PLAYER_SIZE.w < 260) && 
	(player.position.y + PLAYER_SIZE.h == 100)) {

var platformOpacity = parseFloat(disappearingPlatform_first.style.getPropertyValue("opacity"));
platformOpacity -= 0.1;
disappearingPlatform_first.style.setProperty("opacity", platformOpacity, null);
if(platformOpacity == 0) 
disappearingPlatform_first.parentNode.removeChild(disappearingPlatform_first);

	}

	if(disappearingPlatform_second != null && 
	(player.position.x + PLAYER_SIZE.w > 80 && player.position.x + PLAYER_SIZE.w < 160) && 
	(player.position.y + PLAYER_SIZE.h == 220)) {

var platformOpacity = parseFloat(disappearingPlatform_second.style.getPropertyValue("opacity"));
platformOpacity -= 0.1;
disappearingPlatform_second.style.setProperty("opacity", platformOpacity, null);
if(platformOpacity == 0) 
disappearingPlatform_second.parentNode.removeChild(disappearingPlatform_second);

	}

	if(disappearingPlatform_third != null && 
	(player.position.x + PLAYER_SIZE.w > 280 && player.position.x + PLAYER_SIZE.w < 360) && 
	(player.position.y + PLAYER_SIZE.h == 420)) {

var platformOpacity = parseFloat(disappearingPlatform_third.style.getPropertyValue("opacity"));
platformOpacity -= 0.1;
disappearingPlatform_third.style.setProperty("opacity", platformOpacity, null);
if(platformOpacity == 0) 
disappearingPlatform_third.parentNode.removeChild(disappearingPlatform_third);

	}
	
	// Check whether the player is in portal

var portal1 = svgdoc.getElementById("portal_a");
var portal2 = svgdoc.getElementById("portal_b");

var x_a = parseInt(portal1.getAttribute("x"));
var y_a = parseInt(portal1.getAttribute("y"));
var x_b = parseInt(portal2.getAttribute("x"));
var y_b = parseInt(portal2.getAttribute("y"));



if (intersect(new Point(x_a, y_a), PORTAL_SIZE, player.position, PLAYER_SIZE) && !willBeTrans) {

player.position.x = 300;
player.position.y = 60;
willBeTrans = true;
setTimeout(function(){willBeTrans = false;}, 2000);

}

if (intersect(new Point(x_b, y_b), PORTAL_SIZE, player.position, PLAYER_SIZE) && !willBeTrans) {

player.position.x = 40;
player.position.y = 180;
willBeTrans = true;
setTimeout(function(){willBeTrans = false;}, 2000);

}
	
}


//
//This function updates the position of the dogs
//

function moveDogs() {
	
	var dogs = svgdoc.getElementById("dogs");

	for(var i = 0; i < dogs.childNodes.length; ++i){
	
		var dog = dogs.childNodes.item(i);
	
		var oldPosition = new Point(parseFloat(dog.getAttribute("x")), parseFloat(dog.getAttribute("y")));
		var newPosition = new Point(parseFloat(dog.getAttribute("x")), parseFloat(dog.getAttribute("y")));
	
	//if(dog.getAttribute("boss") == 0) {

	//if(player.position.y > parseFloat(dog.getAttribute("y")) &&
	//player.position.y < parseFloat(dog.getAttribute("y")) + DOG_SIZE.h){

	//dogShoot(dog);

	//}
	//}
	
	//if(dog.getAttribute("type") == "right")
	
	//{dog.setAttribute("transform", "translate(" + SCREEN_SIZE.w + ", 0) scale(-1, 1)");}

		if(dog.getAttribute("type") == "left" && newPosition.x >= 0){
		newPosition.x -= 1; 
		dog.setAttribute("x", newPosition.x);
		}
			
		else if (dog.getAttribute("type") == "left" && newPosition.x < 0) {
				newPosition.x = oldPosition;
				//dog.setAttribute("transform", "translate(" + _SIZE.w + ", 0) scale(-1, 1)");
				dog.setAttribute("type", "right");
				}			

		else if(dog.getAttribute("type") == "right" && newPosition.x + DOG_SIZE.w < SCREEN_SIZE.w){
			
			//dog.setAttribute("transform", "translate(" + (DOG_SIZE.w + newPosition.x) + "," +newPosition.y+") scale(-1, 1)");
			newPosition.x += 1; 
			dog.setAttribute("x", newPosition.x); 
		}
			
		else if (dog.getAttribute("type") == "right" && newPosition.x + DOG_SIZE.w >= SCREEN_SIZE.w) {
				newPosition.x = SCREEN_SIZE - PLAYER_SIZE.w;
				//dog.setAttribute("transform", "translate(" + DOG_SIZE.w + ", 0) scale(-1, 1)");
				dog.setAttribute("type", "left");
				
			}		
			
			
			
			
			
			/*
		if(newPosition.x <= 0){
			if(dog.getAttribute("type") == "left"){dog.setAttribute("transform", "translate(" + SCREEN_SIZE.w + ", 0) scale(-1, 1)");
				dog.setAttribute("type", "right");}
			else{		newPosition.x += 1; 
		dog.setAttribute("x", newPosition.x);}
			
		}
		else if(newPosition.x > 0 && newPosition.x + DOG_SIZE.w < SCREEN_SIZE.w)
		{
			if(dog.getAttribute("type") == "left"){newPosition.x += 1; 
		dog.setAttribute("x", newPosition.x);}
		else{newPosition.x -= 1; 
		dog.setAttribute("x", newPosition.x);}
			
		}
		else {
			if(dog.getAttribute("type") == "right"){dog.setAttribute("transform", "translate(" + SCREEN_SIZE.w + ", 0) scale(-1, 1)");
				dog.setAttribute("type", "left");}
				else{newPosition.x -= 1; 
		dog.setAttribute("x", newPosition.x);}
			
		}
			*/
			
	}
}





//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
	var x = parseInt(node.getAttribute("x"));
	if(node.getAttribute("bullet_direction") == motionType.RIGHT)
	{node.setAttribute("x", x + BULLET_SPEED);}

	else {node.setAttribute("x", x - BULLET_SPEED);}

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
	    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
	

    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
	
	
	// Move the dogs

	moveDogs();

    // Move the bullets
    moveBullets();

    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    playerObject = svgdoc.getElementById("player");
      if(player.currentFace == motionType.LEFT){

	  playerObject.setAttribute("transform", "translate(" + (PLAYER_SIZE.w + player.position.x) + "," +player.position.y+") scale(-1, 1)");}
else
{
	playerObject.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
}
      
	// Display player's name

name_Tag.setAttribute("x", player.position.x + 15);

name_Tag.setAttribute("y", player.position.y - 5);
			
			
    // Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
}
