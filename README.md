# Tanksmith.io

#### Multiplayer browser game created in 2018

> This repository contains an open-source mirror of Tanksmith.io (which was originally closed-source and released in 2018), and the commit history only contains changes made after the project became open-source.

> Note: there are quite a few issues with the code style (e.g. a single file with 3k lines of code) because I was more of a novice programmer at the time, and have improved since then.

> Some important files: [public/2.13.js](https://github.com/lukefisklennon/tanksmith.io/blob/master/public/2.13.js) (frontend), [main.cpp](https://github.com/lukefisklennon/tanksmith.io/blob/master/main.cpp) (backend), [balancer/balancer.js](https://github.com/lukefisklennon/tanksmith.io/blob/master/balancer/balancer.js) (load balancer)

Screenshot of Tanksmith.io gameplay:

<img src="https://raw.githubusercontent.com/lukefisklennon/tanksmith.io/master/brand/yt-0.png" width="350" />

## Overview

Tanksmith.io is a multiplayer browser game, where players compete in real-time from around the globe. It's a hybrid between the tank-shooter and tower-defense genres.

As an “io game”, Tanksmith.io is designed to be quick and easy to play; the game can be loaded in a browser, played with a single click, and doesn't require logging in. It's also available for free for Android devices.

While multiplayer servers create ongoing costs, I web and mobile ads help generate revenue. The game has had 2+ million players in the years since release, including 100k+ downloads for Android.

Tanksmith.io can be found at this web address: http://tanksmith.io/

## Technical details

### Server

The server is written in C++, with Box2D handling physics. All of the game logic is executed here, processing player inputs (e.g. mouse and keyboard) sent over the network, and updating clients with information about what is happening in the game world around them.

### Client

The client was written with native JavaScript and runs directly in the browser. The script connects to and communicates with a remote server, sending inputs and receiving data about the game world. The user interface was made with HTML and CSS, while the game graphics are rendered with HTML5 Canvas.

### Networking

The server and client communicate via WebSocket, which is a bidirectional, real-time communications protocol. Networking is a major challenge when building a multiplayer game, with goals including reduced latency, jitter, and data usage.

All communications are encoded with a custom binary protocol, ensuring that unnecessary bandwidth isn't used (as opposed to other formats such as JSON). The server also culls entities, such as those outside the player’s viewport, or entities that are currently not moving.

The server sends regular updates at (a relatively low) 20 frames per second to reduce data usage. The client interpolates in-between frames to provide a smooth experience for the player.

### Cloud hosting

Tanksmith.io uses the cloud hosting provider Linode, which gives root-access to virtual Linux servers at low costs. Each server costs $5 per month, and includes:

- 1 GB RAM
- 1 CPU core
- 1 TB data transfer quota
- 1 Gbps of network out

Servers have been hosted around the world, in 8 locations in the US, Europe and Asia. The number of servers in each location depends on the amount of demand for the game in that part of the world.

### Load balancing

To distribute traffic across game servers, a dedicated load balancer runs in the US. It was written in server-side JavaScript (Node.js runtime).

The balancer collects metadata from each server, including player count, capacity, and server version. It directs players to the best server based on their location (derived from their IP address), and current capacity of the servers.

The load balancer also features custom balancing logic which maximises the concentration of players to make the game more engaging. It's also capable auto-scaling by spinning up new Linode instances as demand increases.

## Business management

### Costs

There are a number of costs involved in running a multiplayer game, including:

- Domain registration
- Webpage hosting
- Game servers (cost scales with demand)

As mentioned earlier, maximising server performance helps reduce server costs by allowing more players to fit on each server.

### Monetisation

To offset expenses and make a profit, I needed to find a way to monetise the game. Because of the genre (io games), I chose a free-to-play model, supported by advertising. Ads on the webpage and Android app generate about 0.1 cents per view, but create a significant source of income at high volumes.

Ads on the webpage are supplied by AdinPlay, an ad monetisation partner which serves ads from a number of networks, including Google Ads. The app is monetised with Google AdMob.

I have also made additional revenue through donations via Patreon. These donors receive extra benefits such as access to a private server.

To reach such a large audience, I have promoted Tanksmith.io in a number of ways:

- Game curation sites, which list games often in return for a backlink
- YouTubers, who create videos that attract new players to the game (2.5M+ total YouTube views)
- Search engine optimisation, resulting in more traffic from searches
- Social media/news sites, such as Twitter and Reddit
- Rewarding players for engaging on social media (e.g. follow, share)
- Releasing updates to re-engage players in the game (e.g. new game modes)
