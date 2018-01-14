function startWebSocket(token) {
  var url = "ws://" + location.host;
  var ws = new WebSocket(url);

  ws.addEventListener("open", function(event) {
    console.log("connection opened!!!");
    ws.send(JSON.stringify({ kind: "sub", payload: token }));
  });

  ws.addEventListener("message", function(event) {
    var msg = JSON.parse(event.data);
    if (msg.kind == "result") {
      recordResult(msg.payload);
    }
  });

  return ws;
}

function tripNodeToEl(node, prevLoc) {
  var el = document.createElement("span");
  var link = document.createElement("a");
  link.setAttribute("href", node.deepLink);
  link.setAttribute("target", "_blank");
  link.innerText = prevLoc + " to " + node.loc;
  el.appendChild(link);

  el.style.margin = "10px";
  el.style.backgroundColor = "lightblue";

  return el;

}

function chainToEl(result) {
  var chain = result.chain;

  var prevLoc = getOriginCode();
  var i;

  var codes = [];

  var el = document.createElement("div");

  for (i = 1; i < chain.length; i++) {
    codes.push(chain[i].loc);
    el.appendChild(tripNodeToEl(chain[i], prevLoc));
    prevLoc = chain[i].loc;
  }

  var price = document.createElement("span");
  price.innerText = "$" + result.price;
  el.appendChild(price);

  el.addEventListener("mouseover", function() {
    drawRoute(codes);
  });

  el.addEventListener("mouseout", function() {
    flightPath.setMap(null);
  });

  return el;
}

var cheapest = [];
function recordResult(result) {
  var i, replaced = false;
  for (i = 0; i < cheapest.length; i++) {
    if (cheapest[i].price > result.price && result.chain.length >= cheapest[i].chain.length) {
      cheapest[i] = result;
      replaced = true;
      break;
    }
  }

  if (!replaced && cheapest.length < 5) {
    cheapest.push(result);
  }

  var resultView = document.getElementById("results");
  resultView.innerHTML = "";

  for (i = 0; i < cheapest.length; i++) {
    resultView.appendChild(chainToEl(cheapest[i]));
  }

}
