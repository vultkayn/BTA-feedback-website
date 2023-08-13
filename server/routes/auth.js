var router = require('express').Router();

const { connexion, signup } = require('../passport/authenticate');


router.post('/', signup, (err, req, res, next) => {
    if (err && err.status == 400)
        if (err.errors !== undefined)
            res.status(err.status).json({errors: err.errors});
    else next(err.errors || err);
});

router.post('/login', connexion, (err, req, res, next) => {
    if (err && (err.status == 401 || err.status == 400))
        if (err.errors !== undefined)
            res.status(err.status).json({errors: err.errors});
    
    else next(err.errors || err);
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.status(200).send();
  });
})

module.exports = router;