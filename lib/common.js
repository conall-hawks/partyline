getUserId = function(name){
	if(typeof name !== 'string' || !name) return false;
	account = Accounts.users.findOne({'profile.name': name});
	if(name.search('Guest-') > -1) account = Accounts.users.findOne({_id: {$regex: new RegExp(name.replace('Guest-', '')), $options: 'i'}});
	if(typeof account !== 'object' || typeof account._id !== 'string' || !account._id){
		return false;
	}else{
		return account._id;
	}
}

getUserName = function(id){
	if(typeof id !== 'string' || !id) return false
	var account = Accounts.users.findOne({_id: id});
	if(typeof account !== 'object'){
		return false;
	}else{
		if(typeof account.profile.name !== 'string' || !account.profile.name){
			return 'Guest-' + id.substr(0, 4);
		}else{
			return account.profile.name;
		}
	}
}

getUserIcon = function(id){
	if(typeof id !== 'string' || !id) return false;
	var account = Accounts.users.findOne({_id: id});
	if(typeof account !== 'object' || typeof account.profile.icon !== 'string' || !account.profile.icon){
		return 'image/anon.png';
	}else{
		return account.profile.icon;
	}
}