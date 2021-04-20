const $board: HTMLCanvasElement = document.querySelector("#board");
const ctx = $board.getContext("2d");

$board.width = 400;
$board.height = 400;

ctx.lineWidth = 3;
ctx.lineCap = "round";

let draw = false;
let lastPoint = {x: 0, y: 0};

$board.addEventListener("mousedown", (e) => {
  draw = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  ctx.arc(e.offsetX, e.offsetY, 1.5, 0, 3.15*2);
  ctx.fill();
  lastPoint = {x: e.offsetX, y: e.offsetY};
});

document.body.addEventListener("mouseup", () => {
  draw = false;
});

$board.addEventListener("mousemove", (e) => {
  if (draw) {
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastPoint = {x: e.offsetX, y: e.offsetY};
  }
})

$board.addEventListener("mouseout", (e) => {
  draw = false
})
