Meteor.startup(() => {
	AccountsGuest.name = true;
	AccountsGuest.anonymous = true;
	Accounts.removeOldGuests(new Date);
	
	// If you're currently operating on Windows, this is (hopefully) the path to the project root.
	if(typeof process.env.PWD !== 'string') process.env.PWD = process.cwd() + '\\..\\..\\..\\..\\..\\';
	
	UploadServer.init({
		tmpDir: process.env.PWD + '/.uploads/tmp',
		uploadDir: process.env.PWD + '/.uploads/',
		checkCreateDirectories: true,
		maxFileSize: 31457280, // 30 megabytes
		maxPostSize: 31457280
	});
});