window.onload = () => {
  const canvas = document.querySelector("#cnvs");

  var socket = io();

  const board_id = "667429cabbc73510d7ebdf63";

  /** TODO: HELLO */
  let writeData = [];

  let prevX = 0;
  let prevY = 0;
  let currX = 0;
  let currY = 0;
  let isWriting = false;

  socket.on("connect-success", () => {
    console.log("connected successfully");
    socket.emit("join-board", { board_id });
  });

  socket.on("new-user-joined", () => {
    console.log("new-user-joinedd");
  });
  socket.on("join-board-success", ({ data }) => {
    writeData = data;
    redraw();
  });

  socket.on("write-update", (stroke) => {
    console.log("writing update...");

    writeData.push(stroke);
    redraw();
  });

  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d");
  ctx.canvas.height = 600;
  ctx.canvas.width = 600;

  function draw(pX, pY, cX, cY) {
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(cX, cY);
    ctx.stroke();
    ctx.beginPath();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let pos of writeData) {
      draw(pos.pX, pos.pY, pos.cX, pos.cY);
    }
  }

  function handleMousePosAndWrite(e) {
    prevX = currX;
    prevY = currY;

    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    if (isWriting) {
      let stroke = { pX: prevX, pY: prevY, cX: currX, cY: currY };
      writeData.push(stroke);
      draw(prevX, prevY, currX, currY);
      socket.emit("write", { stroke, board_id });
    }
  }

  document.addEventListener("mousemove", handleMousePosAndWrite);
  document.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      isWriting = true;
    }
  });
  document.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      isWriting = false;
    }
  });
};

window.BeforeUnloadEvent = (e) => {
  console.log("restarting");
};
