

Template.messages.events({
	'keyup .reply-private-message-input': function(event){
		if(event.keyCode == 13){
			Meteor.call('privateMessage', getUserName(Session.get('private')), event.target.value);
			event.target.value = null;
		}
	},
	'click .reply-private-message-submit': function(event){
		Meteor.call('privateMessage', getUserName(Session.get('private')), $('.reply-private-message-input')[0].value);
		$('.reply-private-message-input')[0].value = null;
		setSelectionRange($(".reply-private-message-input")[0]);
	},
	'click #compose-icon + label': function(){
		for(var i = 1; i <= 10; i++){
			setTimeout(function(){
				$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
			}, i * 5);
		}
	},
	'keypress .compose-private-message-textarea': function(event){
		if(event.keyCode == 13){
			Meteor.call('privateMessage', $('.compose-private-message-input')[0].value, event.target.value);
			$('.compose-private-message-input')[0].value = null;
			setTimeout(function(){event.target.value = null}, 1);
		}
	},
	'click .compose-private-message-submit': function(event){
		Meteor.call('privateMessage', $('.compose-private-message-input')[0].value, $('.compose-private-message-textarea')[0].value);
		$('.compose-private-message-input')[0].value = null;
		$('.compose-private-message-textarea')[0].value = null;
	},
	'click .conversations li': function(event){
		Session.set('private', getUserId(event.target.textContent));
		for(var i = 1; i <= 10; i++){
			setTimeout(function(){
				$('.messages p').each(function(){$(this).scrollTop($(this).prop('scrollHeight'))});
			}, i * 5);
		}
		//$('#compose-icon').click();
	}
});

Template.messages.helpers({
	'messages': function(){
		return Messages.find({$or: [{$and: [{sender: Session.get('private')}, {recipient: Meteor.userId()}]}, {$and: [{sender: Meteor.userId()}, {recipient: Session.get('private')}]}]}).count();
	},
	'private': function(){
		return typeof Session.get('private') === 'string' ? Session.get('private') : false;
	},
	'conversation': function(){
		return _.uniq(Messages.find({$or: [{sender: Meteor.userId()}, {recipient: Meteor.userId()}]}, {
			sort: {sender: 1}, fields: {sender: true, recipient: true}
		}).fetch().map(function(x){
			if(typeof Session.get('private') !== 'string') Session.set('private', x.sender);
			if(x.sender == Meteor.userId()) return x.recipient;
			return x.sender;
		}), true).unique();
	},
	'message': function(){
		return Messages.find({$or: [{$and: [{sender: Session.get('private')}, {recipient: Meteor.userId()}]}, {$and: [{sender: Meteor.userId()}, {recipient: Session.get('private')}]}]}, {sort: {timestamp: 1}});
		
	}, 
	'selected': function(id){
		if(id == Session.get('private')) return "selected";
	}
});