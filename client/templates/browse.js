Template.browse.helpers({
	'room': function(){
		return _.uniq(Accounts.users.find({}, {
			sort: {room: 1}, fields: {room: true}
		}).fetch().map(function(x){
			return x.room;
		}), true);
	}
});

Template.browse.events({
	'click .room': function(event){
		Session.set('room', event.target.textContent);
	}
});