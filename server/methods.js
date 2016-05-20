Meteor.methods({
	setRoom: function(room, user = null){
		if(typeof room === 'string'){
			Meteor.users.update({_id: typeof user === 'string' ? user : Meteor.userId()}, {$set: {room: room}});
			return true;
		}else{
			Meteor.users.update({_id: typeof user === 'string' ? user : Meteor.userId()}, {$unset: {room}});
			return false;
		}
	},
	chatMessage: function(room, content){
		if(!room) throw new Meteor.Error('Room cannot be empty.');
		if(!content) throw new Meteor.Error('Message cannot be empty.');
		
		message = {
			room: room,
			user: getUserName(Meteor.userId()),
			icon: getUserIcon(Meteor.userId()),
			timestamp: new Date(),
			content: content
		};
		Chat.insert(message);
	},
	privateMessage: function(recipient, content){
		recipient = getUserId(recipient);
		if(!recipient) throw new Meteor.Error('Recipient empty or does not exist.');
		if(!content) throw new Meteor.Error('Message cannot be empty.');
		
		message = {
			sender: Meteor.userId(),
			recipient: recipient,
			timestamp: new Date(),
			content: content
		};
		Messages.insert(message);
	},
	setUsername: function(name){
		if(!name) throw new Meteor.Error('Name cannot be empty.');
		if(Accounts.users.find({profile: {name: name}}).count()) throw new Meteor.Error('Name already taken.');
		Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.name': name}});
		return true;
	},
	setIcon: function(icon){
		if(!icon) throw new Meteor.Error('Icon cannot be empty.');
		Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.icon': icon}});
		return true;
	},
	setTopic: function(name, topic){
		if(!name) throw new Meteor.Error('Room cannot be empty.');
		if(!topic) throw new Meteor.Error('Topic cannot be empty.');
		Rooms.upsert({name: name}, {$set: {topic: topic}});
		return true;
	}
});