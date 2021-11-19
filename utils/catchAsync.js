//pass in a function return new function and catch the error
module.exports = func =>{
    return (req, res, next) =>{
        func(req, res, next).catch(next);
    }
}