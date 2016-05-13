Template.chat.onCreated(function(){
	uploadStart = setInterval(function(){
		if(typeof jQuery === 'function'){
			clearInterval(uploadStart);
			$('.jqUploadclass').change(function(){setTimeout(function(){$('.start').click()}, 100)});
		}
	}, 250);
	
	// If we're on iOS, we need to compensate for Safari's "Minimal UI".
	if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
		window.onorientationchange = function(){
			if(Math.abs(window.orientation) === 90) {
				// Landscape
			}else{
				// Portrait
				$('.content article p').css('height', 'calc(100vh - 116px)');
			}
		}
	}else{
		//console.log(navigator.userAgent);
	}
});

Template.chat.helpers({
	room: function(){
		return Session.get('room');
	},
	topic: function(){
		var room = Rooms.findOne({name: Session.get('room')});
		if(typeof room === 'object') return room.topic;
		return 'Llamas!';
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
	color: function(){
		return Session.get('color');
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
			if(event.target.value.indexOf('/browse') === 0){
				$('#browse').click();
			}else if(event.target.value.indexOf('/join') === 0){
				Session.set('room', event.target.value.replace('/join ', ''));
			}else if(event.target.value.indexOf('/topic') === 0){
				Meteor.call('setTopic', Session.get('room'), event.target.value.replace('/topic ', ''));
			}else if(event.target.value.indexOf('/color') === 0){
				event.target.value = event.target.value.replace('/color ', '').replace('/color', '');
				if(event.target.value.length < 1) event.target.value = '#BBB';
				Session.set('color', event.target.value);
			}else if(event.target.value.indexOf('/whisper') === 0){
				privateMessage(event.target.value.replace('/whisper ', ''));
			}else if(event.target.value.indexOf('/help') === 0){
				helpMessage();
			}else if(event.target.value.length > 0){
				if(typeof Session.get('color') === 'string') event.target.value = '<span style="color: ' + Session.get('color') + ';">' + event.target.value + '</span>';
				Meteor.call('chatMessage', Session.get('room'), event.target.value);
			}
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