Template.browse.helpers({
	'room': function(){
		result = Accounts.users.find({}, {
			sort: {room: 1}, fields: {room: true}
		}).fetch().map(function(x){
			if(typeof x.room === 'string' && x.room.length > 0) return x.room;
		}).unique();
		if(typeof result === 'object' && typeof result[0] !== 'string') result.shift();
		return result;
	}
});

Template.browse.events({
	'click .room': function(event){
		Session.set('room', event.target.textContent);
	}
});