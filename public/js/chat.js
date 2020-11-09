const form = document.querySelector("#message-form");
const msg = form.querySelector(".msg");
const sendMsgBtn = document
  .querySelector("#message-form")
  .querySelector("button");
const sendLocationBtn = document.querySelector("#send-location");
const chatMsg = document.querySelector(".chat__messages");
const roomTitle = document.querySelector(".room-title");
const userList = document.querySelector(".users");
let userName = "";

const socket = io();

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const newMsg = chatMsg.lastElementChild;

  const newMsgStyles = getComputedStyle(newMsg);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = newMsg.offsetHeight + newMsgMargin;

  const visibleHeight = chatMsg.offsetHeight;

  const containerHeight = chatMsg.scrollHeight;

  const scrollOffset = chatMsg.scrollTop + visibleHeight;

  if (containerHeight - newMsgHeight <= scrollOffset) {
    chatMsg.scrollTop = chatMsg.scrollHeight;
  }
};

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".chat__sidebar").classList.toggle("visible");
  document.querySelector(".black-box").classList.toggle("black-box--visible");
});
document.querySelector(".black-box").addEventListener("click", () => {
  document.querySelector(".chat__sidebar").classList.toggle("visible");
  document.querySelector(".black-box").classList.toggle("black-box--visible");
});

socket.on("message", (user) => {
  chatMsg.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
    <p>
    <span class="message__name" style=${
      user.username === username
        ? "color:green"
        : user.username === "Admin"
        ? "color:blue"
        : ""
    }>${user.username}</span>
    <span class="message__meta">${moment(user.createdAt).format(
      "h:mm a"
    )}</span>
    </p>
    <p>${user.msg}</p>
    </div>`
  );
  autoscroll();
});

socket.on("locationMsg", (user) => {
  chatMsg.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
    <p>
    <span class="message__name" style=${
      user.username === username
        ? "color:green"
        : user.username === "Admin"
        ? "color:blue"
        : ""
    }>${user.username}</span>
    <span class="message__meta">${moment(user.createdAt).format(
      "h:mm a"
    )}</span>
    </p>
    <p><a href="${user.msg}" target="_blank">current location</a></p>
    </div>`
  );
  autoscroll();
});

socket.on("listUser", ({ room, users }) => {
  roomTitle.textContent = room;
  userList.innerHTML = "";
  users.forEach((user) => {
    userList.insertAdjacentHTML(
      "beforeend",
      `<li style=${
        username === user.username ? "text-transform:uppercase" : ""
      }>${user.username}</li>`
    );
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  sendMsgBtn.setAttribute("disabled", "disabled");

  socket.emit("sendmsg", msg.value, (err) => {
    if (err) {
      return console.log(err);
    }
    msg.value = "";
    sendMsgBtn.removeAttribute("disabled");
  });
});

sendLocationBtn.addEventListener("click", () => {
  const location = navigator.geolocation;
  if (!location) {
    return alert("you browser doesn't support to share locations");
  }

  sendLocationBtn.setAttribute("disabled", "disabled");

  location.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocationBtn.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
