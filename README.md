# Tanksmith.io
#### Multiplayer browser game created by Luke Fisk-Lennon in 2018

> This repository represents the first time Tanksmith.io has been open-source since it was launched in 2018. Sensitive information such as passwords and API keys have been removed, hence why it would be difficult to run on your own machine.

> Please be lenient on my somewhat haphazard code style (e.g. single files with 3k lines of code!) as I was only 15 at the time, and I have since improved as a programmer.

Screenshot of Tanksmith.io gameplay:

<img src="https://raw.githubusercontent.com/lukefisklennon/tanksmith.io/master/brand/yt-0.png" width="350" />

## Overview

Tanksmith.io is a multiplayer browser game, where players compete in real-time from around the globe. It is a hybrid between the tank-shooter and tower-defense genres.

As an “io game”, Tanksmith.io is designed to be quick and easy to play, where the game can be loaded in a browser, played with a single click and no login required. It is also available for free for Android devices.

While multiplayer servers create ongoing costs, I place ads on the webpage to generate revenue and provide a profit. The game has been highly successful, having had 1.5 million players in the 2 years since release, as well as 100 thousand downloads for Android and 10 thousand dollars in revenue.

Tanksmith.io can be found at this web address: http://tanksmith.io/ 
 
## Technical details 
### Server 
I wrote the server in C++, with the Box2D engine handling physics. All of the game logic is executed here, processing player inputs (e.g. mouse and keyboard) sent over the Internet and updating clients with information about what is happening in the game world around them. 
### Client 
The client was written with native JavaScript and runs directly in the browser. The script connects to and communicates with a remote server, sending inputs and receiving data about the game world. The user interface was made with HTML and CSS, while the game graphics are rendered with HTML5 Canvas, a low-level browser API. 
### Networking 
The server and client communicate via WebSockets, a bidirectional, real-time communications protocol. Networking is a major challenge when building a multiplayer game, with goals including reduced latency, jitter and data usage.

All communications are encoded with a custom binary protocol, ensuring that excess data is not used (as opposed to other formats such as JSON). The server also culls entities, such as those outside the player’s viewport, or entities that are currently not moving. 

The server sends regular updates at (a relatively low) 20 frames per second to reduce data usage. The client interpolates in-between frames to provide a smooth experience for the player. 

### Performance 

To reduce server costs, it was imperative to maximise performance on the server-side. I achieved support for 60 concurrent players on each server by: 
-	choosing C++ as a language 
-	outsourcing heavy computation to optimised libraries 
-	opting for the best data structures 
### Cloud hosting 
I use the cloud hosting provider Linode, which gives root-access to virtual Linux servers at low costs. Each server costs $5 per month, and includes: 
-	1 GB RAM 
-	1 CPU core 
-	1 TB data transfer quota 
-	1 Gbps of network out 
 
Servers are hosted around the world, in 8 locations in the US, Europe and Asia. The number of servers in each location depends on the amount of demand for the game in that part of the world. 
### Load balancing 
To distribute traffic across game servers, a dedicated load balancer runs in the US. It was written with server-side JavaScript (Node.js). 

The balancer collects metadata from each server, including player count, capacity and server version. It directs players to the best server based on their location (calculated from their IP address) and current capacity of the servers. 

The load balancer also features a custom balancing algorithm that maximises the concentration of players to make the game more engaging. It is also capable of automatically creating new Linode servers as demand increases (i.e. scaling). 

## Business management 
### Costs 
There are a number of costs involved in running a multiplayer game, including: 
-	Domain registration 
-	Webpage hosting 
-	Game servers (cost scales with demand) 
 
As mentioned earlier, maximising server performance helps reduce server costs, and results in a greater profit. 

### Monetisation 
To offset expenses and make a profit, I needed to find a way to monetise the game. Because of the genre (io games), I chose a free-to-play model, supported by advertising. Ads on the webpage and Android app generate about 0.1 cents per view, but create a significant source of income at high volumes. 

Ads on the webpage are supplied by AdinPlay, an ad monetisation partner which serves ads from a number of networks, including Google Ads. The app is monetised with Google AdMob. 

I have also made additional revenue through donations via Patreon. These donors receive extra benefits such as access to a private server. 
 
To reach such a large audience, I have promoted Tanksmith.io in a number of ways: 
-	Game curation sites, which list games often in return for a backlink 
-	YouTubers, who create videos that attract new players to the game 
-	Search engine optimisation, resulting in more traffic from searches 
-	Social media/news sites, such as Twitter and Reddit 
-	Rewarding players for engaging on social media (e.g. follow, share) 
-	Releasing updates to re-engage players in the game (e.g. new game modes) 
 
# Success 
  
The game has proven successful and profitable, as reflected in many key metrics: 
-	6.4M+ pageviews 
-	1.5M+ unique players 
-	100K+ Android app downloads 
-	2.5M+ YouTube total views 
-	$10K+ revenue so far
