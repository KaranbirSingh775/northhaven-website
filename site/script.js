// script.js for northhaven
// all the pages use this one file, so every part checks if its element is on the page first


// ===== temperature slider (home page) =====
var tempSlider = document.getElementById("tempSlider");

if (tempSlider) {
  // each one is [title, advice]
  var levels = [
    ["Cool", "Light layers are enough."],
    ["Cold", "Add a coat and cover your ears."],
    ["Very cold", "Add leggings and gloves. Keep your hands warm."],
    ["Extreme cold", "Switch to the Alpine Puffer and wear every layer."]
  ];

  var tiles = document.querySelectorAll(".tiles li");

  function updateTemperature() {
    var temp = Number(tempSlider.value);
    // console.log(temp);

    // 0 = cool, 1 = cold, 2 = very cold, 3 = extreme
    var level;
    if (temp >= 0) {
      level = 0;
    } else if (temp >= -10) {
      level = 1;
    } else if (temp >= -20) {
      level = 2;
    } else {
      level = 3;
    }

    // negative numbers get a real minus sign
    var shownTemp = temp;
    if (temp < 0) {
      shownTemp = "−" + (-temp);
    }
    document.getElementById("tempValue").textContent = shownTemp + " °C";
    document.getElementById("tempLabel").textContent = levels[level][0];
    document.getElementById("tempNote").textContent = levels[level][1];

    // data-on in the html says which levels each tile is for
    tiles.forEach(function (tile) {
      tile.hidden = !tile.dataset.on.includes(String(level));
    });
  }

  tempSlider.addEventListener("input", updateTemperature);
  updateTemperature(); // so it isnt empty when the page loads
}


// ===== filter buttons (collection page) =====
var filterButtons = document.querySelectorAll("[data-f]");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var filter = button.dataset.f;
    var cards = document.querySelectorAll("#cardGrid .card");
    var shown = 0;

    // only the button i clicked should be pressed
    filterButtons.forEach(function (other) {
      other.setAttribute("aria-pressed", String(other === button));
    });

    cards.forEach(function (card) {
      var matches = filter === "all" || card.dataset.c === filter;
      card.hidden = !matches;
      if (matches) {
        shown++;
      }
    });

    document.getElementById("filterCount").textContent =
      "Showing " + shown + " of " + cards.length + " products";
  });
});


// ===== 3D logo =====
// spins by itself, you can also drag it with the mouse or finger
var logo3d = document.getElementById("logo3d");

if (logo3d) {
  var logoStack = logo3d.firstElementChild;
  var angleY = -30;
  var angleX = -12;
  var dragStart = null;   // stays null if nobody is dragging
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  logo3d.addEventListener("pointerdown", function (e) {
    dragStart = { x: e.clientX, y: e.clientY };
    logo3d.setPointerCapture(e.pointerId);
    logo3d.style.cursor = "grabbing";
  });

  logo3d.addEventListener("pointermove", function (e) {
    if (!dragStart) {
      return;
    }
    angleY += (e.clientX - dragStart.x) * 0.7;
    angleX -= (e.clientY - dragStart.y) * 0.7;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
  });

  function stopDragging() {
    dragStart = null;
    logo3d.style.cursor = "";
  }
  logo3d.addEventListener("pointerup", stopDragging);
  logo3d.addEventListener("pointercancel", stopDragging);

  function spinLogo() {
    // width is 0 if the logo is hidden so dont bother
    if (logo3d.offsetWidth) {
      if (!dragStart) {
        if (!reduceMotion) {
          angleY += 0.5;
        }
        angleX += (-12 - angleX) * 0.02;  // slowly goes back to -12
      }
      logoStack.style.transform = "rotateX(" + angleX + "deg) rotateY(" + angleY + "deg)";
    }
    requestAnimationFrame(spinLogo);
  }
  requestAnimationFrame(spinLogo);
}


// ===== snow =====
// found the idea online then changed it a bit. not used if reduced motion is on
var snowCanvas = document.getElementById("snow");

if (snowCanvas && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var snowCtx = snowCanvas.getContext("2d");
  var flakes = [];

  // 70 flakes, x and y go from 0 to 1 so it works on any screen size
  for (var n = 0; n < 70; n++) {
    flakes.push({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2.2,
      speed: 0.0006 + Math.random() * 0.0012,
      sway: Math.random() * 6
    });
  }

  function drawSnow(time) {
    if (snowCanvas.offsetWidth) {
      // make the canvas the same size as the hero
      if (snowCanvas.width !== snowCanvas.offsetWidth) {
        snowCanvas.width = snowCanvas.offsetWidth;
        snowCanvas.height = snowCanvas.offsetHeight;
      }

      snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
      snowCtx.fillStyle = "#fff";
      snowCtx.shadowColor = "rgba(16,48,79,.55)";
      snowCtx.shadowBlur = 3;

      flakes.forEach(function (flake) {
        flake.y += flake.speed * 16;

        // back to the top when it falls off the bottom
        if (flake.y > 1) {
          flake.y = 0;
          flake.x = Math.random();
        }

        // sin makes it wobble left and right
        var drawX = (flake.x + Math.sin(time / 1500 + flake.sway) * 0.01) * snowCanvas.width;
        var drawY = flake.y * snowCanvas.height;

        snowCtx.beginPath();
        snowCtx.arc(drawX, drawY, flake.size, 0, 6.3);  // 6.3 is about 2 x pi
        snowCtx.fill();
      });
    }
    requestAnimationFrame(drawSnow);
  }
  requestAnimationFrame(drawSnow);
}


// ===== form service =====
// both forms send their answers to a form service (formspree) which emails them to the site owner
// to set it up: make a free form on formspree.io and paste its address below
const FORM_URL = "https://formspree.io/f/mnpjoaqa";

// sends the answers to the form service
// onDone runs if it worked, onFail runs if it did not
function sendForm(answers, onDone, onFail) {
  // stop here if the address has not been added yet
  if (FORM_URL.indexOf("http") !== 0) {
    console.log("add your form address to FORM_URL in script.js");
    onFail();
    return;
  }

  // put each answer into the form data
  let formData = new FormData();
  for (let key in answers) {
    formData.append(key, answers[key]);
  }

  fetch(FORM_URL, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" }
  })
    .then(function (response) {
      if (response.ok) {
        onDone();
      } else {
        onFail();
      }
    })
    .catch(function () {
      // no internet or the service is down
      onFail();
    });
}


// ===== join form =====
// checks the email, then sends it to the form service
let joinForm = document.getElementById("joinForm");

if (joinForm) {
  joinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let emailInput = document.getElementById("emailInput");
    let consentBox = document.getElementById("consentBox");
    let emailError = document.getElementById("emailError");
    let submitButton = joinForm.querySelector("button");
    let errorText = "";

    // checks for something@something.something
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput.value.trim())) {
      errorText = "Enter an email address like name@example.com.";
    } else if (!consentBox.checked) {
      errorText = "Tick the box to confirm you want to receive our emails.";
    }

    emailError.textContent = errorText;

    // if something is wrong, put the cursor on that field
    if (errorText) {
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.focus();
      } else {
        consentBox.focus();
      }
      return;
    }

    // all good, send the email to the form service
    submitButton.disabled = true;
    sendForm(
      { form: "Winter Guide sign-up", email: emailInput.value.trim(), consent: "yes" },
      function () {
        // it worked, hide the form and show the thank you box
        document.getElementById("doneMessage").textContent =
          "Your sign-up was received. This prototype does not send automatic emails, so you can read the Winter Guide now.";
        joinForm.hidden = true;
        document.getElementById("doneBox").hidden = false;
        document.getElementById("doneBox").focus();
      },
      function () {
        // it did not work, let them try again
        emailError.textContent = "Sorry, we could not send your sign-up. Please check your connection and try again.";
        submitButton.disabled = false;
      }
    );
  });
}


// ===== review form (about page) =====
// same as above, the review is sent to the form service
let reviewForm = document.getElementById("reviewForm");

if (reviewForm) {
  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let chosenStar = reviewForm.querySelector("input[name=rate]:checked");
    let reviewText = document.getElementById("reviewText");
    let reviewConsent = document.getElementById("reviewConsent");
    let reviewError = document.getElementById("reviewError");
    let errorText = "";

    if (!chosenStar) {
      errorText = "Choose a star rating.";
    } else if (reviewText.value.trim().length < 10) {
      errorText = "Write at least 10 characters.";
    } else if (!reviewConsent.checked) {
      errorText = "Tick the box to confirm we can show your review.";
    }

    reviewError.textContent = errorText;

    // focus the first thing that is wrong
    if (errorText) {
      if (!chosenStar) {
        reviewForm.querySelector("input[name=rate]").focus();
      } else if (reviewText.value.trim().length < 10) {
        reviewText.focus();
      } else {
        reviewConsent.focus();
      }
      return;
    }

    // all good, send the review to the form service
    let thanksMessage = document.getElementById("reviewOk");
    let sendButton = reviewForm.querySelector("button");
    thanksMessage.hidden = true;
    sendButton.disabled = true;

    sendForm(
      {
        form: "Review or feedback",
        name: document.getElementById("reviewName").value.trim(),
        topic: document.getElementById("reviewProduct").value,
        rating: chosenStar.value,
        review: reviewText.value.trim(),
        can_be_shown: "yes"
      },
      function () {
        // it worked, show the thank you and clear the form
        thanksMessage.textContent = "Thank you. We received your review. Reviews are checked before they are published.";
        thanksMessage.hidden = false;
        reviewForm.reset();
        sendButton.disabled = false;
      },
      function () {
        // it did not work, let them try again
        reviewError.textContent = "Sorry, we could not send your review. Please check your connection and try again.";
        sendButton.disabled = false;
      }
    );
  });
}


// ===== cookie popup =====
// saves the choice in localStorage so it only shows once
const cookieKey = "nh-cookie";
let savedChoice = null;

// try/catch because some browsers block localStorage
try {
  savedChoice = localStorage.getItem(cookieKey);
} catch (err) {
  // do nothing
}

function saveCookieChoice(choice) {
  try {
    localStorage.setItem(cookieKey, choice);
  } catch (err) {
    // do nothing
  }
}

if (!savedChoice) {
  const cookieBox = document.createElement("div");
  cookieBox.className = "cookie";
  cookieBox.setAttribute("role", "region");
  cookieBox.setAttribute("aria-label", "Cookie notice");
  cookieBox.innerHTML =
    '<p>We use analytics cookies to see which pages help. They stay off unless you accept.</p>' +
    '<button class="btn small" type="button">Accept</button>' +
    '<button class="btn small ghost" type="button">Decline</button>';

  const cookieButtons = cookieBox.querySelectorAll("button");

  cookieButtons[0].addEventListener("click", function () {
    saveCookieChoice("yes");
    cookieBox.remove();
  });

  cookieButtons[1].addEventListener("click", function () {
    saveCookieChoice("no");
    cookieBox.remove();
  });

  document.body.appendChild(cookieBox);
}
