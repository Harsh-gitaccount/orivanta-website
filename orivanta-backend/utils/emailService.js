const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false, // UPDATED: false for port 587 (STARTTLS)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });
    }

    async testConnection() {
        try {
            console.log('🔍 Testing Brevo SMTP connection with:');
            console.log('Host:', process.env.EMAIL_HOST);
            console.log('Port:', process.env.EMAIL_PORT);
            console.log('User:', process.env.EMAIL_USER);
            console.log('Pass length:', process.env.EMAIL_PASS?.length);
            
            await this.transporter.verify();
            console.log('✅ Brevo SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('❌ Brevo SMTP connection failed:', error);
            console.log('🔧 Check your Brevo SMTP credentials in .env file');
            throw error;
        }
    }

// Add this helper function at the top of your emailService.js class
getSubjectDisplay(subjectValue) {
    const subjectMap = {
        'whatsapp': 'WhatsApp & Chatbot Automation',
        'voice': 'Voice AI',
        'leadgen': 'Lead Generation Platforms', 
        'omnichannel': 'Omnichannel Engagement',
        'general': 'General Inquiry',
        'demo': 'Full Demo - All Solutions'
    };
    return subjectMap[subjectValue] || subjectValue;
}

async sendContactForm(formData) {
    const { firstName, lastName, email, phone, company, subject, message } = formData;
    
    // Use the helper function to get display text
    const subjectDisplay = this.getSubjectDisplay(subject);
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { color: #333; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2> New Contact Form Submission - Orivanta</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">👤 Name:</div>
                    <div class="value">${firstName} ${lastName}</div>
                </div>
                <div class="field">
                    <div class="label">📧 Email:</div>
                    <div class="value">${email}</div>
                </div>
                ${phone ? `<div class="field">
                    <div class="label">📱 Phone:</div>
                    <div class="value">${phone}</div>
                </div>` : ''}
                ${company ? `<div class="field">
                    <div class="label">🏢 Company:</div>
                    <div class="value">${company}</div>
                </div>` : ''}
                <div class="field">
                    <div class="label">🎯 AI Solution Interest:</div>
                    <div class="value">${subjectDisplay}</div>
                </div>
                <div class="field">
                    <div class="label">💬 Current Challenges:</div>
                    <div class="value">${message}</div>
                </div>
            </div>
            <div class="footer">
                <p>⏰ Received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <p>🌐 From: Orivanta Contact Form (via Brevo SMTP)</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"Orivanta Contact Form" <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: ` New Lead: ${company} - ${firstName} ${lastName} (${subjectDisplay})`,
        html: htmlTemplate,
        text: `
New Contact Form Submission:

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
AI Solution Interest: ${subjectDisplay}
Current Challenges: ${message}

Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        `
    };

    return await this.transporter.sendMail(mailOptions);
}


    async sendAutoReply(email, firstName) {
        const autoReplyTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; background: white; border-radius: 0 0 8px 8px; }
                .footer { text-align: center; padding: 15px; font-size: 14px; color: #666; background: #f5f5f5; }
                .highlight { color: #667eea; font-weight: bold; }
                ul { padding-left: 20px; }
                li { margin-bottom: 8px; }
            </style>
        </head>
        <body>
    <div class="container">
        <div class="header">
            <h2> Thank You for Starting the Conversation!</h2>
        </div>
        <div class="content">
            <p>Hi <span class="highlight">${firstName}</span>,</p>
            <p>Thank you for reaching out to Orivanta! We've received your message and appreciate you taking the time to connect with us.</p>
            <p>Whether you're interested in collaboration, exploring partnerships, or have questions about our services, we're excited to start this conversation.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>We'll carefully review your message and requirements</li>
                <li>Our team will reach out within 24 hours to discuss next steps</li>
                <li>We'll explore how we can work together effectively</li>
                <li>Schedule a follow-up call if needed</li>
            </ul>
            <p>We value meaningful connections and look forward to exploring opportunities together.</p>
            <p>Best regards,<br><strong>The Orivanta Team</strong> </p>
        </div>
        <div class="footer">
            <p><strong>Orivanta - Digital Innovation Partners</strong></p>
            <p>📧 Email: support@orivanta.in | 📱 Phone: +91 94734 21755</p>
        </div>
    </div>
</body>

        </html>
        `;

        const autoReplyOptions = {
            from: `"Orivanta Team" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '✅ Thank you for contacting Orivanta - We\'ll be in touch soon!',
            html: autoReplyTemplate
        };

        return await this.transporter.sendMail(autoReplyOptions);
    }
}

module.exports = new EmailService();

