const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');
const { validateContactForm } = require('../middleware/validation');

router.post('/submit', validateContactForm, async (req, res) => {
    try {
        const formData = req.body;
        
        console.log('📧 Processing contact form submission:', {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            subject: formData.subject
        });

        // Send email to owner
        await emailService.sendContactForm(formData);
        
        // Send auto-reply to user
        await emailService.sendAutoReply(formData.email, formData.firstName);

        console.log('✅ Contact form processed successfully');
        
        res.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again or contact us directly.'
        });
    }
});

module.exports = router;

