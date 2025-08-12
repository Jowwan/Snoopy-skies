import kaboom from "kaboom";

const FLOOR_HEIGHT = 48;
const JUMP_FORCE = 600;
const SPEED = 480;
const BG_WIDTH = 1358;
const scrollSpeed = 550;

// initialize context
kaboom();

// load assets
loadSprite("snoop1", "/sprites/snoop1.png");
loadSprite("snoop2", "/sprites/snoop2.png");
loadSprite("bg", "/sprites/background.png");
loadSprite("doghouse", "/sprites/doghouse.png");
loadSprite("house", "/sprites/house.png");
loadSprite("ballon", "/sprites/ballon.png");
loadSound("bgm", "/sprites/musicsnoop.mp3");

const frames = ["snoop1", "snoop2"];

setBackground(254, 244, 230, 255);

let tries = 0;

scene("game", () => {
  add([sprite("bg", { width: BG_WIDTH, height: height() }), pos(0, 0), "bg"]);
  add([
    sprite("bg", { width: BG_WIDTH, height: height() }),
    pos(BG_WIDTH, 0),
    "bg",
  ]);
  add([
    sprite("bg", { width: BG_WIDTH, height: height() }),
    pos(BG_WIDTH * 2, 0),
    "bg",
  ]);

  setGravity(1200);

  // add a game object to screen
  const player = add([
    // list of components
    sprite("snoop1"),
    scale(-0.2, 0.2),
    pos(200, 100),
    area(),
    body(),
  ]);

  add([
    rect(width(), FLOOR_HEIGHT),
    pos(0, height()),
    anchor("botleft"),
    area(),
    body({ isStatic: true }),
    color(77, 11, 11),
  ]);

  add([
    rect(width(), FLOOR_HEIGHT),
    pos(0, 0),
    anchor("topleft"),
    area(),
    body({ isStatic: true }),
    color(77, 11, 11),
  ]);

  function jump() {
    player.jump(JUMP_FORCE);
  }

  // jump when user press space
  onKeyPress("space", jump);
  onClick(jump);

  function spawnDoghouse() {
    add([
      sprite("doghouse"),
      area(),
      scale(rand(0.3, 0.4)),
      pos(width(), height() - FLOOR_HEIGHT),
      anchor("botleft"),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      "doghouse",
    ]);
  }

  function spawnHouse() {
    add([
      sprite("house"),
      area(),
      scale(rand(0.9, 1)),
      pos(width(), height() - FLOOR_HEIGHT),
      anchor("botleft"),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      "house",
    ]);
  }

  function spawnBallon() {
    const scaleFactor = rand(0.5, 0.8);
    const estimatedBalloonHeight = 615 * scaleFactor;

    const minY = FLOOR_HEIGHT + estimatedBalloonHeight;
    const maxY = height() - FLOOR_HEIGHT;

    const y = rand(minY, maxY);

    add([
      sprite("ballon"),
      area(),
      scale(scaleFactor),
      pos(width(), y),
      anchor("botleft"),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      "ballon",
    ]);
  }

  function spawnObsticle() {
    const random = rand(0, 5);

    if (random > 3) {
      spawnBallon();
    } else if (random > 1) {
      spawnHouse();
    } else {
      spawnDoghouse();
    }

    wait(rand(1.5, 2), spawnObsticle);
  }

  spawnObsticle();

  // lose if player collides with any game obj with tag "tree"
  player.onCollide("doghouse", () => {
    // go to "lose" scene and pass the score
    go("lose", score);
    addKaboom(player.pos);
  });
  player.onCollide("house", () => {
    // go to "lose" scene and pass the score
    go("lose", score);
    addKaboom(player.pos);
  });
  player.onCollide("ballon", () => {
    // go to "lose" scene and pass the score
    go("lose", score);
    addKaboom(player.pos);
  });

  // keep track of score
  let score = 0;

  const scoreLabel = add([text(score), pos(50, 100), color(0, 0, 0)]);
  let dali = true;
  let koj;

  // increment score every frame
  onUpdate(() => {
    score++;
    scoreLabel.text = score;

    if (score % 20 === 0) {
      if (dali) koj = 0;
      else koj = 1;

      dali = !dali;
      player.use(sprite(frames[koj]));
    }
  });

  onUpdate("bg", (bg) => {
    bg.move(-scrollSpeed, 0);

    // Reset position when it goes off-screen to create a loop
    if (bg.pos.x < -BG_WIDTH) {
      bg.pos.x += BG_WIDTH * 3; // Move it to the right of the other background
    }
  });
});

scene("lose", (score) => {
  add([
    sprite("snoop1"),
    pos(width() / 2, height() / 2 - 64),
    scale(1),
    anchor("center"),
  ]);

  // display score
  add([
    text(score),
    pos(width() / 2, height() / 2 + 250),
    scale(2),
    color(0, 0, 0),
    anchor("center"),
  ]);

  // go back to game with space is pressed
  onKeyPress("space", () => go("start"));
  onClick(() => go("start"));
});

scene("start", () => {
  add([
    sprite("snoop1"),
    pos(width() / 2, height() / 2 - 64),
    scale(1),
    anchor("center"),
  ]);

  const startText = add([
    text("Tap to Start!"),
    pos(width() / 2, height() / 2 + 250),
    scale(2),
    color(0, 0, 0),
    anchor("center"),
    "floatingText",
  ]);

  let floatTime = 1;

  onUpdate("floatingText", (txt) => {
    floatTime += dt();
    txt.pos.y = height() / 2 + 250 + Math.sin(floatTime * 2) * 10;
  });

  onKeyPress("space", () => {
    if (tries === 0) {
      play("bgm", {
        volume: 0.2, // optional: set volume (0.0 to 1.0)
        loop: true, // optional: loop the music
      });
    }

    tries = 1;
    go("game");
  });
  onClick(() => {
    if (tries === 0) {
      play("bgm", {
        volume: 0.2, // optional: set volume (0.0 to 1.0)
        loop: true, // optional: loop the music
      });
    }

    tries = 1;
    go("game");
  });
});

go("start");
