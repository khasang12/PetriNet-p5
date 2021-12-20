var graph_Merge = new joint.dia.Graph();
var pn1 = joint.shapes.pn;
var paper_Merge = new joint.dia.Paper({
  el: document.getElementById("paper1"),
  width: 800,
  height: 350,
  gridSize: 10,
  defaultAnchor: { name: "perpendicular" },
  defaultConnectionPoint: { name: "boundary" },
  model: graph_Merge,
  interactive: false,
  restrictTranslate: true
});

var pFree_Merge = new pn1.Place({
  position: { x: 200, y: 50 },
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
var pDocu_Merge = pFree_Merge
  .clone()
  .attr(".label/text", "docu")
  .position(500, 50)
  .set("tokens", 0);
var pBusy_Merge = pFree_Merge
  .clone()
  .attr(".label/text", "busy")
  .position(350, 275)
  .set("tokens", 0);
var pWait_Merge = pFree_Merge
  .clone()
  .attr(".label/text", "wait")
  .position(50, 175)
  .set("tokens", 5);
var pInside_Merge = pFree_Merge
  .clone()
  .attr(".label/text", "inside")
  .position(350, 175)
  .set("tokens", 0);
var pDone_Merge = pFree_Merge
  .clone()
  .attr(".label/text", "done")
  .position(650, 175)
  .set("tokens", 0);

var pStart_Merge = new pn1.Transition({
  position: { x: 200, y: 175 },

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
var pChange_Merge = pStart_Merge
  .clone()
  .attr("id", "change")
  .attr(".label/text", "change")
  .position(525, 175);

var pEnd_Merge = pStart_Merge
  .clone()
  .attr("id", "end")
  .attr(".label/text", "end")
  .position(370, 50);

graph_Merge.addCell([
  pWait_Merge,
  pInside_Merge,
  pDone_Merge,
  pFree_Merge,
  pDocu_Merge,
  pBusy_Merge,
  pStart_Merge,
  pChange_Merge,
  pEnd_Merge
]);
graph_Merge.addCell([
  link_Merge(pFree_Merge, pStart_Merge),
  link_Merge(pWait_Merge, pStart_Merge),
  link_Merge(pStart_Merge, pBusy_Merge),
  link_Merge(pStart_Merge, pInside_Merge),
  link_Merge(pBusy_Merge, pChange_Merge),
  link_Merge(pInside_Merge, pChange_Merge),
  link_Merge(pChange_Merge, pDocu_Merge),
  link_Merge(pChange_Merge, pDone_Merge),
  link_Merge(pDocu_Merge, pEnd_Merge),
  link_Merge(pEnd_Merge, pFree_Merge)
]);

var simulationMergeId;

const button = document.getElementById("autoFireMerge");
function checkValid(num) {
  var x = parseInt(num);
  if (isNaN(x) || x < 0) alert("Value should be a number and greater than 0. Please wait a bit before trying again.");
  else return x;
}
function resetMergeFunc() {
  clearInterval(simulationMergeId);
  button.disabled = false;
  pFree_Merge.set("tokens", 0);
  pBusy_Merge.set("tokens", 0);
  pDocu_Merge.set("tokens", 0);
  pWait_Merge.set("tokens", 0);
  pInside_Merge.set("tokens", 0);
  pDone_Merge.set("tokens", 0);
}
function MergeFunc() {
  clearInterval(simulationMergeId);
  var free = checkValid(document.getElementById("Merge_free").value);
  var busy = checkValid(document.getElementById("Merge_busy").value);
  var docu = checkValid(document.getElementById("Merge_docu").value);
  var wait = checkValid(document.getElementById("Merge_wait").value);
  var inside = checkValid(document.getElementById("Merge_inside").value);
  var done = checkValid(document.getElementById("Merge_done").value);
  pFree_Merge.set("tokens", free);
  pBusy_Merge.set("tokens", busy);
  pDocu_Merge.set("tokens", docu);
  pWait_Merge.set("tokens", wait);
  pInside_Merge.set("tokens", inside);
  pDone_Merge.set("tokens", done);
  button.disabled = false;
}
function autoFireMerge() {
  button.disabled = true;
  simulationMergeId = simulate_Merge(pStart_Merge, pChange_Merge, pEnd_Merge);
}
// some functions to handle the algorithm, please do not change
function link_Merge(a, b) {
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
paper_Merge.on("cell:pointerdblclick", function(cellView) {
  if (
    cellView.model.id == pChange_Merge.id ||
    cellView.model.id == pStart_Merge.id ||
    cellView.model.id == pEnd_Merge.id
  ) {
    alert("It should take a while for the transition to complete firing. Please be patient.");
  }
});
paper_Merge.on("cell:pointerdown", function(cellView, evt, x, y) {
  if (cellView.model.id == pChange_Merge.id) fireTransition(pChange_Merge, 1);
  else if (cellView.model.id == pStart_Merge.id)
    fireTransition(pStart_Merge, 1);
  else if (cellView.model.id == pEnd_Merge.id) fireTransition(pEnd_Merge, 1);
});
function fireTransition(t, sec) {
  var inbound = graph_Merge.getConnectedLinks(t, { inbound: true });
  var outbound = graph_Merge.getConnectedLinks(t, { outbound: true });

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

        l.findView(paper_Merge).sendToken(token, sec * 500);
      });
    });

    placesAfter.forEach(function(p) {
      var links = outbound.filter(function(l) {
        return l.getTargetElement() === p;
      });

      links.forEach(function(l) {
        var token = V("circle", { r: 5, fill: "#000" });
        l.findView(paper_Merge).sendToken(token, sec * 500, function() {
          p.set("tokens", p.get("tokens") + 1);
        });
      });
    });
  }
}
function simulate_Merge(pStart_Merge, pChange_Merge, pEnd_Merge) {
  var transitions = [pStart_Merge, pChange_Merge, pEnd_Merge];
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
