Meteor.methods({
	setRoom: function(room){
		if(typeof room === 'string'){
			Meteor.users.update({_id: Meteor.userId()}, {$set: {room: room}});
			return false;
		}else{
			Meteor.users.update({_id: Meteor.userId()}, {$unset: {room}});
			return true;
		}
	},
	chatMessage: function(room, content){
		if(!room) throw new Meteor.Error('Room cannot be empty.');
		if(!content) throw new Meteor.Error('Message cannot be empty.');
		
		if(!Accounts.users.findOne({_id: Meteor.userId()}).profile.name){
			user = 'Guest-' + Meteor.userId().substr(0, 4);
		}else{
			user = Accounts.users.findOne({_id: Meteor.userId()}).profile.name;
		}
		
		if(!Accounts.users.findOne({_id: Meteor.userId()}).profile.icon){
			icon = 'image/anon.png';
		}else{
			icon = Accounts.users.findOne({_id: Meteor.userId()}).profile.icon;
		}
		
		message = {
			room: room,
			user: user,
			icon: icon,
			timestamp: new Date(),
			content: content
		};
		Chat.insert(message);
	},
	privateMessage: function(recipient, content){
		if(!recipient) throw new Meteor.Error('Recipient cannot be empty.');
		if(!content) throw new Meteor.Error('Message cannot be empty.');
		recipient = getUserId(recipient);
		if(!recipient) throw new Meteor.Error('User does not exist.');
		
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
		Meteor.users.update({_id: Meteor.userId()}, {$set: {profile: {name: name}}});
		return true;
	}
});