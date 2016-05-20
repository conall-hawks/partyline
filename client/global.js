rand = function(min = 0, max = 1){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

escapeHtml = function(text){
	return text.replace(/[<>"']/g, function(c){return { 
		'<': '&lt;', 
		'>': '&gt;', 
		'"': '&quot;', 
		"'": '&#039;'
	}[c]});
}

unescapeHtml = function(text){
	text = text.replace(/&lt;/g, '<');
	text = text.replace(/&gt;/g, '>');
	text = text.replace(/&quot;/g, '"');
	text = text.replace(/&#039;/g, "'");
	return text;
}

unescapeSpan = function(text){
	if(typeof unescapeSpan.regex !== 'object') unescapeSpan.regex = /(&lt;span.*&gt;)(.*)(&lt;\/span&gt;)/g;
	var span = unescapeSpan.regex.exec(text);
	if(span !== null && typeof span[1] === 'string'){
		span[1] = unescapeHtml(span[1]);
		span[3] = unescapeHtml(span[3]);
		return span[1] + span[2] + span[3];
	}
	return text;
}

unescapeLink = function(text){
	if(typeof unescapeLink.regex !== 'object') unescapeLink.regex = /(&lt;a.*&gt;)(.*)(&lt;\/a&gt;)/g;
	var link = unescapeLink.regex.exec(text);
	if(link !== null && typeof link[1] === 'string'){
		link[1] = unescapeHtml(link[1]);
		link[3] = unescapeHtml(link[3]);
		return link[1] + link[2] + link[3];
	}
	return text;
}

unescapeVideo = function(text){
	if(typeof unescapeVideo.regex !== 'object') unescapeVideo.regex = /(&lt;video.*&gt;)(.*)(&lt;\/video&gt;)/g;
	var video = unescapeVideo.regex.exec(text);
	if(video !== null && typeof video[1] === 'string'){
		video[1] = unescapeHtml(video[1]);
		video[3] = unescapeHtml(video[3]);
		return video[1] + video[2] + video[3];
	}
	return text;
}

Array.prototype.unique = function(){
	var b = [];
	for(var i = 0, l = this.length; i < l; i++) if(b.indexOf(this[i]) === -1 && this[i] !== '') b.push(this[i]);
	return b;
}

usrMsg = function(user, icon = null, timestamp = null, content, isAdmin = false){
	if(icon === null) icon = getUserIcon(getUserId(user));
	// Must be run twice (need to find out why)
	content = escapeHtml(content);
	for(var i = 0; i < 2; i++){
		content = unescapeSpan(content);
		content = unescapeLink(content);
		content = unescapeVideo(content);
	}
	if(typeof usrMsg.youtubeRegex !== 'object') usrMsg.youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be(?:-nocookie)?\.com)\/(?:.*v(?:\/|=)|(?:.*\/)?)([\w'-]+)/;
	var youtubeLink = usrMsg.youtubeRegex.exec(content);
	if(youtubeLink !== null && typeof youtubeLink[1] === 'string') content = content.replace(usrMsg.youtubeRegex, '<iframe src="https://www.youtube.com/embed/' + youtubeLink[1] + '" allowfullscreen></iframe>');
	if(typeof usrMsg.chat !== 'object' || usrMsg.chat.length < 1) usrMsg.chat = $('.chat .messages p');
	if(typeof usrMsg.chat === 'object') usrMsg.chat.append('<div class="message"><table class="meta"><tr><td rowspan="2"><img class="user-icon" src="' + icon + '" /></td><td class="' + (isAdmin ? 'admin' : 'username') + '">' + user + ': </td></tr><tr><td class="timestamp">[' + clock(timestamp) + ']</td></tr></table>' + content + '</div>');
	usrMsg.chat.each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
}

setLocation = function(){
	navigator.geolocation.getCurrentPosition(function(position){
		$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true', function(data){
			window.geolocation = [], window.geolocation['latitude'] = position.coords.latitude, window.geolocation['longitude'] = position.coords.longitude;
			for(var i = 0; i < data.results[0].address_components.length; i++){
				window.geolocation[data.results[0].address_components[i].types[0]] = data.results[0].address_components[i].long_name;
			}
			if(typeof window.geolocation === 'object'){
				var result = '';
				if(typeof window.geolocation['administrative_area_level_2'] === 'string'){
					result = window.geolocation['administrative_area_level_2'];
				}else if(typeof window.geolocation['locality'] === 'string'){
					result = window.geolocation['locality'];
				}else if(typeof window.geolocation['administrative_area_level_1'] === 'string'){
					result = window.geolocation['administrative_area_level_1'];
				}else if(typeof window.geolocation['country'] === 'string'){
					result = window.geolocation['country'];
				}else{
					result = 'global';
				}
				usrMsg('System', '/image/system.png', null, 'Location resolved to: ' + result, true);
				Session.set('room', result);
			}
		});
	});
}

clock = function(time = null){
	this.time = (time == null ? new Date() : time);
	this.hours = this.time.getHours();
	this.minutes = this.time.getMinutes();
	if(this.hours < 10) this.hours = '0' + this.hours;
	if(this.minutes < 10) this.minutes = '0' + this.minutes;
	return this.hours + ':' + this.minutes;
}

setSelectionRange = function(input, selectionStart = 0, selectionEnd = 0){
	if(typeof input === 'undefined') return false;
	if(input.setSelectionRange){
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}else if (input.createTextRange){
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

helpMessage = function(startup = false){
	var message = 'Commands: /browse, /join <room>, /topic <text>, /color <cssColor>, /whisper <user>, /meme <search>, /help';
	if(startup) message = 'Welcome to Partyline! ' + message;
	usrMsg('System', '/image/system.png', null, message, true);
}

privateMessage = function(recipient){
	if(Messages.find({$or: [{$and: [{sender: getUserId(recipient)}, {recipient: Meteor.userId()}]}, {$and: [{sender: Meteor.userId()}, {recipient: getUserId(recipient)}]}]}).count()) Session.set('private', getUserId(recipient));
	$('#messages').click();
	if(!$('#compose-icon').is(':checked')) $('#compose-icon').click();
	$('.compose-private-message-input')[0].value = recipient.replace(/[: ]+$/, '');
	setSelectionRange($(".compose-private-message-textarea")[0]);
}

$(window).resize(function(){
	$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
});

unloadHandle = function(event){
	Meteor.call('setRoom');
	return null;
}
if('onpagehide' in window) window.addEventListener('pagehide', unloadHandle, false);
if('onunload' in window) window.addEventListener('unload', unloadHandle, false);
if('onbeforeunload' in window) window.addEventListener('beforeunload', unloadHandle, false);

loadHandle = function(event){
	Meteor.call('setRoom', 'global');
	return null;
}
if('onpageshow' in window) window.addEventListener('pageshow', loadHandle, false);
if('onload' in window) window.addEventListener('load', loadHandle, false);

Meteor.startup(() => {
	helpMessage(true);
	Session.set('room', 'global');
	setLocation();
	Meteor.subscribe('users');
	Meteor.subscribe('rooms');
	Meteor.subscribe('messages', Meteor.userId());
	startGuest = setInterval(function(){
		if(typeof Accounts.user() === 'object'){
			clearInterval(startGuest);
			if(Accounts.user().profile.guest) window.guest = Accounts.user()._id;
		}
	}, 500);
	
	Uploader.finished = function(index, fileInfo, templateContext){
		// Package spits out an incorrect url if the file shares a duplicate file name. So we must rebuild this string.
		fileInfo.url = fileInfo.baseUrl + fileInfo.name;
		// 127.0.0.1:3000 = linux server
		fileInfo.url = fileInfo.url.replace('127.0.0.1:3000', 'jonhawks.net');
		if(templateContext.firstNode.parentNode.className.indexOf('messages') > -1){
			// -------------------------------------
			// Chat room file uploading
			setTimeout(function(){$('.progress-bar').css('width', '0%')}, 100);
			if(fileInfo.type.indexOf('image') > -1){
				var message = '<a class="image" href="' + fileInfo.url + '" style="background-image: url(\'' + fileInfo.url + '\');" target="_blank" title="[Type: ' + fileInfo.type + ']"></a>';
			}else if(fileInfo.type.indexOf('video') > -1){
				var message = '<video src="' + fileInfo.url + '" controls title="[Type: ' + fileInfo.type + ']"></video>';
			}else{
				var message = 'Uploaded <a href="' + fileInfo.url + '" target="_blank" title="[Type: ' + fileInfo.type + ']">' + fileInfo.name + '</a>.';
			}
			Meteor.call('chatMessage', Session.get('room'), message);
		}else{
			// -------------------------------------
			// Profile picture uploading
			if(fileInfo.type.indexOf('image') > -1){
				Meteor.call('setIcon', fileInfo.url);
				Session.set('icon', fileInfo.url);
			}
		}
	}
	
	setTimeout(function(){
		if(typeof Session.get('room') !== 'string') Session.set('room', 'global');
	}, 100);
	
	/*Meteor.isCordova(function(){
		$('input[name=header]').click(function(){$('#menu-icon').click()});
	});*/
});

// Remove previously used guest account from chat room.
Accounts.onLogin(function(){ if(typeof window.guest === 'string') Meteor.call('setRoom', null, window.guest) });

Tracker.autorun(function(){
	Meteor.call('setRoom', Session.get('room'));
	Meteor.subscribe('chat', Session.get('room'));
	Meteor.subscribe('room', Session.get('room'));
	usrMsg('System', '/image/system.png', null, 'Room changed to: ' + Session.get('room'), true);
	$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
	$('#chat').click();
	if($('#menu-icon').is(':checked')) $('#menu-icon').click();
	setSelectionRange($(".message-input")[0]);
});

Chat.find().observe({
	added: function(doc){
		usrMsg(doc.user, doc.icon, doc.timestamp, doc.content);
		if(!$('#chat').is(':checked')){
			if(typeof Session.get('chatUnread') !== 'number') Session.set('chatUnread', 0);
			Session.set('chatUnread', Session.get('chatUnread') + 1);
		}
		for(var i = 1; i <= 10; i++){
			setTimeout(function(){
				$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
			}, i * 5);
		}
	}
});

Messages.find().observe({
	added: function(doc){
		if(doc.recipient == Meteor.userId() || doc.sender == Meteor.userId()){
			if(!$('#messages').is(':checked')){
				if(typeof Session.get('privateUnread') !== 'number') Session.set('privateUnread', 0);
				Session.set('privateUnread', Session.get('privateUnread') + 1);
			}
			for(var i = 1; i <= 10; i++){
				setTimeout(function(){
					$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
				}, i * 5);
			}
		}
	}
});

Rooms.find().observe({
	added: function(doc){
		if(doc.name == Session.get('room'))	usrMsg('System', '/image/system.png', null, 'Topic is: ' + doc.topic, true);
	}, 
	changed: function(doc){
		if(doc.name == Session.get('room'))	usrMsg('System', '/image/system.png', null, 'Topic changed to: ' + doc.topic, true);
	}
})

Template.registerHelper('getUserName', function(id){
	return getUserName(id);
});

Template.registerHelper('getUserIcon', function(id){
	return getUserIcon(id);
});

Template.registerHelper('clock', function(timestamp){
	return clock(timestamp);
});

Template.body.onRendered(function(){
	startSwipe = setInterval(function(){
		if(typeof jQuery === 'function' && typeof $().swipe === 'function'){
			$('body').swipe({
				swipeStatus: function(event, phase, direction, distance){
					menu = $('input[name="header"] + label');
					icon = $('#menu-icon + label');
					content = $('.content');
					if(!distance) distance = 0.01;  // .01 because webkit acts funny with 0
					if(phase == 'move'){
						if(direction == 'left'){
							if($('#menu-icon').is(':checked')){
								menu.css('display', 'table-cell');
								menu.css('position', 'relative');
								content.css('position', 'absolute');
								
								menu.css('left', '-' + distance + 'px');
								icon.css('left', 100 - distance + 'px');
								content.css('left', 100 - distance + 'px');
								content.css('width', 'calc(100vw - ' + (100 - distance) + 'px)');
							}else{
								$('.right-icon').each(function(){
									aside = $(this).parent().find('aside');
									if(!$(this).is(':checked')){
										aside.css('display', 'block');
										aside.css('position', 'absolute');
										aside.css('right', distance + 'px');
										$(this).parent().find('label').css('right', distance + 'px');
										$(this).parent().find('.messages').css('width', 'calc(100% - ' + distance + 'px)');
									}
								});
							}
						}else if(direction == 'right'){
							if($('.right-icon').is(':checked')){
								$('.right-icon').each(function(){
									aside = $(this).parent().find('aside');
									if($(this).is(':checked')){
										aside.css('display', 'block !important');
										aside.css('position', 'absolute');
										aside.css('right', '-' + distance + 'px');
										$(this).parent().find('label').css('right', (200 - distance) + 'px');
										$(this).parent().find('.messages').css('width', 'calc(100% - ' + (200 - distance) + 'px)');
									}
								});
							}else if(!$('#menu-icon').is(':checked')){
								menu.css('display', 'table-cell');
								menu.css('position', 'relative');
								content.css('position', 'absolute');
								
								menu.css('left', '-' + (100 - distance) + 'px');
								icon.css('left', distance + 'px');
								content.css('left', distance + 'px');
								content.css('width', 'calc(100vw - ' + distance + 'px)');
							}else{
								
							}
						}
					}
					if(phase == 'end'){
						if(direction == 'left'){
							if($('#menu-icon').is(':checked')){
								$('#menu-icon').click();
							}else{
								$('.right-icon').each(function(){if(!$(this).is(':checked')) $(this).click()});
							}
						}
						if(direction == 'right'){
							if($('.right-icon').is(':checked')){
								$('.right-icon').each(function(){if($(this).is(':checked')) $(this).click()});
							}else if(!$('#menu-icon').is(':checked')){
								$('#menu-icon').click();
							}else{
								
							}
						}
						menu.removeAttr('style');
						icon.removeAttr('style');
						content.removeAttr('style');
						$('.right-icon + label').removeAttr('style');
						$('aside').removeAttr('style');
						$('.messages').removeAttr('style');
						$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
					}
					if(phase == 'cancel'){
						menu.removeAttr('style');
						icon.removeAttr('style');
						content.removeAttr('style');
						$('.right-icon + label').removeAttr('style');
						$('aside').removeAttr('style');
						$('.messages').removeAttr('style');
						$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
					}
				},
				triggerOnTouchEnd: false,
				threshold: 60
			});
			clearInterval(startSwipe);
		}else{
			$.getScript('https://cdnjs.cloudflare.com/ajax/libs/jquery.touchswipe/1.6.15/jquery.touchSwipe.min.js');
		}
	}, 5000);
});

Template.body.helpers({
	chatUnread: function(){
		if(!Session.get('chatUnread')) return;
		return ' (' + Session.get('chatUnread') + ')';
	}, 
	privateUnread: function(){
		if(!Session.get('privateUnread')) return;
		return ' (' + Session.get('privateUnread') + ')';
	}
});

Template.body.events({
	'click #menu-icon + label': function(){
		for(var i = 1; i <= 10; i++){
			setTimeout(function(){
				$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
			}, i * 5);
		}
	},
	'click #chat + label, click #chat': function(){
		Session.set('chatUnread', 0);
	},
	'click .username': function(event){
		if(Messages.find({$or: [{$and: [{sender: getUserId(event.target.textContent)}, {recipient: Meteor.userId()}]}, {$and: [{sender: Meteor.userId()}, {recipient: getUserId(event.target.textContent)}]}]}).count()) Session.set('private', getUserId(event.target.textContent));
		$('#messages').click();
		if(!$('#compose-icon').is(':checked')) $('#compose-icon').click();
		$('.compose-private-message-input')[0].value = event.target.textContent.replace(new RegExp("[: ]+$"), '');
		setSelectionRange($(".compose-private-message-textarea")[0]);
	},
	'click #messages + label, click #messages': function(){
		Session.set('privateUnread', 0);
	}
});