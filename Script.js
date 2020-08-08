var colors = ["blue", "green", "yellow", "white", "orange", "red"],
	pieces = document.getElementsByClassName("piece");
function mx(i, j) {
	return (
		([2, 4, 3, 5][j % 4 | 0] +
			(i % 2) * (((j | 0) % 4) * 2 + 3) +
			2 * ((i / 2) | 0)) %
		6
	);
}
let offset = 0,
	paused = true;

render();

function startStopwatch(evt) {
	if (paused) {
		paused = false;
		offset -= Date.now();
		render();
	}
}

function stopStopwatch(evt) {
	if (!paused) {
		paused = true;
		offset += Date.now();
	}
}

function resetStopwatch(evt) {
	if (paused) {
		offset = 0;
		render();
	} else {
		offset = -Date.now();
	}
}

function format(value, scale, modulo, padding) {
	value = Math.floor(value / scale) % modulo;
	return value.toString().padStart(padding, 0);
}

function render() {
	var value = paused ? offset : Date.now() + offset;

	document.querySelector('#s_ms').textContent = format(value, 1, 1000, 3);
	document.querySelector('#s_seconds').textContent = format(value, 1000, 60, 2);
	document.querySelector('#s_minutes').textContent = format(value, 60000, 60, 2);

	if (!paused) {
		requestAnimationFrame(render);
	}
}
function getAxis(face) {
	return String.fromCharCode("X".charCodeAt(0) + face / 2); // X, Y or Z
}

function assembleCube() {
	function moveto(face) {
		id = id + (1 << face);
		pieces[i].children[face]
			.appendChild(document.createElement("div"))
			.setAttribute("class", "sticker " + colors[face]);
		return "translate" + getAxis(face) + "(" + ((face % 2) * 4 - 2) + "em)";
	}
	for (var id, x, i = 0; (id = 0), i < 26; i++) {
		x = mx(i, i % 18);
		pieces[i].style.transform =
			"rotateX(0deg)" +
			moveto(i % 6) +
			(i > 5 ? moveto(x) + (i > 17 ? moveto(mx(x, x + 2)) : "") : "");
		pieces[i].setAttribute("id", "piece" + id);
	}
}

function getPieceBy(face, index, corner) {
	return document.getElementById(
		"piece" +
		((1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner)
	);
}


function swapPieces(face, times) {
	for (var i = 0; i < 6 * times; i++) {
		var piece1 = getPieceBy(face, i / 2, i % 2),
			piece2 = getPieceBy(face, i / 2 + 1, i % 2);
		for (var j = 0; j < 5; j++) {
			var sticker1 = piece1.children[j < 4 ? mx(face, j) : face].firstChild,
				sticker2 = piece2.children[j < 4 ? mx(face, j + 1) : face].firstChild,
				className = sticker1 ? sticker1.className : "";
			if (className)
				(sticker1.className = sticker2.className), (sticker2.className = className);
		}
	}
}

function animateRotation(face, cw, currentTime) {
	console.log(face + " " + cw + " " + currentTime);
	var k = 0.3 * ((face % 2) * 2 - 1) * (2 * cw - 1),
		qubes = Array(9)
			.fill(pieces[face])
			.map(function (value, index) {
				return index ? getPieceBy(face, index / 2, index % 2) : value;
			});
	(function rotatePieces() {
		var passed = Date.now() - currentTime,
			style =
				"rotate" + getAxis(face) + "(" + k * passed * (passed < 300) + "deg)";
		qubes.forEach(function (piece) {
			piece.style.transform = piece.style.transform.replace(
				/rotate.\(\S+\)/,
				style
			);
		});
		if (passed >= 300) return swapPieces(face, 3 - 2 * cw);
		requestAnimationFrame(rotatePieces);
	})();
}

function setup() {
	angleMode(DEGREE)
}
function frontClock() {
	animateRotation(1, true, Date.now());
}
function frontCounter() {
	animateRotation(1, false, Date.now());
}
function backClock() {
	animateRotation(0, false, Date.now());
}
function backCounter() {
	animateRotation(0, true, Date.now());
}
function bottomLeft() {
	animateRotation(3, false, Date.now());
}
function bottomRight() {
	animateRotation(3, true, Date.now());
}
function leftDown() {
	animateRotation(5, true, Date.now());
}
function leftUp() {
	animateRotation(5, false, Date.now());
}
function rightDown() {
	animateRotation(4, false, Date.now());
}
function rightUp() {
	animateRotation(4, true, Date.now());
}
function topRight() {
	animateRotation(2, false, Date.now());
}
function topLeft() {
	animateRotation(2, true, Date.now());
}
function middleUp() {
	animateRotation(4, false, Date.now());
	animateRotation(5, true, Date.now());

}
function middleDown() {
	animateRotation(4, true, Date.now());
	animateRotation(5, false, Date.now());

}


function scramble() {
	for (var x = 0; x < 30; x++) {
		var array = ([frontClock, frontCounter, backClock, backCounter, rightUp, rightDown, leftUp, leftDown, topRight, topLeft, bottomRight, bottomLeft]);
		(array[Math.floor(Math.random() * array.length)])();
	}
}
function mousedown(md_e) {
	var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number),
		element = md_e.target.closest(".element"),
		face = [].indexOf.call((element || cube).parentNode.children, element);
	function mousemove(mm_e) {
		if (element) {
			var gid = /\d/.exec(document.elementFromPoint(mm_e.pageX, mm_e.pageY).id);
			if (gid && gid.input.includes("anchor")) {
				mouseup();
				var e = element.parentNode.children[
					mx(face, Number(gid) + 3)
				].hasChildNodes();
				animateRotation(mx(face, Number(gid) + 1 + 2 * e), e, Date.now());

			}
		} else
			pivot.style.transform =
				"rotateX(" +
				(startXY[0] - (mm_e.pageY - md_e.pageY) / 2) +
				"deg)" +
				"rotateY(" +
				(startXY[1] + (mm_e.pageX - md_e.pageX) / 2) +
				"deg)";
	}
	function mouseup() {
		document.body.appendChild(guide);
		scene.removeEventListener("mousemove", mousemove);
		document.removeEventListener("mouseup", mouseup);
		scene.addEventListener("mousedown", mousedown);
	}

	(element || document.body).appendChild(guide);
	scene.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	scene.removeEventListener("mousedown", mousedown);
}
function submit() {
	var str = document.getElementById("instruct").value;
	var arr = str.split(/[ ,]+/).filter(Boolean);

	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == "F")
			frontClock();
		if (arr[i] == "F'")
			frontCounter();
		if (arr[i] == "R")
			rightUp();
		if (arr[i] == "R'")
			rightDown();
		if (arr[i] == "L")
			leftUp();
		if (arr[i] == "L'")
			leftDown();
		if (arr[i] == "U")
			topLeft();
		if (arr[i] == "U'")
			topRight();
		if (arr[i] == "B")
			backClock();
		if (arr[i] == "B'")
			backCounter();
		if (arr[i] == "D")
			bottomRight();
		if (arr[i] == "D'")
			bottomLeft();
		if (arr[i] == "M'")
			middleUp()
		if (arr[i] == "M")
			middleDown()
	}

}

document.ondragstart = function () {
	return false;
};



window.addEventListener("load", assembleCube);
scene.addEventListener("mousedown", mousedown);
swapPieces(0, 2);
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

