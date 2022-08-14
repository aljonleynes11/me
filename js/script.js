
$('.carousel').carousel({
	interval: 8000
})
var app = document.getElementById('app');
var typewriter = new Typewriter(app, {
	loop: true,
	delay: 75,
});
typewriter
	.pauseFor(2500)
	.typeString('App Developer')
	.pauseFor(300)
	.deleteChars(25)
	.typeString('App Developer')
	.pauseFor(800)
	.deleteChars(25)
	.pauseFor(1000)
	.start();

var businesscard = document.getElementById('businesscard');
var typewriter1 = new Typewriter(businesscard, {
	loop: true,
	delay: 75,
});
typewriter1
	.pauseFor(5000)
	.typeString('IT Support')
	.pauseFor(300)
	.deleteChars(25)
	.pauseFor(1000)
	.start();

var typewriter = new Typewriter(app1, {
	loop: true,
	delay: 75,
});
typewriter
	.pauseFor(2500)
	.typeString('App Developer')
	.pauseFor(300)
	.deleteChars(25)
	
	.pauseFor(800)
	.deleteChars(25)
	.pauseFor(1000)
	.start();



document.addEventListener('contextmenu', event => event.preventDefault());
$(window).on('load', function () {
	$('#exampleModal').modal('show');
});

window.onscroll = function () { myFunction() };
function myFunction() {
	var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
	var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	var scrolled = (winScroll / height) * 100;
	document.getElementById("myBar").style.width = scrolled + "%";
}
