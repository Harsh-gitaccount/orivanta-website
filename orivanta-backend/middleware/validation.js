const validateContactForm = (req, res, next) => {
    const { firstName, lastName, email, subject, message } = req.body;
    const errors = [];

    // Required field validation
    if (!firstName || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email address is required');
    }
    if (!subject) {
        errors.push('Please select a service');
    }
    if (!message || message.trim().length < 20) {
        errors.push('Message must be at least 20 characters');
    }

    // Length limits
    if (firstName && firstName.length > 50) errors.push('First name too long');
    if (lastName && lastName.length > 50) errors.push('Last name too long');
    if (message && message.length > 1000) errors.push('Message too long');

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize inputs
    req.body.firstName = firstName.trim();
    req.body.lastName = lastName.trim();
    req.body.email = email.trim().toLowerCase();
    req.body.message = message.trim();
    if (req.body.phone) req.body.phone = req.body.phone.trim();

    next();
};

module.exports = { validateContactForm };
