Template.chat.onCreated(function(){
	uploadStart = setInterval(function(){
		if(typeof jQuery === 'function'){
			clearInterval(uploadStart);
			$('.jqUploadclass').change(function(){setTimeout(function(){$('.start').click()}, 100)});
		}
	}, 250);
	
	// If we're on iOS, we need to compensate for Safari's "Minimal UI".
	if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
		appleStart = setInterval(function(){
			if(typeof jQuery === 'function'){
				clearInterval(appleStart);
				if(Math.abs(window.orientation) !== 90) $('.content article p').css('height', 'calc(100vh - 146px)');
			}
		}, 250);
		
		window.onorientationchange = function(){
			if(Math.abs(window.orientation) === 90) {
				// Landscape
				$('.content article p').removeAttr('style');
			}else{
				// Portrait
				$('.content article p').css('height', 'calc(100vh - 146px)');
			}
		}
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
		if(typeof window.chatHistory !== 'object') window.chatHistory = [];
		if(typeof window.chatHistoryIndex !== 'number') window.chatHistoryIndex = -1;
		if(event.keyCode == 13){
			if(event.target.value.indexOf('/browse') === 0){
				$('#browse').click();
			}else if(event.target.value.indexOf('/join') === 0){
				Session.set('room', event.target.value.replace('/join', '').trim());
			}else if(event.target.value.indexOf('/topic') === 0){
				Meteor.call('setTopic', Session.get('room'), event.target.value.replace('/topic', '').trim());
			}else if(event.target.value.indexOf('/color') === 0){
				event.target.value = event.target.value.replace('/color ', '').trim();
				if(event.target.value.length < 1) event.target.value = '#BBB';
				Session.set('color', event.target.value);
			}else if(event.target.value.indexOf('/whisper') === 0){
				privateMessage(event.target.value.replace('/whisper ', '').trim());
			}else if(event.target.value.indexOf('/help') === 0){
				helpMessage();
			}else if(event.target.value.indexOf('/meme') === 0){
				var temp = event.target.value;
				if(typeof window.memes === 'object'){
					for(var i = 0, result = []; i < memes.length; i++){
						if(window.memes[i].name.toLowerCase().indexOf(temp.replace('/meme', '').trim()) > -1){
							result.push(window.memes[i]);
						}
					}
					if(result.length > 0){
						result = result[rand(0, result.length - 1)];
						Meteor.call('chatMessage', Session.get('room'), '<a class="image" href="' + result.url + '" style="background-image: url(\'' + result.url + '\');" target="_blank" title="' + result.name + '">' + result.name + '</a>');
					}
				}else{
					$.getJSON('https://api.imgflip.com/get_memes', function(response){
						window.memes = response.data.memes;
						for(var i = 0, result = []; i < response.data.memes.length; i++){
							if(response.data.memes[i].name.toLowerCase().indexOf(temp.replace('/meme', '').trim()) > -1){
								result.push(response.data.memes[i]);
							}
						}
						if(result.length > 0){
							result = result[rand(0, result.length - 1)];
							Meteor.call('chatMessage', Session.get('room'), '<a class="image" href="' + result.url + '" style="background-image: url(\'' + result.url + '\');" target="_blank" title="' + result.name + '">' + result.name + '</a>');
						}
					});
				}
			}else if(event.target.value.length > 0){
				if(typeof Session.get('color') === 'string') event.target.value = '<span style="color: ' + Session.get('color') + ';">' + event.target.value + '</span>';
				Meteor.call('chatMessage', Session.get('room'), event.target.value);
			}
			window.chatHistory.push(event.target.value);
			event.target.value = null;
			window.chatHistoryIndex = window.chatHistory.length;
		}else if(event.keyCode == 38){
			if(window.chatHistoryIndex > 0) window.chatHistoryIndex--;
			if(typeof window.chatHistory[window.chatHistoryIndex] === 'string') event.target.value = window.chatHistory[window.chatHistoryIndex];
		}else if(event.keyCode == 40){
			if(window.chatHistoryIndex < window.chatHistory.length) window.chatHistoryIndex++;
			if(window.chatHistoryIndex == window.chatHistory.length) event.target.value = '';
			if(typeof window.chatHistory[window.chatHistoryIndex] === 'string') event.target.value = window.chatHistory[window.chatHistoryIndex];
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