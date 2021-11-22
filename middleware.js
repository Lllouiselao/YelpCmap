module.exports.ensureLoggedIn = (req, res, next) =>{
    // store where user requesting to login req.originalUrl stores it
    req.session.returnTo = req.originalUrl;
    
    if(!req.isAuthenticated()){
        req.flash('error', 'You mush sign in first');
        return res.redirect('/login');
    }
    next();
}

