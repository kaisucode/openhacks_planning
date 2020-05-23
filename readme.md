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

Players have mass 1 player mass units (pmu).
Asteroids vary in size, but not in density really, and have mass in the
interval [5pmu, 10pmu] normally distributed, with mean 7.5pmu and standard
deviation 1.2pmu.
Despite this, in a weird change of physics, the asteroids have gravity fields surrounding them. 
Interestingly, the players don't exert a equal and opposite force on the asteroids. 
On the other hand, there is a concept of momentum in our game. In particular,
if the player launches off of, or lands on an asteroid then momentum is
conserved (momentum = sum of mass * velocity).
Launching off of an asteroid is accomplished by a rechargeable rocket boost
thing, which is just a really quick impulse thing. Force directed in the
opposite direction to where the players head is pointing. 
Recoil is a thing. If you shoot a whole bunch you can probably launch off of an
asteroid. Shooting one will not be enough though, the asteroids gravity field
will pull you back.
In terms of items laying around the map, there are extra bulleit boxees, and
even (1) extra team life, potentially there will be other upgrades later as well.
In terms of bulleits, their initial velocity is determined by the player.
However, they are affected by the gravity of asteroids. The bulleit will travel
until hitting an asteroid or a player. 
Finally, there is a sphere of "fire" enclosing the players in a confined area (you can hide but you can't run).

# "extra" features
- modify bulleit velocity (would modify recoil amount too) 
- damage dealing obstacles

