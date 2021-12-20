var waitToken;
var insideToken;
var endToken;
var graph = new joint.dia.Graph();
var pn = joint.shapes.pn;
var paper = new joint.dia.Paper({
  el: document.getElementById("paper"),
  width: 800,
  height: 200,
  gridSize: 10,
  defaultAnchor: { name: "perpendicular" },
  defaultConnectionPoint: { name: "boundary" },
  model: graph,
  interactive: false
});
var waitToken = 3;
var insideToken = 0;
var doneToken = 0;
var pWait = new pn.Place({
  position: { x: 140, y: 50 },
  attrs: {
    ".label": {
      text: "wait",
      fill: "#33ccff"
    },
    ".root": {
      stroke: "#33ccff",
      "stroke-width": 3
    },
    ".tokens > circle": {
      fill: "#000"
    }
  },
  tokens: 3
});
var pInside = pWait
  .clone()
  .attr(".label/text", "inside")
  .position(350, 50)
  .set("tokens", 0);
var pDone = pWait
  .clone()
  .attr(".label/text", "done")
  .position(560, 50)
  .set("tokens", 0);
var pStart = new pn.Transition({
  position: { x: 245, y: 50 },

  attrs: {
    ".label": {
      text: "start",
      fill: "#fe854f"
    },
    ".root": {
      fill: "#9586fd",
      stroke: "#9586fd"
    }
  }
});
var pChange = pStart
  .clone()
  .attr("id", "change")
  .attr(".label/text", "change")
  .position(455, 50);
graph.addCell([pWait, pInside, pDone, pStart, pChange]);
graph.addCell([
  link(pWait, pStart),
  link(pStart, pInside),
  link(pInside, pChange),
  link(pChange, pDone)
]);
var simulationPatientId;
const button = document.getElementById("autoFirePatient");
function checkValid(num) {
  var x = parseInt(num);
  if (isNaN(x) || x < 0) alert("Value should be a number and greater than 0. Please wait a bit before trying again.");
  else return x;
}
function patientFunc() {
  clearInterval(simulationPatientId);
  var wait = checkValid(document.getElementById("patient_wait").value);
  var inside = checkValid(document.getElementById("patient_inside").value);
  var done = checkValid(document.getElementById("patient_done").value);
  pWait.set("tokens", wait);
  pInside.set("tokens", inside);
  pDone.set("tokens", done);
  button.disabled = false;
}
function resetPatientFunc() {
  clearInterval(simulationPatientId);
  button.disabled = false;
  pWait.set("tokens", 0);
  pInside.set("tokens", 0);
  pDone.set("tokens", 0);
}
function autoFirePatient() {
  button.disabled = true;
  simulationPatientId = simulate(pStart, pChange);
}
// some functions to handle the algorithm, please do not change
function link(a, b) {
  return new pn.Link({
    source: { id: a.id, selector: ".root" },
    target: { id: b.id, selector: ".root" },
    attrs: {
      type: "path",
      ".connection": {
        fill: "none",
        "stroke-linejoin": "round",
        "vector-effect": "non-scaling-stroke",
        "stroke-width": "2",
        stroke: "#000"
      }
    }
  });
}
paper.on("cell:pointerdblclick", function(cellView) {
  if (cellView.model.id == pChange.id || cellView.model.id == pStart.id) {
    alert("It should take a while for the transition to complete firing. Please be patient.");
  }
});
paper.on("cell:pointerdown", function(cellView, evt, x, y) {
  if (cellView.model.id == pChange.id) {
    fireTransition(pChange, 1);
  } else if (cellView.model.id == pStart.id) {
    fireTransition(pStart, 1);
  }
});

function fireTransition(t, sec) {
  var inbound = graph.getConnectedLinks(t, { inbound: true });
  var outbound = graph.getConnectedLinks(t, { outbound: true });

  var placesBefore = inbound.map(function(link) {
    return link.getSourceElement();
  });
  var placesAfter = outbound.map(function(link) {
    return link.getTargetElement();
  });

  var isFirable = true;
  placesBefore.forEach(function(p) {
    console.log(p.get("tokens"));
    if (p.get("tokens") === 0 || p.get("tokens") < 0) {
      isFirable = false;
    }
  });

  if (isFirable) {
    placesBefore.forEach(function(p) {
      setTimeout(function() {
        p.set("tokens", p.get("tokens") - 1);
      }, 500);

      var links = inbound.filter(function(l) {
        return l.getSourceElement() === p;
      });

      links.forEach(function(l) {
        var token = V("circle", { r: 5, fill: "#000" });

        l.findView(paper).sendToken(token, sec * 500);
      });
    });

    placesAfter.forEach(function(p) {
      var links = outbound.filter(function(l) {
        return l.getTargetElement() === p;
      });

      links.forEach(function(l) {
        var token = V("circle", { r: 5, fill: "#000" });
        l.findView(paper).sendToken(token, sec * 500, function() {
          p.set("tokens", p.get("tokens") + 1);
        });
      });
    });
  }
}
function simulate(pStart, pChange) {
  var transitions = [pStart, pChange];
  /*transitions.forEach(function(t) {    
                fireTransition(t, 1);
        });*/
  return setInterval(function() {
    transitions.forEach(function(t) {
      fireTransition(t, 1);
    });
  }, 1000);
}

function stopSimulation(simulationId) {
  clearInterval(simulationId);
}
