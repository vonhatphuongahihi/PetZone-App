import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Cấu hình transporter từ .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// POST endpoint để nhận support request
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Email gửi đến admin
    const adminMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Gửi về chính email của bạn
      subject: `[Hỗ trợ khách hàng] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FCCB05; border-bottom: 2px solid #FCCB05; padding-bottom: 10px;">
            Yêu cầu hỗ trợ mới
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Họ và tên:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Chủ đề:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Nội dung:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              💡 <strong>Lưu ý:</strong> Hãy phản hồi trực tiếp về email ${email}
            </p>
          </div>
        </div>
      `
    };

    // Email xác nhận gửi cho khách hàng
    const customerMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Đã nhận yêu cầu hỗ trợ của bạn - PetZone',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FCCB05;">Cảm ơn bạn đã liên hệ!</h2>
          
          <p style="color: #666; line-height: 1.6;">Xin chào <strong>${name}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn với nội dung:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #FCCB05; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Chủ đề:</strong> ${subject}</p>
            <p style="margin: 5px 0; color: #666; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Đội ngũ chăm sóc khách hàng của chúng tôi sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Email này được gửi tự động, vui lòng không phản hồi trực tiếp.<br>
              Nếu cần hỗ trợ gấp, vui lòng liên hệ hotline: 1900-xxxx
            </p>
          </div>
        </div>
      `
    };

    // Gửi cả 2 email
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    res.status(200).json({
      success: true,
      message: 'Đã gửi yêu cầu hỗ trợ thành công'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi email. Vui lòng thử lại sau.'
    });
  }
});

export default router;