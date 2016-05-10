Meteor.publish('chat', function(room){
	if(typeof room !== 'string') return;
	return Chat.find({room: room}, {sort: {timestamp: -1}, limit: 3});
});

Meteor.publish('users', function(){
	// todo: remove me?
	return Accounts.users.find();
});

Meteor.publish('room', function(room){
	return Accounts.users.find({room: room});
});

Meteor.publish('rooms', function(room){
	return Rooms.find();
});

Meteor.publish('messages', function(id){
	// todo: restrict me
	return Messages.find();
	//return Messages.find({$or: [{sender: id}, {recipient: id}]});
});