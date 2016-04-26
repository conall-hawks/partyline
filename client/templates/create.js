Template.create.events({
	'keyup .new-roomname-input': function(event){
		if(event.keyCode == 13){
			Session.set('room', event.target.value);
			event.target.value = null;
		}
	},
	'click .new-roomname-submit': function(event){
		Session.set('room', $('.new-roomname-input')[0].value);
		$('.new-roomname-input').val(null);
	}
});