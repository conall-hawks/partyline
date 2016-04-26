Template.chat.onCreated(function(){
	
});

Template.chat.helpers({
	room: function(){
		return Accounts.users.findOne({_id: Meteor.userId()}).room;
	},
	topic: function(){
		return "Llamas!";
		//return Room.topic;
	},
	messages: function(){
		return Chat.find({room: Session.get('room')});
	},
	timestampFormatted: function(timestamp){
		return clock(timestamp);
	},
	numUsers: function(){
		return Accounts.users.find({room: Session.get('room')}).count();
	},
	users: function(){
		return Accounts.users.find({room: Session.get('room')});
	},
	username: function(id){
		if(!Accounts.users.findOne({_id: id}).profile.name) return 'Guest-' + id.substr(0, 4);
		return Accounts.users.findOne({_id: id}).profile.name;
	}
});

Template.chat.events({
	'keypress .message-input': function(event){
		if(event.keyCode == 13){
			Meteor.call('chatMessage', Session.get('room'), event.target.value);
			event.target.value = null;
		}
	},
	'click .message-submit': function(event){
		Meteor.call('chatMessage', Session.get('room'), $('.message-input')[0].value);
		$('.message-input')[0].value = null;
		setSelectionRange($(".message-input")[0]);
	},
	'click #usernav-icon + label': function(){
		for(var i = 1; i <= 10; i++){
			setTimeout(function(){
				$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
			}, i * 5);
		}
	}
});