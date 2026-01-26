// Y-position of the floor (ground level)
let floorY3;

// Player character (soft, animated blob)
let blob3 = {
  x: 80,
  y: 0,
  r: 26,
  points: 48,
  wobble: 10,
  wobbleFreq: 1.4,
  t: 0,
  tSpeed: 0.02,
  vx: 0,
  vy: 0,
  accel: 0.55,
  maxRun: 4.0,
  gravity: 0.65,
  jumpV: -11.0,
  onGround: false,
  frictionAir: 0.995,
  frictionGround: 0.88
};

let platforms = [];

// Balls on the floor
let balls = [];

function setup() {
  createCanvas(640, 360);
  floorY3 = height - 36;
  noStroke();
  textFont("sans-serif");
  textSize(14);

  platforms = [
    { x: 0, y: floorY3, w: width, h: height - floorY3 }
  ];

  blob3.y = floorY3 - blob3.r - 1;

  // Create balls on the floor
  for (let i = 0; i < 8; i++) {
    balls.push({
      x: random(50, width - 50),
      y: floorY3 - random(10, 20), // slightly above floor
      r: random(10, 18),
      vx: 0,
      color: [random(200,255), random(100,255), random(100,255)]
    });
  }
}

function draw() {
  background(135, 206, 250); // sky blue

  // Draw floor
  fill(255, 215, 0);
  for (const p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }

  // --- Blob movement ---
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob3.vx += blob3.accel * move;

  blob3.vx *= blob3.onGround ? blob3.frictionGround : blob3.frictionAir;
  blob3.vx = constrain(blob3.vx, -blob3.maxRun, blob3.maxRun);

  blob3.vy += blob3.gravity;

  let box = { x: blob3.x - blob3.r, y: blob3.y - blob3.r, w: blob3.r*2, h: blob3.r*2 };

  // Horizontal collisions
  box.x += blob3.vx;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vx > 0) box.x = s.x - box.w;
      else if (blob3.vx < 0) box.x = s.x + s.w;
      blob3.vx = 0;
    }
  }

  // Vertical collisions
  box.y += blob3.vy;
  blob3.onGround = false;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vy > 0) {
        box.y = s.y - box.h;
        blob3.vy = 0;
        blob3.onGround = true;
      } else if (blob3.vy < 0) {
        box.y = s.y + s.h;
        blob3.vy = 0;
      }
    }
  }

  blob3.x = box.x + box.w/2;
  blob3.y = box.y + box.h/2;
  blob3.x = constrain(blob3.x, blob3.r, width - blob3.r);

  blob3.t += blob3.tSpeed;

  drawBlobCircle(blob3);
  drawBlobFace(blob3);
  drawFloorBalls();

  fill(0);
  text("Move: A/D or ←/→  •  Jump: Space/W/↑  • Push balls!", 10, 18);
}

// Axis-Aligned Bounding Box (AABB) overlap test
function overlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Blob drawing
function drawBlobCircle(b){
  fill(255, 250, 100);
  beginShape();
  for (let i=0; i<b.points; i++){
    const a = (i/b.points)*TAU;
    const n = noise(cos(a)*b.wobbleFreq+100, sin(a)*b.wobbleFreq+100, b.t);
    const r = b.r + map(n,0,1,-b.wobble,b.wobble);
    vertex(b.x + cos(a)*r, b.y + sin(a)*r);
  }
  endShape(CLOSE);
}

// Blob face
function drawBlobFace(b){
  push();
  translate(b.x, b.y);
  fill(0);
  ellipse(-8,-5,5,5);
  ellipse(8,-5,5,5);
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(0,4,16,12,0,PI);
  pop();
}

// Draw floor balls and apply collision with blob
function drawFloorBalls() {
  for (const ball of balls){
    // Ball horizontal collision with blob
    let dx = ball.x - blob3.x;
    let dy = ball.y - blob3.y;
    let dist = sqrt(dx*dx + dy*dy);
    let minDist = ball.r + blob3.r;
    if (dist < minDist) {
      let overlap = minDist - dist;
      let angle = atan2(dy, dx);
      // Push ball horizontally away from blob
      ball.x += cos(angle) * overlap;
      ball.y += sin(angle) * overlap;
      // Add velocity based on blob movement
      ball.vx += cos(angle) * blob3.vx * 0.2;
    }

    // Apply friction
    ball.vx *= 0.95;

    // Gravity & floor collision
    ball.y += 0.2; // slight gravity to keep on floor
    if (ball.y + ball.r > floorY3){
      ball.y = floorY3 - ball.r;
    }

    // Move horizontally
    ball.x += ball.vx;

    // Bounce off walls
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -0.5; }
    if (ball.x + ball.r > width) { ball.x = width - ball.r; ball.vx *= -0.5; }

    fill(ball.color);
    noStroke();
    ellipse(ball.x, ball.y, ball.r*2);
  }
}

function keyPressed(){
  if ((key===" " || key==="W" || key==="w" || keyCode===UP_ARROW) && blob3.onGround){
    blob3.vy = blob3.jumpV;
    blob3.onGround = false;
  }
}