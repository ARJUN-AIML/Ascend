const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res, next) => {
  try {
    const { context, scoreAccurate, feedbackUseful, wouldUseAgain, wouldPay, additionalComments } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      context,
      scoreAccurate,
      feedbackUseful,
      wouldUseAgain,
      wouldPay,
      additionalComments
    });

    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback };
