#include <stdio.h>
#include <unistd.h>

#include <uWS/uWS.h>
#include "Box2D/Box2D.h"

#include <iostream>
// #include <set>
#include <thread>
#include <chrono>
#include <unordered_set>
#include <unordered_map>

#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>

#include <fstream>
#include <unistd.h>

#define VERSION "2.13"

#define MAX_PLAYERS 60
#define AREA_PER_PLAYER 1800
#define FLOATERS_PER_PLAYER 30
#define PIXEL_TO_METER_RATIO 27
#define MAX_NAME_LENGTH 22
#define FPS 20
#define FRAMES_PER_SEND 1
#define UNIT_LIMIT 20
#define INACTIVITY_KICK_TIME 120000 // 2 minutes
#define FRAME_FROZEN_TIME 5000
#define DRAIN_TIMEOUT 3600000 // 1 hour
#define RESIZE_INTERVAL 5
#define GLITCH_SPEED 6
#define SHIELD_TIME 30000 // 30 seconds
#define UNIT_WEIGHT 0.003
#define WEIGHT_LIMIT 0.5
#define INITIAL_ACCEL 45
#define BR_MIN_PLAYERS 5
#define BR_AREA_PER_PLAYER 4000
#define BR_TIME 240000 // 4 minutes
#define BR_WALL_DAMAGE 0.1
#define BR_BONUS 100
#define BR_REWARD 10
// #define INITIAL_MAX_SPEED 6
// #define ACCEL_SPEED_RATIO 7.5
// #define SAME_IP_LIMIT 10

#define SOCIAL_NUM 6
#define SOCIAL_BONUS 3

#define CAMERA_LAG 4
#define SCREEN_WIDTH 1040
#define SCREEN_HEIGHT 590
#define SCREEN_RATIO SCREEN_WIDTH / SCREEN_HEIGHT
#define VIEW_PADDING 1.5
#define SCALE_THRESHOLD 4
#define SCALE_MULT 0.008

#define LEADERBOARD_NUM 10
#define LEADERBOARD_UPDATE_INTERVAL 2000

#define MODE_FFA 1
#define MODE_BR 2

#define STATE_WAITING 1
#define STATE_PLAYING 2

#define UNIT_DENSITY 1
#define UNIT_FRICTION 1
#define UNIT_LINEAR_DAMPING 2
#define UNIT_ANGULAR_DAMPING 2

#define FLOATER_SIZE_NUM 3
#define FLOATER_DENSITY 0.3
#define FLOATER_FRICTION 1
#define FLOATER_LINEAR_DAMPING 2
#define FLOATER_ANGULAR_DAMPING 2
#define FLOATER_HP 0.8
#define FLOATER_REGEN 0.0006
#define FLOATER_COLLISION_DAMAGE 0.1
#define FLOATER_KILL_MESSAGE "YSB0cmlhbmdsZQ=="

#define BULLET_DENSITY 0.1
#define BULLET_FRICTION 1

#define INTERFACE_DRAIN 0

#define BYTE_SIZE 1
#define SHORT_SIZE 2
#define INT_SIZE 4
#define FLOAT_SIZE 4

#define CLIENT_CODE_READY 1
#define CLIENT_CODE_KEY 2
#define CLIENT_CODE_PLAY 3
#define CLIENT_CODE_MOUSE 4
#define CLIENT_CODE_BUILD 5
#define CLIENT_CODE_UPGRADE 6
#define CLIENT_CODE_DELETE 7
#define CLIENT_CODE_MOVE 8
#define CLIENT_CODE_PING 9

#define CLIENT_LENGTH_READY 1
#define CLIENT_LENGTH_KEY 3
#define CLIENT_LENGTH_PLAY 3
#define CLIENT_LENGTH_MOUSE 9
#define CLIENT_LENGTH_BUILD 9
#define CLIENT_LENGTH_UPGRADE 3
#define CLIENT_LENGTH_DELETE 3
#define CLIENT_LENGTH_MOVE 9
#define CLIENT_LENGTH_PING 1

#define SERVER_CODE_UPDATE 1
#define SERVER_CODE_JOINED 2
#define SERVER_CODE_INFO 3
#define SERVER_CODE_STASH 4
#define SERVER_CODE_SCALE 5
#define SERVER_CODE_LEADERBOARD 6
#define SERVER_CODE_DIE 7
#define SERVER_CODE_KICK 8
#define SERVER_CODE_SHAKE 9
#define SERVER_CODE_KILL 10
#define SERVER_CODE_RESIZE 11
#define SERVER_CODE_BR_STATE 12
#define SERVER_CODE_BR_RANK 13

#define SHAPE_CIRCLE 1
#define SHAPE_TRIANGLE 2

#define TYPE_UNIT 1
#define TYPE_FLOATER 2
#define TYPE_BULLET 3

#define UNIT_TYPE_NUM 11
#define UNIT_CORE 0
#define UNIT_ALCHEMY_LAB 7

#define MATERIAL_NUM 6
#define FLOATER_SPAWN_SERIES_LENGTH 31
#define MATERIAL_WOOD 0
#define MATERIAL_IRON 1
#define MATERIAL_GOLD 2
#define MATERIAL_DIAMOND 3
#define MATERIAL_AMETHYST 4
#define MATERIAL_ONYX 5

using namespace std;
using namespace std::chrono;
using std::unordered_set;

typedef char byte;

float sqrtv = sqrt(0.5);

class Object;
class Bullet;
class Unit;
class Floater;
class Player;

typedef struct _pos {
    float x;
    float y;
} pos;

typedef struct _clientKeys {
    bool w;
    bool a;
    bool s;
    bool d;
} clientKeys;

typedef struct _dataPointer {
    int type;
    void *data;
} dataPointer;

typedef struct _unitDef {
    int cost;
    float size;
    bool manualActivate;
    bool autoActivate;
    unsigned long activationReloadTime;
    bool buildable;
    float hp;
    float regen;
    float bulletDamage;
    float bulletSize;
    float bulletSpeed;
    float bulletRange;
    float collisionDamage;
    float heal;
    float speedBoost;
    float speedBoostUpgrade;
    int shape;
    float spinAnimation;
} unitDef;

typedef int materialCluster[MATERIAL_NUM];

void loop();
void statusServer();
void resize(int n, int direction);
void fire(Unit *u, float x, float y, float angle);
void updateLeaderboard();
void updateStatus();
void updateRestarts(int change);
float amountScale(float amount, byte material);
float costScale(float amount, byte material);
float rewardScale(float amount, byte material);
float expScale(float amount, byte material);
float linearScale(float amount, byte material);
Unit *findUnitById(unsigned short id);
pos randomSpawnPosition();
float afp(float x1, float y1, float x2, float y2);
pos pfa(float x, float y, float a, float d);
float dfp(float x1, float y1, float x2, float y2);
unsigned long getTime();
float norm(float n);
void wipeInputs(clientKeys *keys, bool *mouse);
void halveStash(int *stash, int socialTotal, string name);
// int createServerSocket(int port);
// int waitForConnection(int serverSocket);
void checkDrain();
void sendKill(Player *killer, Player *killed);
void updateBr();
void emitBrState();
// void eraseAddress(const char *address);

int mode = MODE_FFA;
int brState = STATE_WAITING;
int maxPlayers = MAX_PLAYERS;
int socialBonus = SOCIAL_BONUS;
float floaterRewardMult = 1;
float arenaSize;
float width;
float height;
int desiredFloaters;
bool draining = false;
int restarts = 0;
b2Vec2 gravity(0, 0);
b2World world(gravity, true);
long idc = 0;
long udc = 0;
long fdc = 0;
long bdc = 0;
float floaterSizes[FLOATER_SIZE_NUM] = {0.5, 1, 2};
float floaterSizeChances[FLOATER_SIZE_NUM] = {80, 10, 5};
unsigned long lastFrame = 0;
unsigned long frameCount = 0;
unsigned long averageTime = 1000 / FPS;
unsigned long drainTime = 0;
int totalJoined = 0;
float brShrink = sqrt(BR_AREA_PER_PLAYER * BR_MIN_PLAYERS) / (BR_TIME / (1000 / FPS));

vector<Player *> players;
vector<Unit *> units;
vector<Floater *> floaters;
vector<Bullet *> bullets;

// unordered_map<const char *, long> addresses;

// recursive_mutex playersMutex;
// recursive_mutex unitsMutex;
// recursive_mutex floatersMutex;

int fspi = 0; // Floater spawn series index
byte floaterSpawnSeries[FLOATER_SPAWN_SERIES_LENGTH];

unitDef unitDefs[UNIT_TYPE_NUM] = {
    { // Core
        24, // cost
        1.2, // size
        true, // manual activate
        false, // auto activate
        500, // reload time
        true, // buildable
        18, // hp
        0.0003, // regen
        0.5, // bullet damage
        0.37, // bullet size
        11, // bullet speed
        12, // bullet range
        0.2, // collision damage
        -1, // heal
        1, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Basic unit
        6, // cost
        1, // size
        false, // manual activate
        false, // auto activate
        0, // reload time
        true, // buildable
        12, // hp
        0.0003, // regen
        -1, // bullet damage
        -1, // bullet size
        -1, // bullet speed
        -1, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Basic turret
        8, // cost
        1, // size
        true, // manual activate
        false, // auto activate
        500, // reload time
        true, // buildable
        6, // hp
        0.0003, // regen
        0.25, // bullet damage
        0.37, // bullet size
        11, // bullet speed
        12, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Sniper turret
        10, // cost
        1, // size
        true, // manual activate
        false, // auto activate
        800, // reload time
        true, // buildable
        6, // hp
        0.0003, // regen
        0.25, // bullet damage
        0.3, // bullet size
        12, // bullet speed
        15, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Twin turret
        10, // cost
        1, // size
        true, // manual activate
        false, // auto activate
        250, // reload time
        true, // buildable
        7, // hp
        0.0003, // regen
        0.2, // bullet damage
        0.2, // bullet size
        11, // bullet speed
        12, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Cannon turret
        18, // cost
        1, // size
        true, // manual activate
        false, // auto activate
        700, // reload time
        true, // buildable
        8, // hp
        0.0003, // regen
        0.7, // bullet damage
        0.5, // bullet size
        10, // bullet speed
        10, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Healing unit
        14, // cost
        1, // size
        false, // manual activate
        true, // auto activate
        3000, // reload time
        true, // buildable
        10, // hp
        0.0003, // regen
        -1, // bullet damage
        -1, // bullet size
        -1, // bullet speed
        -1, // bullet range
        0.1, // collision damage
        1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Alchemy lab
        20, // cost
        1, // size
        false, // manual activate
        true, // auto activate
        3000, // reload time
        true, // buildable
        10, // hp
        0.0003, // regen
        -1, // bullet damage
        -1, // bullet size
        -1, // bullet speed
        -1, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Booster unit
        12, // cost
        1, // size
        false, // manual activate
        false, // auto activate
        0, // reload time
        true, // buildable
        10, // hp
        0.0003, // regen
        -1, // bullet damage
        -1, // bullet size
        -1, // bullet speed
        -1, // bullet range
        0.1, // collision damage
        -1, // heal
        0.1, // speed boost
        0.05, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0.01 // spin animation
    },
    { // Octa Turret
        16, // cost
        1, // size
        true, // manual activate
        false, // auto activate
        1500, // reload time
        true, // buildable
        8, // hp
        0.0003, // regen
        0.15, // bullet damage
        0.2, // bullet size
        11, // bullet speed
        10, // bullet range
        0.1, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_CIRCLE, // shape
        0 // spin animation
    },
    { // Spike
        8, // cost
        0.5, // size
        false, // manual activate
        false, // auto activate
        0, // reload time
        false, // buildable
        16, // hp
        0.0003, // regen
        -1, // bullet damage
        -1, // bullet size
        -1, // bullet speed
        -1, // bullet range
        0.4, // collision damage
        -1, // heal
        0, // speed boost
        0, // speed boost upgrade
        SHAPE_TRIANGLE, // shape
        0 // spin animation
    }
};

class Object {
public:
    unsigned short id;
    float x;
    float y;
    int type;
    byte material;
    int bodyType;
    float rotation;
    float size;
    float density;
    float friction;
    float linearDamping;
    float angularDamping;
    bool active;
    b2Body *body;

    void createBody();

    bool updateBody() {
		bool touchingWall = false;
        if (body == NULL) {
            createBody();
        }
        b2Vec2 position = body->GetPosition();
    	rotation = body->GetAngle();
        active = body->IsAwake();
        x = position.x;
        y = position.y;
		bool collide;
		if (mode == MODE_FFA) {
			collide = (type != TYPE_BULLET);
		} else if (mode == MODE_BR) {
			collide = (type != TYPE_BULLET && type != TYPE_UNIT);
		}

        if (x < -width / 2 + size || x > width / 2 - size || y < -height / 2 + size || y > height / 2 - size) {
			touchingWall = true;
			if (collide) {
                b2Vec2 v = body->GetLinearVelocity();
                if (x < -width / 2 + size) {
                    x = -width / 2 + size;
                    v.x = 0;
                } else if (x > width / 2 - size) {
                    x = width / 2 - size;
                    v.x = 0;
                }
                if (y < -height / 2 + size) {
                    y = -height / 2 + size;
                    v.y = 0;
                } else if (y > height / 2 - size) {
                    y = height / 2 - size;
                    v.y = 0;
                }
                body->SetTransform(b2Vec2(x, y), body->GetAngle());
                body->SetLinearVelocity(v);
			}
        }

		return touchingWall;
    }

    void bulletHit(Bullet *bullet);
    void collisionHit(int type, void *object);
};

class Bullet: public Object {
public:
    Player *owner;
    b2Vec2 velocity;
    float damage;
    float ox;
    float oy;
    float range;

    Bullet(Player *aowner, float ax, float ay, float avx, float avy, byte amaterial, float asize, float adamage, float arange) {
        bdc++;
        id = bdc;
        owner = aowner;
        x = ax;
        y = ay;
        ox = x;
        oy = y;
        range = arange;
        b2Vec2 v;
        v.x = avx;
        v.y = avy;
        velocity = v;
        material = amaterial;
        size = asize;
        bodyType = SHAPE_CIRCLE;
        density = BULLET_DENSITY;
        friction = BULLET_FRICTION;
        linearDamping = 0;
        angularDamping = 0;
        type = TYPE_BULLET;
        damage = adamage;

        active = false;
        body = NULL;

        bullets.push_back(this);
    }

    ~Bullet();

    bool update() {
        bool touchingWall = updateBody();
		if (mode == MODE_BR) {
			touchingWall = false;
		}
        if (touchingWall || dfp(ox, oy, x, y) > range) {
            delete this;
            return false;
        } else {
            body->SetLinearVelocity(velocity);
            return true;
        }
    }
};

class Unit: public Object {
public:
    Player *owner;
    Unit *parent;
    byte unitType;
	float ox;
	float oy;
	b2Vec2 v;
    float angle;
    unsigned long activationReloadTime;
    unsigned long lastActivated;
    bool buildable;
    bool manualActivate;
    bool autoActivate;
    float hp;
    float mhp;
    float regen;
    float bulletDamage;
    float bulletSpeed;
    float bulletRange;
    float collisionDamage;
    float heal;
    float speedBoost;
    float spinAnimation;
    float angleFromParent;
    b2Joint* parentJoint;
    // recursive_mutex childrenUnitsMutex;
    vector<Unit *> childrenUnits;

    // Special
    int lastFireSide;
    byte alchemyCycle;

    void updateStats();

    Unit(Player *aowner, Unit *aparent, float ax, float ay, float aangle, float aangleFromParent, byte atype, byte amaterial) {
        udc++;
        id = udc;
        owner = aowner;
        parent = aparent;
        x = ax;
        y = ay;
		v = {0, 0};
        angle = aangle;
        type = TYPE_UNIT;
        unitType = atype;
        material = amaterial;
        size = unitDefs[unitType].size;
        bodyType = unitDefs[unitType].shape;
        density = UNIT_DENSITY;
        friction = UNIT_FRICTION;
        linearDamping = UNIT_LINEAR_DAMPING;
        angularDamping = UNIT_ANGULAR_DAMPING;
        manualActivate = unitDefs[unitType].manualActivate;
        autoActivate = unitDefs[unitType].autoActivate;
        activationReloadTime = unitDefs[unitType].activationReloadTime;
        lastActivated = 0;
        buildable = unitDefs[unitType].buildable;
        speedBoost = 0;
        updateStats();
        regen = unitDefs[unitType].regen;
        bulletSpeed = unitDefs[unitType].bulletSpeed;
        bulletRange = unitDefs[unitType].bulletRange;
        angleFromParent = aangleFromParent;

        active = false;
        body = NULL;
        parentJoint = NULL;

        // Special
        lastFireSide = 1;
        alchemyCycle = 0;

        //unitsMutex.lock();
        units.push_back(this);
        //unitsMutex.unlock();
    }

    ~Unit();

	bool update();
    void activate();
    bool handleHealth(float damage, Player *player);
};

class Floater: public Object {
public:
    float mhp;
    float hp;
    float regen;
    float collisionDamage;
    int sizeTier;
    byte dyingStage;
    unordered_set<Player *> viewedBy;

    Floater(byte amaterial, float ax, float ay) {
        fdc++;
        id = fdc;
		x = ax;
		y = ay;
        sizeTier = 0;
        float random = (float)(rand()) /(RAND_MAX / 100);
        float chanceCounter = 0;
        for (int i = 0; i < FLOATER_SIZE_NUM; i++) {
            if (random > chanceCounter && random < chanceCounter + floaterSizeChances[i]) {
                sizeTier = i;
                break;
            }
            chanceCounter += floaterSizeChances[i];
        }
        size = floaterSizes[sizeTier];
        material = amaterial;
        bodyType = SHAPE_TRIANGLE;
        density = FLOATER_DENSITY;
        friction = FLOATER_FRICTION;
        linearDamping = FLOATER_LINEAR_DAMPING;
        angularDamping = FLOATER_ANGULAR_DAMPING;
        type = TYPE_FLOATER;

        hp = amountScale(FLOATER_HP *(sizeTier + 1), material);
        regen = FLOATER_REGEN;
        mhp = hp;
        collisionDamage = FLOATER_COLLISION_DAMAGE;

        active = false;
        body = NULL;
        dyingStage = 0;

        //floatersMutex.lock();
        floaters.push_back(this);
        //floatersMutex.unlock();
    }

    ~Floater();

    bool update(bool emitting) {
        if (hp < mhp) {
            hp += (mhp * regen);
        }
        bool touchingWall = updateBody();
		if (mode == MODE_BR && touchingWall && dyingStage == 0) {
			dyingStage = 1;
			if (brState == STATE_WAITING) {
				pos position = randomSpawnPosition();
				new Floater(material, position.x, position.y);
			}
		}
        if (emitting && dyingStage == 1) {
            dyingStage++;
        } else if (dyingStage == 2) {
			delete this;
			return false;
        }
		return true;
    }

    void handleHealth(float damage, Player *player);
};

int emitMetaSize = BYTE_SIZE + SHORT_SIZE + SHORT_SIZE + SHORT_SIZE + SHORT_SIZE; // code, number of units, number of floaters, number of bullets, number of players
int unitDataSize = SHORT_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + BYTE_SIZE + BYTE_SIZE + SHORT_SIZE + FLOAT_SIZE + FLOAT_SIZE; // id, x, y, size, angle, type, material, owner, hp, rotation
int floaterDataSize = SHORT_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + BYTE_SIZE + FLOAT_SIZE; // id, x, y, size, rotation, material, hp
int bulletDataSize = SHORT_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + BYTE_SIZE; // id, x, y, size, material
int playerDataSize = SHORT_SIZE + INT_SIZE + BYTE_SIZE; // id, score, name length

class Player {
public:
    unsigned short id;
    uWS::WebSocket<uWS::SERVER> *io;
	// const char *address;
    bool ready;
    bool joined;
    bool hasPlayed;
    bool disconnected;
    string name;
	int socialTotal;
    int score;
    float x;
    float y;
	float ox;
	float oy;
    float tx;
    float ty;
    float accel;
    // float maxSpeed;
    float speedMult;
	float weight;
    int stashBonus;
    materialCluster stash;
    clientKeys keys;
    bool mouse;
    float scale;
    bool usingJoystick;
    float moveAngle;
    float moveThrust;
    Unit *core;
    // recursive_mutex childrenUnitsMutex;
    vector<Unit *> childrenUnits;
    // recursive_mutex childrenBulletsMutex;
    vector<Bullet *> childrenBullets;
    unsigned long lastActivity;
	unsigned long timeConnected;
	unsigned long lastPing;
	unsigned long timeJoined;
	bool hasBuilt;

    Player(uWS::WebSocket<uWS::SERVER> *connection/*, const char *addr*/) {
        id = idc;
        idc++;
        io = connection;
        io->setUserData(this);
		// address = addr;
        ready = false;
        joined = false;
        hasPlayed = false;
        disconnected = false;
        name = "";
		socialTotal = 0;
        score = 0;
        x = width / 2;
        y = height / 2;
        tx = 0;
        ty = 0;
        accel = INITIAL_ACCEL;
        // maxSpeed = INITIAL_MAX_SPEED;
        speedMult = 0;
		weight = 0;
        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;
        mouse = false;
        scale = 1;
        usingJoystick = false;
        moveAngle = 0;
        moveThrust = 0;
        core = NULL;
		lastActivity = 0;
		timeConnected = getTime();
		lastPing = 0;
		timeJoined = 0;
		hasBuilt = false;
        for (int i = 0; i < MATERIAL_NUM; i++) {
            stash[i] = 0;
        }

        //playersMutex.lock();
        players.push_back(this);
        //playersMutex.unlock();
    }

    void deleteAllUnits() {
        if (core != NULL) {
            delete core; // ! deletes unit
            core = NULL;
        }
        // children//unitsMutex.lock();
        for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ) {
            Unit *u = *it;
            delete u; // ! deletes unit
        }
        // children//unitsMutex.unlock();
    }

    ~Player() {
        checkDrain();
        deleteAllUnits();

        //playersMutex.lock();
        players.erase(remove(players.begin(), players.end(), this), players.end());
        //playersMutex.unlock();

        // children//bulletsMutex.lock();
        for (vector<Bullet *>::iterator it = childrenBullets.begin(); it != childrenBullets.end(); ++it) {
            Bullet *b = *it;
            b->owner = NULL;
            delete b;
        }
        // children//bulletsMutex.unlock();

        //floatersMutex.lock();
        for (vector<Floater *>::iterator it = floaters.begin(); it != floaters.end(); ++it) {
            Floater *f = *it;

            f->viewedBy.erase(this);
            // f->viewedBy.erase(remove(f->viewedBy.begin(), f->viewedBy.end(), this), f->viewedBy.end());
        }
        //floatersMutex.unlock();
    }

    void update(float timeMult) {
		if (joined) {
	        if (core != NULL && core->body != NULL) {
				ox = x;
				oy = y;
	            x = core->x;
	            y = core->y;

	            float nvx = 0;
	            float nvy = 0;
				float total = (accel / (1 + weight)) * speedMult * timeMult;

	            if (!usingJoystick) {
	                if (keys.w) {
	                    nvy -= total;
	                }
	                if (keys.a) {
	                    nvx -= total;
	                }
	                if (keys.s) {
	                    nvy += total;
	                }
	                if (keys.d) {
	                    nvx += total;
	                }

	                if ((nvx > 0 || nvx < 0) && (nvy > 0 || nvy < 0)) {
	                    nvx *= sqrtv;
	                    nvy *= sqrtv;
	                }
	            } else {
	                pos position = pfa(0, 0, moveAngle, moveThrust * total);
	                nvx = position.x;
	                nvy = position.y;
	            }

	            b2Vec2 v = core->body->GetLinearVelocity();

				// float limit = (maxSpeed - weight) * speedMult;
	            // if (v.x > limit) {
	            //     nvx = 0;
	            // }
	            // if (v.y > limit) {
	            //     nvy = 0;
	            // }

	            core->body->ApplyForce(b2Vec2(nvx, nvy), core->body->GetWorldCenter());

	            if (mouse) {
	                core->activate();
	            }

	            // children//unitsMutex.lock();
	            for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
	                Unit *u = *it;
	                if (u->body != NULL) {
	                    u->body->ApplyForce(b2Vec2(nvx, nvy), u->body->GetWorldCenter());
						if (mouse && u->manualActivate || u->autoActivate) {
		                    u->activate();
		                }
	                }
	            }
	            // children//unitsMutex.unlock();
	        }
		}
        if (mode == MODE_FFA && lastActivity != 0 && getTime() - lastActivity > INACTIVITY_KICK_TIME) {
            kick();
        }
		if ((lastPing == 0 && getTime() - timeConnected > 10000) || (lastPing != 0 && getTime() - lastPing > 10000)) {
			kick();
		}
    }

	void send(byte *data, int size) {
		if (!disconnected) {
			io->send(data, size, uWS::OpCode::BINARY);
		}
	}

    void giveInfo() {
        int totalSize = BYTE_SIZE + FLOAT_SIZE + FLOAT_SIZE + FLOAT_SIZE + INT_SIZE + FLOAT_SIZE + INT_SIZE + FLOAT_SIZE + BYTE_SIZE +(INT_SIZE * UNIT_TYPE_NUM); // code, width, height, pixel to meter ratio, self id, frame send delta, unit limit, floater regen, frames per send, unit costs
        byte *data = static_cast<byte *>(malloc(totalSize));

        byte code = SERVER_CODE_INFO;
        float ptmr = PIXEL_TO_METER_RATIO;
        float delta = (1000 / FPS) * FRAMES_PER_SEND;
        unsigned int unitLimit = UNIT_LIMIT;
        float floaterRegen = FLOATER_REGEN;
        byte framesPerSend = FRAMES_PER_SEND;

        byte *offset = data;
        memcpy(offset, &code, BYTE_SIZE);
		offset += BYTE_SIZE;
        memcpy(offset, &width, FLOAT_SIZE);
		offset += FLOAT_SIZE;
        memcpy(offset, &height, FLOAT_SIZE);
		offset += FLOAT_SIZE;
        memcpy(offset, &ptmr, FLOAT_SIZE);
		offset += FLOAT_SIZE;
        memcpy(offset, &id, SHORT_SIZE);
		offset += SHORT_SIZE;
        memcpy(offset, &delta, FLOAT_SIZE);
		offset += FLOAT_SIZE;
        memcpy(offset, &unitLimit, INT_SIZE);
		offset += INT_SIZE;
        memcpy(offset, &floaterRegen, FLOAT_SIZE);
		offset += FLOAT_SIZE;
        memcpy(offset, &framesPerSend, BYTE_SIZE);
		offset += BYTE_SIZE;

		for (int i = 0; i < UNIT_TYPE_NUM; i++) {
			memcpy(offset, &unitDefs[i].cost, INT_SIZE);
			offset += INT_SIZE;
		}

        send(data, totalSize); // Send data

        free(data);
    }

    void play(string n, byte s) {
        try {
            if (!joined) {
                joined = true;
				totalJoined++;
				timeJoined = getTime();
				hasBuilt = false;
                name = n;
				if (s <= SOCIAL_NUM && s >= 0) {
					socialTotal = s * socialBonus;
				}
				halveStash(stash, socialTotal, name);

                pos position = randomSpawnPosition();
                x = position.x;
                y = position.y;
                core = new Unit(this, NULL, x, y, 0, 0, UNIT_CORE, MATERIAL_WOOD);

                byte data = SERVER_CODE_JOINED;
                send(&data, BYTE_SIZE); // Send data
				emitStash(0);
				calculateWeight();

                hasPlayed = true;

				if (mode == MODE_BR) {
					if (brState == STATE_WAITING) resize(totalJoined, 1);
					updateBr();
				}
            }
        } catch(...) {}
    }

    void keyEvent(byte code, byte byteState) {
        bool state = false;
        if (byteState == 1) {
            state = true;
        }
        if (code == 87 || code == 38) {
            keys.w = state;
        } else if (code == 65 || code == 37) {
            keys.a = state;
        } else if (code == 83 || code == 40) {
            keys.s = state;
        } else if (code == 68 || code == 39) {
            keys.d = state;
        } else if (code == 1) {
            mouse = state;
        }
    }

    void mouseEvent(int mx, int my) {
        if (core != NULL) {
            tx = core->x +((float)(mx) /(float)(PIXEL_TO_METER_RATIO));
            ty = core->y +((float)(my) /(float)(PIXEL_TO_METER_RATIO));

            core->angle = norm(afp(core->x, core->y, tx, ty) + M_PI / 2);
            // children//unitsMutex.lock();
            for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
                Unit *u = *it;
                if (u->spinAnimation == 0) {
                    u->angle = norm(afp(u->x, u->y, tx, ty) + M_PI / 2);
                }
            }
            // children//unitsMutex.unlock();
        }
    }

    void moveEvent(float angle, float thrust) {
        usingJoystick = true;
        moveAngle = angle;
        if (thrust > 1) {
            thrust = 1;
        } else if (thrust < 0) {
            thrust = 0;
        }
        moveThrust = thrust;
    }

    void calculateScale() {
        if (childrenUnits.size() > 0) {
            float largestDistance = 0;
            // children//unitsMutex.lock();
            for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
                Unit *u = *it;
                float distance = dfp(x, y, u->x, u->y);
                if (distance > largestDistance) {
                    largestDistance = distance;
                }
            }
            // children//unitsMutex.unlock();
            if (largestDistance > SCALE_THRESHOLD) {
                scale = 1 /((largestDistance - SCALE_THRESHOLD) * SCALE_MULT + 1);
            } else {
                scale = 1;
            }

            int totalSize = BYTE_SIZE + FLOAT_SIZE;
            byte *data = static_cast<byte *>(malloc(totalSize));

            byte code = SERVER_CODE_SCALE;

            byte *offset = data;
            memcpy(offset, &code, BYTE_SIZE);
            memcpy(offset + BYTE_SIZE, &scale, FLOAT_SIZE);

            send(data, totalSize); // Send data

            free(data);
        }
    }

	void calculateWeight() {
		weight = 0;
		if (core != NULL) {
			weight += linearScale(UNIT_WEIGHT * 2, core->material);
		}
		for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
			Unit *u = *it;
			weight += linearScale(UNIT_WEIGHT, u->material);
		}
		if (weight > WEIGHT_LIMIT) {
			weight = WEIGHT_LIMIT;
		}
		// cout << weight << endl;
	}

    void build(unsigned short id, byte type, byte material, float angle) {
        if ((mode == MODE_FFA || brState == STATE_PLAYING) && childrenUnits.size() < UNIT_LIMIT && type != UNIT_CORE && type > 0 && type < UNIT_TYPE_NUM && material >= 0 && material < MATERIAL_NUM) {
            int actualCost = (int) costScale((float) unitDefs[type].cost, material);
            if (actualCost <= stash[material]) {
                Unit *unit = findUnitById(id);
                if (unit != NULL && unit->buildable) {
                    pos position = pfa(unit->x, unit->y, angle, unit->size + unitDefs[type].size);
                    bool withinOther = false;
                    if (unit != core && core != NULL) {
                        if (dfp(position.x, position.y, core->x, core->y) <(unitDefs[type].size + core->size)) {
                            withinOther = true;
                        }
                    } else if (!withinOther) {
                        // children//unitsMutex.lock();
                        for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
                            Unit *u = *it;
                            if (u != unit && dfp(position.x, position.y, u->x, u->y) <(unitDefs[type].size + u->size)) {
                                withinOther = true;
                                break;
                            }
                        }
                        // children//unitsMutex.unlock();
                    }
                    if (!withinOther) {
                        Unit *newUnit = new Unit(this, unit, position.x, position.y, angle - M_PI / 2, angle, type, material);
                        // children//unitsMutex.lock();
                        childrenUnits.push_back(newUnit);
                        // children//unitsMutex.unlock();
                        // unit->children//unitsMutex.lock();
                        unit->childrenUnits.push_back(newUnit);
                        // unit->children//unitsMutex.unlock();
                        stash[material] -= actualCost;
                        emitStash(1);
                        calculateScale();
						calculateWeight();
						hasBuilt = true;
                    }
                }
            }
        }
    }

    void upgrade(unsigned short id) {
		if (mode == MODE_FFA || brState == STATE_PLAYING) {
	        Unit *u = findUnitById(id);
	        if (u != NULL) {
	            int actualCost = (int)(costScale(unitDefs[u->unitType].cost, u->material + 1) - costScale(unitDefs[u->unitType].cost, u->material) / 4);
	            if (actualCost <= u->owner->stash[u->material + 1] && !(u->unitType == UNIT_ALCHEMY_LAB && u->material == MATERIAL_NUM - 2)) {
	                u->material++;
	                u->updateStats();
	                u->owner->stash[u->material] -= actualCost;
	                emitStash(1);
					calculateWeight();
	            }
	        }
		}
    }

    void deleteUnit(unsigned short id) {
        Unit *u = findUnitById(id);
        if (u != NULL && u->unitType != UNIT_CORE) {
            stash[u->material] += costScale(unitDefs[u->unitType].cost, u->material) / 2;
            emitStash(1);
            delete u;
            calculateScale();
			calculateWeight();
        }
    }

    bool isInView(Object *o) {
        float viewWidth = (SCREEN_WIDTH / PIXEL_TO_METER_RATIO) / scale;
        float viewHeight = (SCREEN_HEIGHT / PIXEL_TO_METER_RATIO) / scale;
		float sx = (x - ox) * CAMERA_LAG;
		float sy = (y - oy) * CAMERA_LAG;
        // return(x > o->x - viewWidth / 2 - o->size - VIEW_PADDING - padding && x < o->x + viewWidth / 2 + o->size + VIEW_PADDING + padding && y > o->y - viewHeight / 2 - o->size - VIEW_PADDING - padding && y < o->y + viewHeight / 2 + o->size + VIEW_PADDING + padding);
		return(x > o->x + sx - viewWidth / 2 - o->size - VIEW_PADDING && x < o->x + sx + viewWidth / 2 + o->size + VIEW_PADDING && y > o->y + sy - viewHeight / 2 - o->size - VIEW_PADDING && y < o->y + sy + viewHeight / 2 + o->size + VIEW_PADDING);
    }

    void die(Player *player) {
		bool isPlayer = false;

        if (player != NULL) {
            for (int i = 0; i < MATERIAL_NUM; i++) {
                player->stash[i] += stash[i] / 2;
            }
            player->score += score / 2;
            sendKill(player, this);

			isPlayer = true;
        }

		if (isPlayer) {
			byte nameLength = player->name.length();
			int totalSize = BYTE_SIZE + BYTE_SIZE + nameLength; // code, name length, name
			byte *data = static_cast<byte *>(malloc(totalSize));
			byte code = SERVER_CODE_DIE;
			memcpy(data, &code, BYTE_SIZE);
			memcpy(data + BYTE_SIZE, &nameLength, BYTE_SIZE);
			const char *cstr = player->name.c_str();
			memcpy(data + BYTE_SIZE + BYTE_SIZE, cstr, nameLength);
			send(data, totalSize);
			free(data);
		} else {
			const char *cstr = FLOATER_KILL_MESSAGE;
			byte nameLength = strlen(cstr);
			int totalSize = BYTE_SIZE + BYTE_SIZE + nameLength; // code, name length, name
			byte *data = static_cast<byte *>(malloc(totalSize));
			byte code = SERVER_CODE_DIE;
			memcpy(data, &code, BYTE_SIZE);
			memcpy(data + BYTE_SIZE, &nameLength, BYTE_SIZE);
			memcpy(data + BYTE_SIZE + BYTE_SIZE, cstr, nameLength);
			send(data, totalSize);
			free(data);
		}

        deleteAllUnits();
        wipeInputs(&keys, &mouse);
        score = 0;
        // halveStash(stash, socialTotal);
        // emitStash(0);

		bool wasJoined = joined;
		joined = false;

		if (draining || mode == MODE_BR) {
			if (mode == MODE_BR) emitBrRank();
            kick();
        }

		if (wasJoined) totalJoined--;

        // data = SERVER_CODE_SHAKE;
        // send(&data, BYTE_SIZE);
        // //playersMutex.lock();
        // for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
        //     Player *p = *it;
        //     if (p->core != NULL && isInView(p->core)) {
        //         p->send(&data, BYTE_SIZE);
        //     }
        // }
        // //playersMutex.unlock();


		if (mode == MODE_BR) updateBr();
    }

	void emitBrRank() {
		int totalSize = BYTE_SIZE + INT_SIZE; // code, rank
		byte *data = static_cast<byte *>(malloc(totalSize));
		byte code = SERVER_CODE_BR_RANK;
		memcpy(data, &code, BYTE_SIZE);
		memcpy(data + BYTE_SIZE, &totalJoined, INT_SIZE);
		send(data, totalSize);
		free(data);
	}

    void kick() {
        byte data = SERVER_CODE_KICK;
		if (!disconnected) {
			if (joined) totalJoined--;
			joined = false;
			disconnected = true;
        	io->close(1000, &data, sizeof(data));
			// eraseAddress(address);
		}
    }

    void emit() {
        unsigned short numUnits = static_cast<int>(units.size());
        unsigned short numFloaters = static_cast<int>(floaters.size());
        unsigned short numBullets = static_cast<int>(bullets.size());
        unsigned short numPlayers = static_cast<int>(players.size());

        int dataSize = (unitDataSize * numUnits) + (floaterDataSize * numFloaters) + (bulletDataSize * numBullets) + (playerDataSize * numPlayers) + (MAX_NAME_LENGTH * numPlayers); // units, floaters, bullets, players, worst case for name lengths
		if (mode == MODE_BR) {
			dataSize += FLOAT_SIZE + FLOAT_SIZE; // width, height
		}
        int totalSize = emitMetaSize + dataSize;
        int actualSize = emitMetaSize;
        int unitsInView = 0;
        int floatersInView = 0;
        int bulletsInView = 0;
        int numPlayersInView = 0;
        Player *playersInView[maxPlayers];
        byte *data = static_cast<byte *>(malloc(totalSize));

        byte code = SERVER_CODE_UPDATE;

        byte *offset = data;
        offset += emitMetaSize;

        int i = 0;
        //unitsMutex.lock();
        for (vector<Unit *>::iterator it = units.begin(); it != units.end(); ++it) {
            Unit *u = *it;
            if (isInView((Object *) u)) {
                memcpy(offset, &u->id, SHORT_SIZE);
                offset += SHORT_SIZE;
                memcpy(offset, &u->x, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &u->y, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &u->size, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &u->angle, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &u->unitType, BYTE_SIZE);
                offset += BYTE_SIZE;
                memcpy(offset, &u->material, BYTE_SIZE);
                offset += BYTE_SIZE;
                memcpy(offset, &u->owner->id, SHORT_SIZE);
                offset += SHORT_SIZE;
                float hpp = u->hp / u->mhp;
                memcpy(offset, &hpp, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &u->rotation, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                i++;
                unitsInView++;
                bool found = false;
                if (numPlayersInView > 0) {
                    for (int i = 0; i < numPlayersInView; i++) {
                        if (playersInView[i] == u->owner) { // TODO: seg fault
                            found = true;
                            break;
                        }
                    }
                }
                if (!found && u->owner != this) {
                    playersInView[numPlayersInView] = u->owner;
                    numPlayersInView++;
                }
            }
        }
        //unitsMutex.unlock();

        // cout << "NFS " << nearFloaters.size() << endl;
        // cout << "VFS " << visibleFloaters.size() << endl;
        // unsigned long temp = getTime();
        i = 0;
        // for (vector<FloaterPointer *>::iterator it = floaters.begin(); it != floaters.end(); ++it) {
        //floatersMutex.lock();
        for (vector<Floater *>::iterator it = floaters.begin(); it != floaters.end(); ++it) {
            // FloaterPointer *fp = *it;
            // Floater *f = fp->floater;
            Floater *f = *it;

            // if (f != NULL) {
                // // // // // bool inVisible = visibleFloaters.find(f) != visibleFloaters.end();
                bool inViewed = f->viewedBy.find(this) != f->viewedBy.end();
                // bool inViewed = find(f->viewedBy.begin(), f->viewedBy.end(), this) != f->viewedBy.end();
                if (isInView((Object *) f)) {
                    if (f->dyingStage > 0) {
                        memcpy(offset, &f->id, SHORT_SIZE);
                        offset += SHORT_SIZE;
                        float negativeOne = -1;
                        memcpy(offset, &negativeOne, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        floatersInView++;
                    } else if (f->active || !inViewed) {
                        memcpy(offset, &f->id, SHORT_SIZE);
                        offset += SHORT_SIZE;
                        memcpy(offset, &f->x, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        memcpy(offset, &f->y, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        memcpy(offset, &f->size, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        memcpy(offset, &f->rotation, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        memcpy(offset, &f->material, BYTE_SIZE);
                        offset += BYTE_SIZE;
                        float hpp = f->hp / f->mhp;
                        memcpy(offset, &hpp, FLOAT_SIZE);
                        offset += FLOAT_SIZE;
                        floatersInView++;
                        if (!inViewed) {
                            f->viewedBy.insert(this);
                            // f->viewedBy.push_back(this);
                        }
                    }
                } else if (inViewed) {
                    memcpy(offset, &f->id, SHORT_SIZE);
                    offset += SHORT_SIZE;
                    float negativeOne = -1;
                    memcpy(offset, &negativeOne, FLOAT_SIZE);
                    offset += FLOAT_SIZE;
                    floatersInView++;

                    f->viewedBy.erase(this);
                    // f->viewedBy.erase(remove(f->viewedBy.begin(), f->viewedBy.end(), this), f->viewedBy.end());
                }
            }
            //floatersMutex.unlock();
        // }
        // cout << "E7 " << getTime() - temp << endl;

        i = 0;
        for (vector<Bullet *>::iterator it = bullets.begin(); it != bullets.end(); ++it) {
            Bullet *b = *it;
            if (b->body != NULL && isInView((Object *) b)) {
                memcpy(offset, &b->id, SHORT_SIZE);
                offset += SHORT_SIZE;
                memcpy(offset, &b->x, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &b->y, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &b->size, FLOAT_SIZE);
                offset += FLOAT_SIZE;
                memcpy(offset, &b->material, BYTE_SIZE);
                offset += BYTE_SIZE;
                bulletsInView++;
                i++;
            }
        }

        for (i = 0; i < numPlayersInView; i++) {
            byte nameLength = playersInView[i]->name.length(); // TODO: ! seg fault
            memcpy(offset, &playersInView[i]->id, SHORT_SIZE);
            offset += SHORT_SIZE;
            memcpy(offset, &playersInView[i]->score, INT_SIZE);
            offset += INT_SIZE;
            memcpy(offset, &nameLength, BYTE_SIZE);
            offset += BYTE_SIZE;
            const char *cstr = playersInView[i]->name.c_str();
            memcpy(offset, cstr, nameLength);
            offset += nameLength;
            actualSize += nameLength;
        }

        actualSize = (int)(offset - data);//+= (unitDataSize * unitsInView) +(floaterDataSize * floatersInView) +(bulletDataSize * bulletsInView) +(playerDataSize * numPlayersInView);

        offset = data;
        memcpy(offset, &code, BYTE_SIZE);
        offset += BYTE_SIZE;
        memcpy(offset, &unitsInView, SHORT_SIZE);
        offset += SHORT_SIZE;
        memcpy(offset, &floatersInView, SHORT_SIZE);
        offset += SHORT_SIZE;
        memcpy(offset, &bulletsInView, SHORT_SIZE);
        offset += SHORT_SIZE;
        memcpy(offset, &numPlayersInView, SHORT_SIZE);
        offset += SHORT_SIZE;
		if (mode == MODE_BR) {
			memcpy(offset, &width, FLOAT_SIZE);
	        offset += FLOAT_SIZE;
			memcpy(offset, &height, FLOAT_SIZE);
	        offset += FLOAT_SIZE;
		}

        // Thing was here(actualSize = offset;//+= ...)

        send(data, actualSize); // Send data

        free(data);
    }

    void emitStash(byte notify) {
        int totalSize = BYTE_SIZE + BYTE_SIZE +(INT_SIZE *(MATERIAL_NUM + 1)); // code, notify, material 1 ... material x, score
        byte *data = static_cast<byte *>(malloc(totalSize));

        byte code = SERVER_CODE_STASH;
        byte notifyByte = 0;

        byte *offset = data;
        memcpy(offset, &code, BYTE_SIZE);
        memcpy(offset + BYTE_SIZE, &notify, BYTE_SIZE);

        offset += BYTE_SIZE + BYTE_SIZE;
        for (int i = 0; i < MATERIAL_NUM; i++) {
            memcpy(offset, &stash[i], INT_SIZE);
            offset += INT_SIZE;
        }

        memcpy(offset, &score, INT_SIZE);

        send(data, totalSize); // Send data

        free(data);
    }
};

bool Unit::update() {
	ox = x;
	oy = y;
    bool touchingWall = updateBody();
	bool alive = true;

	if (mode == MODE_BR && touchingWall) {
		alive = handleHealth(BR_WALL_DAMAGE, NULL);
	}

	if (alive) {
	    if (hp < mhp) {
	        hp += (mhp * regen);
	    }

	    angle += spinAnimation;

	    if (parent != NULL && parentJoint == NULL) {
	        float totalDistance = parent->size;
	        if (bodyType == SHAPE_CIRCLE) {
	            totalDistance += size;
	        } else if (bodyType == SHAPE_TRIANGLE) {
	            totalDistance += size / 2;
	        }
	        pos position = pfa(parent->x, parent->y, angleFromParent, totalDistance);
	        x = position.x;
	        y = position.y;
	        body->SetTransform(b2Vec2(x, y), angleFromParent + M_PI / 2);
	        b2WeldJointDef jointDef;
	        jointDef.Initialize(parent->body, body, parent->body->GetWorldCenter());
	        parentJoint = world.CreateJoint(&jointDef);
	        byte dummy = 0;
	        parentJoint->SetUserData(&dummy);
	    }

		if (body != NULL) {
			v = body->GetLinearVelocity();
		}

		if ((!touchingWall || mode == MODE_BR) && unitType != UNIT_CORE &&(abs(ox - x) > GLITCH_SPEED || abs(oy - y) > GLITCH_SPEED)) {
			owner->stash[material] += costScale(unitDefs[unitType].cost, material);
			if (owner->core != NULL) {
				owner->core->hp = owner->core->mhp;
			}
	        owner->emitStash(1);
	        delete this; // deletes unit
			owner->calculateScale();
			owner->calculateWeight();
			return false;
		}

		return true;
	}

	return (this->unitType == UNIT_CORE); // Signals to the loop that the unit has been deleted (i.e. not alive) only if the unit is *not* a core
}

void activateBasicTurret(Unit *u) {
    fire(u, u->x, u->y, 0);
}

void activateCore(Unit *u) {
    fire(u, u->x, u->y, 0);
}

void activateSniperTurret(Unit *u) {
    fire(u, u->x, u->y, 0);
}

void activateTwinTurret(Unit *u) {
    pos position = pfa(u->x, u->y, u->angle + M_PI / 2 + ((M_PI / 2) * u->lastFireSide), unitDefs[u->unitType].bulletSize);
    fire(u, position.x, position.y, 0);
    if (u->lastFireSide > 0) {
        u->lastFireSide = -1;
    } else {
        u->lastFireSide = 1;
    }
}

void activateCannonTurret(Unit *u) {
    fire(u, u->x, u->y, 0);
}

/*
Thread 1 "a.out" received signal SIGSEGV, Segmentation fault.
0x0000000000404285 in activateHealingUnit (u=0x73c990) at main.cpp:1469
1469    main.cpp: No such file or directory.
#0  0x0000000000404285 in activateHealingUnit (u=0x73c990) at main.cpp:1469
#1  0x00000000004046b6 in Unit::activate (this=0x73c990) at main.cpp:1530
#2  0x000000000040c155 in Player::update (this=0x6846d0, timeMult=1) at main.cpp:894
#3  0x0000000000406b84 in main (argc=1, argv=0x7fffffffecb8) at main.cpp:2060
*/

void activateHealingUnit(Unit *u) {
	if (u->parent != NULL) {
	    u->parent->hp += u->heal; // TODO: seg fault here
	    if (u->parent->hp > u->parent->mhp) {
	        u->parent->hp = u->parent->mhp;
	    }
	    // u->children//unitsMutex.lock();
	    for (vector<Unit *>::iterator it = u->childrenUnits.begin(); it != u->childrenUnits.end(); ++it) {
	        Unit *cu = *it;
	        cu->hp += u->heal;
	        if (cu->hp > cu->mhp) {
	            cu->hp = cu->mhp;
	        }
	    }
	    // u->children//unitsMutex.unlock();
	}
}

void activateAlchemyLab(Unit *u) {
    bool cycleFound = false;
	int targetMaterial = u->material + 1;
    int i = 0;
    while (!cycleFound && i < MATERIAL_NUM - 1) {
        int ownAmount = 0;
        int targetAmount = 0;
        if (u->alchemyCycle > targetMaterial) {
            ownAmount = expScale(1, u->alchemyCycle - targetMaterial);
            targetAmount = 1;
        } else {
            ownAmount = 1;
            targetAmount = expScale(1, targetMaterial - u->alchemyCycle);
        }
        if (u->alchemyCycle != targetMaterial && u->owner->stash[u->alchemyCycle] >= targetAmount) {
            u->owner->stash[targetMaterial] += ownAmount;
            u->owner->stash[u->alchemyCycle] -= targetAmount;
            if (u->owner->stash[u->alchemyCycle] < 0) {
                u->owner->stash[u->alchemyCycle] = 0;
            }
            u->alchemyCycle++;
            if (u->alchemyCycle >= MATERIAL_NUM) {
                u->alchemyCycle = 0;
            }
            u->owner->emitStash(0);
            break;
        } else {
            u->alchemyCycle++;
        }
        if (u->alchemyCycle >= MATERIAL_NUM) {
            u->alchemyCycle = 0;
        }
        i++;
    }
}

void activateOctaTurret(Unit *u) {
    for (int i = 0; i < 8; i++) {
        fire(u, u->x, u->y,((M_PI * 2) / 8) * i);
    }
}

void(*activateFunctions[UNIT_TYPE_NUM])(Unit *) = {activateCore, NULL, activateBasicTurret, activateSniperTurret, activateTwinTurret, activateCannonTurret, activateHealingUnit, activateAlchemyLab, NULL, activateOctaTurret};

void Unit::activate() {
    if (getTime() - lastActivated > activationReloadTime) {
        activateFunctions[unitType](this);
        lastActivated = system_clock::now().time_since_epoch() / milliseconds(1);
    }
}

void Unit::updateStats() {
    owner->speedMult -= speedBoost;
    hp = amountScale(unitDefs[unitType].hp, material);
    mhp = hp;
    bulletDamage = amountScale(unitDefs[unitType].bulletDamage, material);
    speedBoost = unitDefs[unitType].speedBoost + amountScale(unitDefs[unitType].speedBoostUpgrade, material);
    spinAnimation = amountScale(unitDefs[unitType].spinAnimation, material);
    owner->speedMult += speedBoost;
	if (owner->speedMult > 2) {
		owner->speedMult = 2;
	}
    collisionDamage = amountScale(unitDefs[unitType].collisionDamage, material);
    heal = amountScale(unitDefs[unitType].heal, material);
}

void Object::createBody() {
    b2BodyDef bodyDef;
    bodyDef.type = b2_dynamicBody;
    bodyDef.position.Set(x, y);
    bodyDef.linearDamping = linearDamping;
    bodyDef.angularDamping = angularDamping;
    bodyDef.awake = true;
    body = world.CreateBody(&bodyDef);

    b2FixtureDef fixtureDef;

    b2CircleShape dynamicCircle;
    b2PolygonShape dynamicPolygon;

    float areaRatio = 1;

    if (bodyType == SHAPE_CIRCLE) {
        bodyDef.fixedRotation = true;
        dynamicCircle.m_p.Set(0.0f, 0.0f);
        dynamicCircle.m_radius = size;
        fixtureDef.shape = &dynamicCircle;
        areaRatio = (M_PI * pow(1, 2)) /(M_PI * pow(size, 2));
    } else if (bodyType = SHAPE_TRIANGLE) {
        b2Vec2 vertices[3];
        vertices[0].Set(0, -size);
        vertices[1].Set(size, size);
        vertices[2].Set(-size, size);
        dynamicPolygon.Set(vertices, 3);
        fixtureDef.shape = &dynamicPolygon;
        areaRatio = (M_PI * pow(1, 2)) /(pow(size, 2) * 2);
    }

    fixtureDef.density = density * areaRatio;
    fixtureDef.friction = friction;
    body->CreateFixture(&fixtureDef);

    if (type == TYPE_FLOATER) {
        body->SetTransform(body->GetPosition(),(float)(rand()) /(RAND_MAX / M_PI));
    } else if (type == TYPE_UNIT) {
        Unit *u = (Unit *) this;
        u->body->SetTransform(body->GetPosition(), u->angleFromParent + M_PI / 2);
    }

    dataPointer *dp = new dataPointer();
    dp->type = type;
    dp->data = this;
    body->SetUserData(dp);

    b2Vec2 position = body->GetPosition();
}

void handleHealthGlobal(int type, void *object, float damage, Player *player) {
    if (type == TYPE_UNIT) {
        Unit *u = (Unit *) object;
        u->handleHealth(damage, player);
    } else if (type == TYPE_FLOATER) {
        Floater *f = (Floater *) object;
        f->handleHealth(damage, player);
    }
}

void Object::bulletHit(Bullet *bullet) {
    handleHealthGlobal(type, this, bullet->damage, bullet->owner);
}

void Object::collisionHit(int type, void *object) {
    if (type == TYPE_UNIT && (mode == MODE_FFA || brState == STATE_PLAYING)) {
        Unit *u = (Unit *) object;
        handleHealthGlobal(this->type, this, u->collisionDamage, u->owner);
    } else if (type == TYPE_FLOATER) {
        Floater *f = (Floater *) object;
        handleHealthGlobal(this->type, this, f->collisionDamage, NULL);
    }
}

bool Unit::handleHealth(float damage, Player *player) {
	if (owner != NULL) {
		bool takeDamage;
		if (mode == MODE_FFA) {
			takeDamage = (owner->hasBuilt);//(getTime() - owner->timeJoined > SHIELD_TIME);
			if (player != NULL) {
				takeDamage = (takeDamage && player->hasBuilt);
			}
		} else if (mode == MODE_BR) {
			takeDamage = (brState == STATE_PLAYING);
		}
		if (takeDamage) {
		    hp -= damage;
		    if (hp <= 0) {
		        if (unitType == UNIT_CORE) {
		            if (mode == MODE_FFA) {
						owner->die(player);
					} else {
						owner->emitBrRank();
						owner->kick();
					}
		        } else {
		            if (player != NULL) {
		                int amount = costScale(unitDefs[unitType].cost / 2, material);
		                player->stash[material] += amount;
		                player->score += amount;
		            }
					Player *myOwner = owner;
		            delete this; // ! deletes unit
					if (myOwner != NULL) {
		            	myOwner->calculateScale();
						myOwner->calculateWeight();
					}
		        }
		        if (player != NULL) {
		            player->emitStash(1);
		        }
				return false;
		    }
		}
	}
	return true;
}

void Floater::handleHealth(float damage, Player *player) {
	if (mode == MODE_FFA || brState == STATE_PLAYING) {
	    hp -= damage;
	    if (hp <= 0) {
	        if (player != NULL) { // : nullify bullet owner when that owner leaves the game
	            int amount = rewardScale(sizeTier + 1, material);// * (floaterRewardMult / pow(2, material));
				// cout << floaterRewardMult << ", " << amount << ", " << static_cast<int>(material) << ", " << rewardScale(sizeTier + 1, material) << endl;
				// cout << "?" << amount << endl;
				/*if (floaterRewardMult != 1) */amount *= /*(*/floaterRewardMult;// / pow(2, material));
				// cout << "!" << amount << endl;
	            player->stash[material] += amount;
	            player->score += amount;
	            player->emitStash(0);
	        }
	        if (dyingStage == 0 && desiredFloaters - floaters.size() >= 0) {
				pos position = randomSpawnPosition();
				new Floater(material, position.x, position.y);
			}
	        dyingStage = 1;
	    }
	}
}

Floater::~Floater() {
    if (body != NULL) {
        delete(dataPointer *)(body->GetUserData());
        body->SetUserData(NULL);
    }
    //floatersMutex.lock();
    //floaters.erase(this);//remove(floaters.begin(), floaters.end(), this), floaters.end());
    floaters.erase(remove(floaters.begin(), floaters.end(), this), floaters.end());
    //floatersMutex.unlock();
    // for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
    //     Player *p = *it;
    //     p->visibleFloaters.erase(this);//remove(p->visibleFloaters.begin(), p->visibleFloaters.end(), this), p->visibleFloaters.end());
    // }
}

Unit::~Unit() {
    if (body != NULL) {
        delete(dataPointer *)(body->GetUserData());
        body->SetUserData(NULL);
    }
    if (parentJoint != NULL) {
        parentJoint->SetUserData(NULL);
    }
    // owner->children//unitsMutex.lock();
    owner->childrenUnits.erase(remove(owner->childrenUnits.begin(), owner->childrenUnits.end(), this), owner->childrenUnits.end());//owner->childrenUnits.erase(this);
    // owner->children//unitsMutex.unlock();
    if (unitType != UNIT_CORE) {
        if (parent != NULL) {
            // parent->children//unitsMutex.lock();
            parent->childrenUnits.erase(remove(parent->childrenUnits.begin(), parent->childrenUnits.end(), this), parent->childrenUnits.end());
            // parent->children//unitsMutex.unlock();
        }
    }
    // children//unitsMutex.lock();
    for (vector<Unit *>::iterator it = childrenUnits.begin(); it != childrenUnits.end(); ++it) {
        Unit *u = *it;
        if (u->parentJoint != NULL) {
            u->parentJoint->SetUserData(NULL);
        }
        u->parentJoint = NULL;
        if (parent != NULL) {
            u->parent = parent;
            // u->parent->children//unitsMutex.lock();
            u->parent->childrenUnits.push_back(u);
            // u->parent->children//unitsMutex.unlock();
            u->angleFromParent = afp(parent->x, parent->y, u->x, u->y) + M_PI;
        } else {
            u->parent = NULL;
        }
    }
    // children//unitsMutex.unlock();
    owner->speedMult -= speedBoost;
    //unitsMutex.lock();
    units.erase(remove(units.begin(), units.end(), this), units.end());//units.erase(this);
    //unitsMutex.unlock();
}

Bullet::~Bullet() {
    if (body != NULL) {
        delete(dataPointer *)(body->GetUserData());
        body->SetUserData(NULL);
    }
    if (owner != NULL) {
        // owner->children//bulletsMutex.lock();
        owner->childrenBullets.erase(remove(owner->childrenBullets.begin(), owner->childrenBullets.end(), this), owner->childrenBullets.end());//owner->childrenBullets.erase(this);
        // owner->children//bulletsMutex.unlock();
    }
    bullets.erase(remove(bullets.begin(),bullets.end(), this), bullets.end());
}

class contactListener: public b2ContactListener {
    void BeginContact(b2Contact* contact) {
        void *p1 = contact->GetFixtureA()->GetBody()->GetUserData();
        void *p2 = contact->GetFixtureB()->GetBody()->GetUserData();
        if (p1 != NULL && p2 != NULL) {
            dataPointer *d1 = (dataPointer *)(p1);
            dataPointer *d2 = (dataPointer *)(p2);
            if ((d1->type == TYPE_BULLET && d2->type == TYPE_UNIT) ||(d1->type == TYPE_UNIT && d2->type == TYPE_BULLET)) {
                Bullet *b;
                Unit *u;
                if (d1->type == TYPE_BULLET && d2->type == TYPE_UNIT) {
                    b = (Bullet *) d1->data;
                    u = (Unit *) d2->data;
                } else {
                    b = (Bullet *) d2->data;
                    u = (Unit *) d1->data;
                }

                u->Object::bulletHit(b);

                delete b;
            } else if ((d1->type == TYPE_BULLET && d2->type == TYPE_FLOATER) ||(d1->type == TYPE_FLOATER && d2->type == TYPE_BULLET)) {
                Bullet *b;
                Floater *f;
                if (d1->type == TYPE_BULLET && d2->type == TYPE_FLOATER) {
                    b = (Bullet *) d1->data;
                    f = (Floater *) d2->data;
                } else {
                    b = (Bullet *) d2->data;
                    f = (Floater *) d1->data;
                }

                f->Object::bulletHit(b);

                delete b;
            } else if (d1->type == TYPE_UNIT && d2->type == TYPE_UNIT) {
                Unit *u1;
                Unit *u2;
                u1 = (Unit *) d1->data;
                u2 = (Unit *) d2->data;

                if (u1->owner != u2->owner) {
                    u1->Object::collisionHit(TYPE_UNIT, u2);
                    u2->Object::collisionHit(TYPE_UNIT, u1);
                }
            } else if ((d1->type == TYPE_UNIT && d2->type == TYPE_FLOATER) ||(d1->type == TYPE_FLOATER && d2->type == TYPE_UNIT)) {
                Unit *u;
                Floater *f;
                if (d1->type == TYPE_UNIT && d2->type == TYPE_FLOATER) {
                    u = (Unit *) d1->data;
                    f = (Floater *) d2->data;
                } else {
                    u = (Unit *) d2->data;
                    f = (Floater *) d1->data;
                }

                f->Object::collisionHit(TYPE_UNIT, u);
                u->Object::collisionHit(TYPE_FLOATER, f);
            }
        }
    }
};

class contactFilter: public b2ContactFilter {
    bool ShouldCollide(b2Fixture* a, b2Fixture* b) {
        bool collide = true;

        void *p1 = a->GetBody()->GetUserData();
        void *p2 = b->GetBody()->GetUserData();
        if (p1 != NULL && p2 != NULL) {
            dataPointer *d1 = (dataPointer *)(p1);
            dataPointer *d2 = (dataPointer *)(p2);

            if (d1->type == TYPE_BULLET && d2->type == TYPE_BULLET) {
                collide = false;
            } else if ((d1->type == TYPE_BULLET && d2->type == TYPE_UNIT) ||(d1->type == TYPE_UNIT && d2->type == TYPE_BULLET)) {
                Bullet *b;
                Unit *u;
                if (d1->type == TYPE_BULLET && d2->type == TYPE_UNIT) {
                    b = (Bullet *) d1->data;
                    u = (Unit *) d2->data;
                } else {
                    b = (Bullet *) d2->data;
                    u = (Unit *) d1->data;
                }
                if (b->owner == u->owner) {
                    collide = false;
                }
            }
        }
        return collide;
    }
};

// void statusServer() {
//     int serverSocket = createServerSocket(7000);
//     char *responseStart = "HTTP/2.0 200 Found\nAccess-Control-Allow-Origin: *\nContent-Type: text/plain\n\n";
//     char *responseFormat = "###\n###\n###.###.###\n###\n############";
//     cout << "Status server listening on port 7000" << endl;
//
//     while (true) {
//         int connectionSocket = waitForConnection(serverSocket);
//
// 		int n = maxPlayers;
// 		if (draining) {
// 			n = -1;
// 		}
//         char message[strlen(responseStart) + strlen(responseFormat)];
// 		if (averageTime == 0) {
// 			averageTime = 1000;
// 		}
//         sprintf(message, "%s%d\n%d\n%s\n%d\n%d", responseStart, static_cast<int>(players.size()), n, VERSION, 1000 / averageTime, restarts);
//         write(connectionSocket, message, strlen(message));
//         close(connectionSocket);
//     }
// }

void interface() {
    int interfaceCode = -1;
    ifstream in;
    ofstream out;
    string data;
    cout << "Interface listening to /tmp/game" << endl;
    while (true) {
		if (mode == MODE_FFA) {
        	in.open("/tmp/game");
		} else if (mode == MODE_BR) {
			in.open("/tmp/br");
		}
        getline(in, data);
		if (mode == MODE_FFA) {
        	out.open("/tmp/game", ios::out | ios::trunc);;
		} else if (mode == MODE_BR) {
			out.open("/tmp/br", ios::out | ios::trunc);
		}
        if (data.length() > 0) {
            interfaceCode = stoi(data);
            if (interfaceCode == INTERFACE_DRAIN) {
                cout << "Draining server" << endl;
                draining = true;
				drainTime = getTime();
				if (mode == MODE_BR && brState == STATE_WAITING) {
					cout << "Exiting due to drain (battle royale)" << endl;
					updateRestarts(-1);
			        exit(0);
				}
            }
        }
        in.close();
        out.close();

		updateStatus();
		updateRestarts(0);

        if (lastFrame != 0 && getTime() - lastFrame > FRAME_FROZEN_TIME) {
            cout << "Exiting due to a frame timeout (infinite loop or low performance)" << endl;
            exit(0);
        } else if (drainTime != 0 && getTime() - drainTime > DRAIN_TIMEOUT) {
			cout << "Exiting due to drain (timeout elapsed)" << endl;
			updateRestarts(-1);
            exit(0);
		}
        sleep(1);
    }
}

int main(int argc, char *argv[]) {
    cout << "Version " << VERSION << endl;

    srand(time(0));

	if (argc > 1) {
		if (strcmp(argv[1], "br") == 0) {
			mode = MODE_BR;
			emitMetaSize += FLOAT_SIZE + FLOAT_SIZE; // width, height
			socialBonus = BR_BONUS;
			floaterRewardMult = BR_REWARD;
			unitDefs[7].activationReloadTime /= 10;
		}
	}

	if (mode == MODE_FFA) {
		cout << "Game mode: free for all" << endl;
	} else if (mode == MODE_BR) {
		cout << "Game mode: battle royale" << endl;
	}

    if (argc > 2) {
        maxPlayers = atoi(argv[2]);
    }

    if (argc > 3) {
        floaterRewardMult = atof(argv[3]);
    }

    int m = MATERIAL_NUM - 1;
    for (int i = 0; i < FLOATER_SPAWN_SERIES_LENGTH; ) {
        int n = pow(2,(MATERIAL_NUM - 1) - m);
        for (int j = 0; j < n; j++) {
            floaterSpawnSeries[i + j] = m - 1;
        }
        i += n;
        m--;
    }

	if (mode == MODE_FFA) resize(0, 1);

    // thread status(statusServer);
    // thread looper(loop);
    thread interfaceThread(interface);

    uWS::Hub h;

    // Define a callback to handle incoming messages
    h.onMessage([](uWS::WebSocket<uWS::SERVER> *ws, char *data, size_t length, uWS::OpCode opCode) {
        short code = (short)(data[0]);

        Player *p = (Player *) ws->getUserData();

        if (p != NULL) {
            try {
                bool validCode = true;
                if (code == CLIENT_CODE_READY && length == CLIENT_LENGTH_READY) {
                    p->ready = true;
                    p->giveInfo();
                } else if (code == CLIENT_CODE_KEY && length == CLIENT_LENGTH_KEY) {
                    p->keyEvent((byte)(data[1]),(byte)(data[2]));
                } else if (code == CLIENT_CODE_PLAY && length >= CLIENT_LENGTH_PLAY) {
                    int nlength = (int) data[1];
					if (nlength > MAX_NAME_LENGTH) {
						nlength = MAX_NAME_LENGTH;
					}
					if (length == CLIENT_LENGTH_PLAY + nlength) {
	                    byte socialNum = (byte) data[2];
	                    char nameArray[nlength + 1];
	                    for (int i = 0; i < nlength; i++) {
	                        nameArray[i] = (char) data[i + 3];
	                    }
	                    nameArray[nlength] = '\0';
	                    string nameString(nameArray);
						if (mode == MODE_FFA) {
	                    	p->play(nameString, socialNum);
						} else if (mode == MODE_BR) {
							p->play(nameString, 1);
						}
					}
                } else if (code == CLIENT_CODE_MOUSE && length == CLIENT_LENGTH_MOUSE) {
                    int x = 0;
                    int y = 0;
                    memcpy(&x, &data[BYTE_SIZE], INT_SIZE);
                    memcpy(&y, &data[BYTE_SIZE + INT_SIZE], INT_SIZE);
                    p->mouseEvent(x, y);
                } else if (code == CLIENT_CODE_MOVE && length == CLIENT_LENGTH_MOVE) {
                    float angle = 0;
                    float thrust = 0;
                    memcpy(&angle, &data[BYTE_SIZE], FLOAT_SIZE);
                    memcpy(&thrust, &data[BYTE_SIZE + FLOAT_SIZE], FLOAT_SIZE);
                    p->moveEvent(angle, thrust);
                } else if (code == CLIENT_CODE_BUILD && length == CLIENT_LENGTH_BUILD) {
                    unsigned short id = 0;
                    byte type = 0;
                    byte material = 0;
                    float angle = 0;
                    memcpy(&id, &data[BYTE_SIZE], SHORT_SIZE);
                    memcpy(&type, &data[BYTE_SIZE + SHORT_SIZE], BYTE_SIZE);
                    memcpy(&material, &data[BYTE_SIZE + SHORT_SIZE + BYTE_SIZE], BYTE_SIZE);
                    memcpy(&angle, &data[BYTE_SIZE + SHORT_SIZE + BYTE_SIZE + BYTE_SIZE], FLOAT_SIZE);
                    p->build(id, type, material, angle);
                } else if (code == CLIENT_CODE_UPGRADE && length == CLIENT_LENGTH_UPGRADE) {
                    unsigned short id = 0;
                    memcpy(&id, &data[BYTE_SIZE], SHORT_SIZE);
                    p->upgrade(id);
                } else if (code == CLIENT_CODE_DELETE && length == CLIENT_LENGTH_DELETE) {
                    unsigned short id = 0;
                    memcpy(&id, &data[BYTE_SIZE], SHORT_SIZE);
                    p->deleteUnit(id);
				} else if (code == CLIENT_CODE_PING && length == CLIENT_LENGTH_PING) {
					p->lastPing = getTime();
                } else {
                    validCode = false;
                }
                if (validCode) {
                    p->lastActivity = getTime();
                }
            } catch(...) {}
        }
    });

    h.onConnection([](uWS::WebSocket<uWS::SERVER> *ws, uWS::HttpRequest req) {
		// const char *address = ws->getAddress().address;
		// if (addresses.count(address)) {
		// 	addresses[address]++;
		// } else {
		// 	addresses[address] = 1;
		// }
		// cout << address << ": " << addresses[address] << " (" << addresses.size() << ")" << endl;
		bool allow;
		if (mode == MODE_FFA) {
			allow = (!draining && /*addresses[address] <= SAME_IP_LIMIT && */players.size() < maxPlayers);
		} else if (mode == MODE_BR) {
			allow = (brState == STATE_WAITING);
		}
        if (allow) {
            pos position = randomSpawnPosition();
            new Player(ws/*, address*/);
			if (mode == MODE_FFA) {
				resize(players.size(), 1);
			}
        } else {
            byte data = SERVER_CODE_KICK;
            ws->close(1000, &data, sizeof(data));
			// eraseAddress(address);
        }
    });

    h.onDisconnection([](uWS::WebSocket<uWS::SERVER> *ws, int code, char *message, size_t length) {
        void *data = ws->getUserData();
        if (data != NULL) {
            Player *p = (Player *) data;
			// eraseAddress(p->address);
            p->disconnected = true;
			if (p->joined) totalJoined--;
			if (mode == MODE_FFA) {
				resize(players.size() - 1, -1);
			} else if (mode == MODE_BR) {
				if (brState == STATE_WAITING) resize(totalJoined, -1);
				updateBr();
			}
        }
    });

	// uS::TLS::Context tls = uS::TLS::createContext("ssl/cert.pem", "ssl/key.pem", "dsSZy6pQRNkKAfpRWEdyGm7k");

	int port = 9002;
	if (mode == MODE_BR) port = 9003;
    if (h.listen(port/*, tls*/)) {
        cout << "Game server listening on port " << port << endl;
		// h.run();

		cout << "Game loop starting" << endl;
	    cout << "Player capacity: " << MAX_PLAYERS << endl;

	    contactListener listener;
	    world.SetContactListener(&listener);
	    contactFilter filter;
	    world.SetContactFilter(&filter);

		float timeStep = 1.0f / FPS;
		int velocityIterations = 6;
		int positionIterations = 2;

	    unsigned long lastLeaderboardUpdate = getTime();
	    // unsigned long lastTest = getTime();
	    unsigned long targetDuration = 1000 / FPS;
		unsigned long lastCheck = getTime();
	    milliseconds duration(targetDuration);
	    lastFrame = getTime();
	    // unsigned long totalLastFrame = getTime();
	    double timeMult = 1;

	    while (true) {
			h.poll();

	        bool emitting = (frameCount % FRAMES_PER_SEND == 0);

			if (mode == MODE_BR && brState == STATE_PLAYING) {
				width -= brShrink;
				height -= brShrink;
				if (width < 0 || height < 0) {
					width = 0;
					height = 0;
				}
			}

	        //unitsMutex.lock();
	        for (vector<Unit *>::iterator it = units.begin(); it != units.end(); ) {
	            Unit *u = *it;
	            if (u->update()) {
					++it;
				}
	        }
	        //unitsMutex.unlock();

	        //floatersMutex.lock();
	        for (vector<Floater *>::iterator it = floaters.begin(); it != floaters.end(); ) {
	            Floater *f = *it;
	            if (f->update(emitting)) {
					++it;
				}
	        }
	        //floatersMutex.unlock();

	        for (vector<Bullet *>::iterator it = bullets.begin(); it != bullets.end(); ) {
	            Bullet *b = *it;
	            if (b->update()) {
	                ++it;
	            }
	        }

	        //playersMutex.lock();
	        for (vector<Player *>::iterator it = players.begin(); it != players.end(); ) {
	            Player *p = *it;
	            if (p->disconnected) {
	                delete p;
	            } else {
	                p->update(timeMult);
	                if (p->ready && p->hasPlayed && emitting) {
	                    p->emit();
	                }
	                ++it;
	            }
	        }
	        //playersMutex.unlock();

	        for (b2Body *body = world.GetBodyList(); body; body = body->GetNext()) {
	            if (body->GetUserData() == NULL) {
	                world.DestroyBody(body);
	            }
	        }

	        for (b2Joint *joint = world.GetJointList(); joint; joint = joint->GetNext()) {
	            if (joint->GetUserData() == NULL) {
	                world.DestroyJoint(joint);
	            }
	        }

	        if (getTime() - lastLeaderboardUpdate > LEADERBOARD_UPDATE_INTERVAL) {
	            updateLeaderboard();
	            checkDrain();
	            lastLeaderboardUpdate = getTime();
	        }

	        frameCount++;

	        unsigned long timeSinceLast = getTime() - lastFrame;
			averageTime = (averageTime + (getTime() - lastCheck)) / 2;
			lastCheck = getTime();

	        if (timeSinceLast < targetDuration) {
				if ((targetDuration - timeSinceLast) > 0) {
		            milliseconds intervalDuration(targetDuration - timeSinceLast);
		            std::this_thread::sleep_for(intervalDuration);
				}
				timeMult = 1;
	        } else {
	            timeMult = 1 + (float) (timeSinceLast - targetDuration) / (float) targetDuration;
	        }

	        // timeMult = (float)(getTime() - totalLastFrame) /(float) targetDuration;
	        lastFrame = getTime();

	        // if (getTime() - lastTest > 1000) {
	        //     cout << "(target duration) " << targetDuration << ",(time since last) " << timeSinceLast << endl;
	        //     cout << "(time since total last frame) " <<(getTime() - totalLastFrame) << ",(target duration) " << targetDuration << endl;
	        //     cout << "(time mult) " << timeMult << endl;
	        //     lastTest = getTime();
	        // }

	        world.Step(timeStep * timeMult, velocityIterations, positionIterations);
	    }
    }

    return 0;
}

void resize(int n, int direction) {
	if ((direction > 0 && n % RESIZE_INTERVAL == 0) || (direction < 0 && (n + 1) % RESIZE_INTERVAL == 0) || mode == MODE_BR) {
		if (n < MAX_PLAYERS && mode == MODE_FFA) {
			if (direction > 0) {
				n += RESIZE_INTERVAL;
			} else {
				n++;
			}
		}

		bool growing = false;
		bool shrinking = false;
		float areaPerPlayer = AREA_PER_PLAYER;
		if (mode == MODE_BR) {
			areaPerPlayer = BR_AREA_PER_PLAYER;
		}
		float newArenaSize = sqrt(areaPerPlayer * n);
		float arenaDelta = newArenaSize - arenaSize;
		if (newArenaSize > arenaSize) {
			growing = true;
		} else if (newArenaSize < arenaSize) {
			shrinking = true;
		}
		arenaSize = newArenaSize;
		width = arenaSize;
		height = arenaSize;
		desiredFloaters = n * FLOATERS_PER_PLAYER;

		if (growing) {
			int diff = desiredFloaters - floaters.size();
			for (int i = 0; i < diff; i++) {
				float x = 0;
				float y = 0;
				int side = rand() % static_cast<int>(4); // 0: top, 1: right, 2: bottom, 3: left
				if (side == 0 || side == 2) {
					x = (float)(rand() /(RAND_MAX / width) - width / 2);
					if (side == 0) {
						y = (float)(rand() /(RAND_MAX /(arenaDelta / 2)) - height / 2);
					} else if (side == 2) {
						y = (float)(rand() /(RAND_MAX /(arenaDelta / 2)) +(height -(arenaDelta / 2)) - height / 2);
					}
				} else if (side == 1 || side == 3) {
					y = (float)(rand() /(RAND_MAX / height) - height / 2);
					if (side == 1) {
						x = (float)(rand() /(RAND_MAX /(arenaDelta / 2)) - width / 2);
					} else if (side == 3) {
						x = (float)(rand() /(RAND_MAX /(arenaDelta / 2)) +(height -(arenaDelta / 2)) - width / 2);
					}
				}
		        new Floater(floaterSpawnSeries[fspi], x, y);
		        fspi++;
		        if (fspi > FLOATER_SPAWN_SERIES_LENGTH - 1) {
		            fspi = 0;
		        }
		    }
		} else if (shrinking) {
			//floatersMutex.lock();
			for (vector<Floater *>::iterator it = floaters.begin(); it != floaters.end(); ) {
				Floater *f = *it;
				if (f->x < -width / 2 + f->size || f->x > width / 2 - f->size || f->y < -height / 2 + f->size || f->y > height / 2 - f->size) {
					delete f;
				} else {
					++it;
				}
			}
			//floatersMutex.unlock();
		}

	    int totalSize = BYTE_SIZE + FLOAT_SIZE + FLOAT_SIZE; // code, width, height
	    byte *data = static_cast<byte *>(malloc(totalSize));
	    byte code = SERVER_CODE_RESIZE;
	    memcpy(data, &code, BYTE_SIZE);
	    memcpy(data + BYTE_SIZE, &width, FLOAT_SIZE);
	    memcpy(data + BYTE_SIZE + FLOAT_SIZE, &height, FLOAT_SIZE);

		//playersMutex.lock();
		for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
	        Player *p = *it;
	        p->send(data, totalSize); // Send data
	    }
		//playersMutex.unlock();

	    free(data);
	}
}

void fire(Unit *u, float x, float y, float angle) {
	// if (mode == MODE_FFA || brState == STATE_PLAYING) {
	    pos velocity = pfa(0, 0, u->angle + M_PI / 2 + angle, u->bulletSpeed);
		velocity.x += u->v.x;
		velocity.y += u->v.y;
	    pos pushVelocity = pfa(0, 0, u->angle + M_PI * 1.5 + angle, u->bulletSpeed / 16);
	    pos position = pfa(x, y, u->angle + M_PI / 2 + angle, u->size - unitDefs[u->unitType].bulletSize);
	    if (u->body != NULL) {
	        u->body->ApplyLinearImpulse({(float) pushVelocity.x,(float) pushVelocity.y}, u->body->GetWorldCenter());
	    }
	    Bullet *newBullet = new Bullet(u->owner, position.x, position.y, velocity.x, velocity.y, u->material, unitDefs[u->unitType].bulletSize, u->bulletDamage, u->bulletRange);
	    // u->owner->children//bulletsMutex.lock();
	    u->owner->childrenBullets.push_back(newBullet);
	    // u->owner->children//bulletsMutex.unlock();
	// }
}

bool sorter(Player *a, Player *b) {
    return a->score > b->score;
}

void updateLeaderboard() {
    int dataSize = SHORT_SIZE + INT_SIZE + BYTE_SIZE;
    int totalSize = BYTE_SIZE + INT_SIZE + (dataSize + MAX_NAME_LENGTH) * LEADERBOARD_NUM; // code, num,(id, score, name length, name)
    int actualSize = 0;
    byte *data = static_cast<byte *>(malloc(totalSize));

    byte code = SERVER_CODE_LEADERBOARD;

    int num = LEADERBOARD_NUM;
    if (players.size() < num) {
        num = players.size();
    }

    byte *offset = data;
    memcpy(offset, &code, BYTE_SIZE);
    memcpy(offset + BYTE_SIZE, &num, INT_SIZE);

    offset += BYTE_SIZE + INT_SIZE;
    actualSize += BYTE_SIZE + INT_SIZE;
    int i = 0;

    //playersMutex.lock();
    sort(players.begin(), players.end(), sorter);

    for (vector<Player *>::iterator it = players.begin(); i < num; ++it) {
        Player *p = *it;
        byte nameLength = p->name.length();
        memcpy(offset, &p->id, SHORT_SIZE);
        memcpy(offset + SHORT_SIZE, &p->score, INT_SIZE);
        memcpy(offset + SHORT_SIZE + INT_SIZE, &nameLength, BYTE_SIZE);
        const char *cstr = p->name.c_str();
        memcpy(offset + SHORT_SIZE + INT_SIZE + BYTE_SIZE, cstr, nameLength);
        offset += dataSize + nameLength;
        actualSize += dataSize + nameLength;
        i++;
    }

    for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
        Player *p = *it;
        if (p->hasPlayed && !p->disconnected) {
            p->send(data, actualSize); // Send data
        }
    }

    //playersMutex.unlock();

    free(data);
}

void updateStatus() {
	int n = maxPlayers;
	if (mode == MODE_BR) {
		n = BR_MIN_PLAYERS;
	}
	if (draining || (mode == MODE_BR && brState == STATE_PLAYING)) {
		n = -1;
	}
	if (averageTime == 0) {
		averageTime = 1000;
	}

    ofstream out;
	if (mode == MODE_FFA) {
    	out.open("/var/www/html/status.txt", ios::out | ios::trunc);
	} else {
		out.open("/var/www/html/br.txt", ios::out | ios::trunc);
	}
    out << static_cast<int>(players.size()) << "\n" << n << "\n" << VERSION << "\n" << (1000 / averageTime) << "\n" << restarts << "\n" << getTime() << "\n" << totalJoined << endl;
    out.close();
}

void updateRestarts(int change) {
	ifstream in;
    ofstream out;
    string data;
	if (mode == MODE_FFA) {
    	in.open("/var/restarts.txt");
	} else {
		in.open("/var/restartsbr.txt");
	}
    getline(in, data);
	restarts = stoi(data);
	restarts += change;
	if (mode == MODE_FFA) {
    	out.open("/var/restarts.txt", ios::out | ios::trunc);
	} else {
		out.open("/var/restartsbr.txt", ios::out | ios::trunc);
	}
    out << restarts << endl;
    in.close();
    out.close();
}

float amountScale(float amount, byte material) {
    return linearScale(amount, material);
}

float costScale(float amount, byte material) {
    return linearScale(amount, material);//expScale(amount, material);
}

float rewardScale(float amount, byte material) {
    return amount;//linearScale(amount, material);
}

float expScale(float amount, byte material) {
	return amount * pow(2, material);
}

float linearScale(float amount, byte material) {
	return amount * (material + 1);
}

Unit *findUnitById(unsigned short id) {
    Unit *unit = NULL;
    //unitsMutex.lock();
    for (vector<Unit *>::iterator it = units.begin(); it != units.end(); ++it) {
        Unit *u = *it;
        if (u->id == id) {
            unit = u;
        }
    }
    //unitsMutex.unlock();
    return unit;
}

pos randomSpawnPosition() {
    pos position;
    position.x = (float)(rand() /(RAND_MAX / width) - width / 2);
    position.y = (float)(rand() /(RAND_MAX / height) - height / 2);
    return position;
}

float afp(float x1, float y1, float x2, float y2) {
	return atan2(y1 - y2, x1 - x2);
};

pos pfa(float x, float y, float a, float d) {
	return {cos(a) * d + x, sin(a) * d + y};
};

float dfp(float x1, float y1, float x2, float y2) {
	return sqrt((x1 - x2) *(x1 - x2) +(y1 - y2) *(y1 - y2));
};

unsigned long getTime() {
    return system_clock::now().time_since_epoch() / milliseconds(1);
}

float norm(float n) {
    if (n > M_PI) {
        n -= M_PI * 2;
    } else if (n < -M_PI) {
        n += M_PI * 2;
    }
    return n;
}

void wipeInputs(clientKeys *keys, bool *mouse) {
    keys->w = false;
    keys->a = false;
    keys->s = false;
    keys->d = false;
    *mouse = false;
}

void halveStash(int *stash, int socialTotal, string name) {
    for (int i = 0; i < MATERIAL_NUM - 1; i++) {
		// int thisSocialTotal = socialTotal;
		// if (i == 0) thisSocialTotal += 5;
		if (stash[i] <= socialTotal) {
			stash[i] = socialTotal;
		} else {
			stash[i] = ((stash[i] - socialTotal) / 2) + socialTotal;
		}
    }
	if (stash[0] < 5) stash[0] = 5;
	stash[MATERIAL_NUM - 1] = stash[MATERIAL_NUM - 1] / 2;
	// if (floaterRewardMult != 1 && name.find("8J+kliB") != 0) {
	// 	for (int i = 0; i < MATERIAL_NUM; i++) {
	// 		stash[i] = floaterRewardMult;
	//     }
	// }
}

// int createServerSocket(int port) {
//     int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
//
//     struct sockaddr_in serverAddress;
//     memset((char *) &serverAddress, 0, sizeof(serverAddress));
//
//     serverAddress.sin_family = AF_INET;
//     serverAddress.sin_addr.s_addr = INADDR_ANY;
//     serverAddress.sin_port = htons(port);
//
//     int optionValue = 1;
//     setsockopt(
//       serverSocket,
//       SOL_SOCKET,
//       SO_REUSEADDR,
//       &optionValue,
//       sizeof(int)
//     );
//
//     int bindSuccess =
//       bind(
//          serverSocket,
//         (struct sockaddr *) &serverAddress,
//          sizeof(serverAddress)
//       );
//
//     return serverSocket;
// }
//
// int waitForConnection(int serverSocket) {
//     const int serverMaxBacklog = 128;
//     listen(serverSocket, serverMaxBacklog);
//
//     struct sockaddr_in clientAddress;
//     socklen_t clientLen = sizeof(clientAddress);
//     int connectionSocket =
//         accept(
//             serverSocket,
//            (struct sockaddr *) &clientAddress,
//             &clientLen
//         );
//
//     return connectionSocket;
// }

void checkDrain() {
    if (mode == MODE_FFA && draining && players.size() <= 1) {
        cout << "Exiting due to drain (one or less players left)" << endl;
		updateRestarts(-1);
        exit(0);
    }
}

void sendKill(Player *killer, Player *killed) {
    byte nameLength = killed->name.length();
    int totalSize = BYTE_SIZE + BYTE_SIZE + nameLength; // code, name length, name
    byte *data = static_cast<byte *>(malloc(totalSize));
    byte code = SERVER_CODE_KILL;
    memcpy(data, &code, BYTE_SIZE);
    memcpy(data + BYTE_SIZE, &nameLength, BYTE_SIZE);
    const char *cstr = killed->name.c_str();
    memcpy(data + BYTE_SIZE + BYTE_SIZE, cstr, nameLength);
    killer->send(data, totalSize);
    free(data);
}

void updateBr() {
	if (brState == STATE_WAITING) {
		if (totalJoined >= BR_MIN_PLAYERS) {
			brState = STATE_PLAYING;
			for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
				Player *p = *it;
				if (!p->joined) {
					p->kick();
				}
			}
		}
	} else if (brState == STATE_PLAYING) {
		if (totalJoined <= 1) {
			brState = STATE_WAITING;
			for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
				Player *p = *it;
				p->emitBrRank();
				p->kick();
			}
			if (draining) {
				cout << "Exiting due to drain (battle royale)" << endl;
				updateRestarts(-1);
		        exit(0);
			}
		}
	}
	emitBrState();
}

void emitBrState() {
	int totalSize = BYTE_SIZE + INT_SIZE; // code, number
	byte *data = static_cast<byte *>(malloc(totalSize));
	byte code = SERVER_CODE_BR_STATE;
	int number = BR_MIN_PLAYERS - totalJoined;
	if (brState == STATE_PLAYING) {
		number = 0;
	}
	memcpy(data, &code, BYTE_SIZE);
	memcpy(data + BYTE_SIZE, &number, INT_SIZE);

	//playersMutex.lock();
	for (vector<Player *>::iterator it = players.begin(); it != players.end(); ++it) {
		Player *p = *it;
		p->send(data, totalSize); // Send data
	}
	//playersMutex.unlock();

	free(data);
}

// void eraseAddress(const char *address) {
// 	addresses[address]--;
// 	// cout << addresses[address] << endl;
// 	if (addresses[address] <= 0) {
// 		addresses.erase(address);
// 	}
// 	// cout << addresses.size() << endl;
// }
