# endgameit

# Authors
Gavin, Kevin, Walter, Alek

# Tools
Three.js (a wrapper around WEBGL)
socket.io in python for backend stuff

# Game mechanics
endgameit is a team-based multiplayer game. Two teams, red and blue, each with two players face off. 
The players interact in a box in a zero gravity environment subject to conservation of momentum. 
There are obstacles, called asteroids (which are large relative to the sizes of the players). 
Players can stick to the surfaces of the asteroids by mechanism XXX. 
Players can launch themselves off of the asteroids. 
Players can shoot their booleit gun (assuming them have enough booleits).
If a player is hit by a booleit, they lose a team life.
The map layout is constantly changing as asteroids move around, affected by the players. 
Players are incentivized to move around by objects like booleit boxees, and extra team lives.

# random cool ideas
magnetic boots, metal asteroids, can turn on and off stickiness

note: you can have asteroids be affected by players landing on them and have
gravity simultaneously as long as you dont care about physics.

asteroids have gravity

orbit them?

projectiles affected

sphere of fire to implement the bounding box (enclosing in?)

stuff sitting around the map (incentive to move):
amo boxes
extra lives
updgrades

Note: direct sight lines dont' mean you hit someone, asteroids can block

