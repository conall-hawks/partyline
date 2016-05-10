Template.browse.helpers({
	'room': function(){
		result = Accounts.users.find({}, {
			sort: {room: 1}, fields: {room: true}
		}).fetch().map(function(x){
			if(typeof x.room === 'string' && x.room.length > 0) return x.room;
		}).unique();
		if(typeof result === 'object' && typeof result[0] !== 'string') result.shift();
		return result;
	},
	'isSelected': function(room){
		if(Session.get('room') == room) return 'selected';
	},
	'userCount': function(room){
		result = Accounts.users.find({room: room}).count();
		if(typeof result === 'number' && result > 0) return ' (' + result + ')';
	}
});

Template.browse.events({
	'click .room a': function(event){
		Session.set('room', event.target.textContent);
	}
});