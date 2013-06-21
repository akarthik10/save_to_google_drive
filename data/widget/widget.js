this.addEventListener('click', function(event){
		self.port.emit('click');
	event.preventDefault();
}, true);


window.addEventListener('click', function(event) {
  if(event.button == 0 && event.shiftKey == false)
    self.port.emit('left-click');
 
  if(event.button == 2 || (event.button == 0 && event.shiftKey == true))
    self.port.emit('right-click');
    event.preventDefault();
}, true);