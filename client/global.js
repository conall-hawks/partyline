window.onbeforeunload = function(){
	Meteor.call('setRoom');
}

/* Unique arrays. */
Array.prototype.unique = function(){
	var u = {}, a = [];
	for(var i = 0, l = this.length; i < l; ++i){
		if(u.hasOwnProperty(this[i])) continue;
		a.push(this[i]);
		u[this[i]] = 1;
	}
	return a;
}

usrMsg = function(user, icon, timestamp = null, content){
	if(typeof usrMsg.chat !== 'object') usrMsg.chat = $('.chat .messages p');
	usrMsg.chat.append('<div class="message"><table class="meta"><tr><td rowspan="2"><img class="user-icon" src="' + icon + '" /></td><td class="username">' + user + ': </td></tr><tr><td class="timestamp">[' + clock(timestamp) + ']</td></tr></table>' + content + '</div>');
}

sysMsg = function(message){
	if(typeof sysMsg.chat !== 'object') sysMsg.chat = $('.chat .messages p');
	sysMsg.chat.append('<div><span class="timestamp">[' + clock() + ']</span> <span class="system">System</span>: <span class="message">' + message + '</span></div>');
}

setLocation = function(){
	navigator.geolocation.getCurrentPosition(function(position){
		$.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=true", function(data){
			window.county = data.results[0].address_components[3].long_name;
			sysMsg('Location resolved to: ' + window.county);
			Session.set('room', window.county);
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

Meteor.startup(() => {
	Session.set('room', 'global');
	Meteor.subscribe('users');
	setLocation();
	Meteor.subscribe('messages', Meteor.userId());

	Meteor.isCordova(function(){
		$('input[name=header]').click(function(){$('#menu-icon').click()});
	});
});

Tracker.autorun(function(){
	Meteor.call('setRoom', Session.get('room'));
	Meteor.subscribe('chat', Session.get('room'));
	Meteor.subscribe('room', Session.get('room'));
	sysMsg('Room changed to: ' + Session.get('room'));
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
	added: function(){
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
});

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
		if(typeof $().swipe === 'function'){
			$('body').swipe({
				swipeStatus:function(event, phase, direction, distance){
					menu = $('input[name="header"] + label');
					icon = $('#menu-icon + label');
					content = $('.content');
					aside = $('.aside');
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
								//fixme
								$('.right-icon').each(function(){
									if(!$(this).is(':checked')){
										aside.css('display', 'block');
										aside.css('position', 'relative');
										content.css('position', 'absolute');
										
										aside.css('right', distance + 'px');
										$(this).find('label').css('right', 100 + distance + 'px');
										content.css('right', 100 + distance + 'px');
										content.css('width', 'calc(100vw - ' + (100 + distance) + 'px)');
									}
								});
							}
						}else if(direction == 'right'){
							if(!$('#menu-icon').is(':checked')){
								menu.css('display', 'table-cell');
								menu.css('position', 'relative');
								content.css('position', 'absolute');
								
								menu.css('left', '-' + (100 - distance) + 'px');
								icon.css('left', distance + 'px');
								content.css('left', distance + 'px');
								content.css('width', 'calc(100vw - ' + distance + 'px)');
							}else{
								$('.right-icon').each(function(){
									if(!$(this).is(':checked')){
										aside.css('display', 'block');
										aside.css('position', 'relative');
										content.css('position', 'absolute');
										
										aside.css('right', (100 - distance) + 'px');
										$(this).find('label').css('right', distance + 'px');
										content.css('right', distance + 'px');
										content.css('width', 'calc(100vw - ' + distance + 'px)');
									}
								});
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
							if(!$('#menu-icon').is(':checked')){
								$('#menu-icon').click();
							}else{
								$('.right-icon').each(function(){if($(this).is(':checked')) $(this).click()});
							}
						}
						menu.removeAttr('style');
						icon.removeAttr('style');
						content.removeAttr('style');
						aside.removeAttr('style');
						$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
					}
					if(phase == 'cancel'){
						menu.removeAttr('style');
						icon.removeAttr('style');
						content.removeAttr('style');
						aside.removeAttr('style');
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

$(window).resize(function(){
	$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
});