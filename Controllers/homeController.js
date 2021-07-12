module.exports.getLogin = (req,res)=>{
    res.render('home');
}

module.exports.getHome = (req,res)=>{
    res.render('index', {user: req.user});
}