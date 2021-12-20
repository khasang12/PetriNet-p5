var graph_specialist = new joint.dia.Graph();
var pn1 = joint.shapes.pn;
var paper_specialist = new joint.dia.Paper({
  el: document.getElementById("paper1"),
  width: 650,
  height: 350,
  gridSize: 10,
  defaultAnchor: { name: "perpendicular" },
  defaultConnectionPoint: { name: "boundary" },
  model: graph_specialist,
  interactive: false,
  restrictTranslate: true
});

var pFree_specialist = new pn1.Place({
  position: { x: 150, y: 50 },
  attrs: {
    ".label": {
      text: "free",
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
  tokens: 1
});
var pDocu_specialist = pFree_specialist
  .clone()
  .attr(".label/text", "docu")
  .position(450, 50)
  .set("tokens", 0);
var pBusy_specialist = pFree_specialist
  .clone()
  .attr(".label/text", "busy")
  .position(300, 200)
  .set("tokens", 0);

var pStart_specialist = new pn1.Transition({
  position: { x: 150, y: 200 },

  attrs: {
    ".label": {
      text: "start",
      fill: "#fe854f",
      "ref-y": 60
    },
    ".root": {
      fill: "#9586fd",
      stroke: "#9586fd"
    }
  }
});
var pChange_specialist = pStart_specialist
  .clone()
  .attr("id", "change")
  .attr(".label/text", "change")
  .position(475, 200);

var pEnd_specialist = pStart_specialist
  .clone()
  .attr("id", "end")
  .attr(".label/text", "end")
  .position(320, 50);

graph_specialist.addCell([
  pFree_specialist,
  pDocu_specialist,
  pBusy_specialist,
  pStart_specialist,
  pChange_specialist,
  pEnd_specialist
]);
graph_specialist.addCell([
  link_specialist(pFree_specialist, pStart_specialist),
  link_specialist(pStart_specialist, pBusy_specialist),
  link_specialist(pBusy_specialist, pChange_specialist),
  link_specialist(pChange_specialist, pDocu_specialist),
  link_specialist(pDocu_specialist, pEnd_specialist),
  link_specialist(pEnd_specialist, pFree_specialist)
]);

var simulationspecialistId;

const button = document.getElementById("autoFirespecialist");
function checkValid(num) {
  var x = parseInt(num);
  if (isNaN(x) || x < 0) alert("Value should be a number and greater than 0. Please wait a bit before trying again.");
  else return x;
}
function resetSpecialistFunc() {
  clearInterval(simulationspecialistId);
  button.disabled = false;
  pFree_specialist.set("tokens", 0);
  pBusy_specialist.set("tokens", 0);
  pDocu_specialist.set("tokens", 0);
}
function specialistFunc() {
  clearInterval(simulationspecialistId);
  var free = checkValid(document.getElementById("specialist_free").value);
  var busy = checkValid(document.getElementById("specialist_busy").value);
  var docu = checkValid(document.getElementById("specialist_docu").value);
  pFree_specialist.set("tokens", free);
  pBusy_specialist.set("tokens", busy);
  pDocu_specialist.set("tokens", docu);
  button.disabled = false;
}
function autoFirespecialist() {
  button.disabled = true;
  simulationspecialistId = simulate_specialist(
    pStart_specialist,
    pChange_specialist,
    pEnd_specialist
  );
}
// some functions to handle the algorithm, please do not change
function link_specialist(a, b) {
  return new pn1.Link({
    source: { id: a.id, selector: ".root" },
    target: { id: b.id, selector: ".root" },
    attrs: {
      type: "path",
      ".connection": {
        fill: "none",
        "stroke-linejoin": "round",
        "vector-effect": "non-scaling-stroke",
        "stroke-width": "2",
        stroke: "#4b4a67"
      }
    }
  });
}
paper_specialist.on("cell:pointerdblclick", function(cellView) {
  if (
    cellView.model.id == pChange_specialist.id ||
    cellView.model.id == pStart_specialist.id ||
    cellView.model.id == pEnd_specialist.id
  ) {
    alert("It should take a while for the transition to complete firing. Please be patient.");
  }
});
paper_specialist.on("cell:pointerdown", function(cellView, evt, x, y) {
  if (cellView.model.id == pChange_specialist.id)
    fireTransition(pChange_specialist, 1);
  else if (cellView.model.id == pStart_specialist.id)
    fireTransition(pStart_specialist, 1);
  else if (cellView.model.id == pEnd_specialist.id)
    fireTransition(pEnd_specialist, 1);
});
function fireTransition(t, sec) {
  var inbound = graph_specialist.getConnectedLinks(t, { inbound: true });
  var outbound = graph_specialist.getConnectedLinks(t, { outbound: true });

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

        l.findView(paper_specialist).sendToken(token, sec * 500);
      });
    });

    placesAfter.forEach(function(p) {
      var links = outbound.filter(function(l) {
        return l.getTargetElement() === p;
      });

      links.forEach(function(l) {
        var token = V("circle", { r: 5, fill: "#000" });
        l.findView(paper_specialist).sendToken(token, sec * 500, function() {
          p.set("tokens", p.get("tokens") + 1);
        });
      });
    });
  }
}
function simulate_specialist(
  pStart_specialist,
  pChange_specialist,
  pEnd_specialist
) {
  var transitions = [pStart_specialist, pChange_specialist, pEnd_specialist];
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
