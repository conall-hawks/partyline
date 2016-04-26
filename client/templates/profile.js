Template.profile.events({
	'keyup .username-input': function(event){
		if(event.keyCode == 13){
			Meteor.call('setUsername', event.target.value);
			event.target.value = null;
		}
	},
	'click .username-submit': function(event){
		Meteor.call('setUsername', $('.username-input')[0].value);
		$('.username-input')[0].value = null;
	}
});