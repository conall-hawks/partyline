Meteor.startup(() => {
	AccountsGuest.name = true;
	AccountsGuest.anonymous = true;
	Accounts.removeOldGuests(new Date);
	
	if(typeof process.env.PWD !== 'string') process.env.PWD = 'E:/arkivez/warez/GitPortable/a100-dev/partyline/';
	UploadServer.init({
		tmpDir: process.env.PWD + '/.uploads/tmp',
		uploadDir: process.env.PWD + '/.uploads/',
		checkCreateDirectories: true,
		maxFileSize: 31457280, // 30 megabytes
		maxPostSize: 31457280
	});
});