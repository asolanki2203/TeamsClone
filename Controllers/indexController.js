module.exports.getCalls = (req,res)=>{
    res.render('calls', {user: req.user});
};

module.exports.logoutApp = (req,res)=>{
    req.logout();
    res.redirect('/');
};

module.exports.getMeet = (req,res)=>{
    res.render('meet', {user: req.user});
};

module.exports.getHelp = (req,res)=>{
    res.redirect('https://docs.google.com/document/d/10yp5iYYrzNDQmN78vg5IXVAh_ElKw9raynkQCmDx36E/edit?usp=sharing');
};

module.exports.getChatRoom = (req,res)=>{
    res.render('chatroom', {user: req.user});
};