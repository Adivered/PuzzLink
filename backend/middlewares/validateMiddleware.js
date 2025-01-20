const validateBody = (...validators) => {
    return (req, res, next) => {
      const errors = [];
      validators.forEach((validator) => {
        const { error } = validator(req.body);
        if (error) {
          return errors.push(
            ...(error?.details || []).map((errorDetail) => errorDetail?.message)
          );
        }
      });
  
      if (errors.length > 0) {
        res.status(400);
        return next(new Error(JSON.stringify(errors)));
      }
      return next();
    };
  };
  
  module.exports = validateBody;