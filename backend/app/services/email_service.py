import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

class EmailService:
    @staticmethod
    def send_contact_email(name, user_email, subject, message, type='contact'):
        """
        Send a contact/support email to the admin using SMTP.
        """
        sender_email = os.getenv('MAIL_USERNAME')
        sender_password = os.getenv('MAIL_PASSWORD')
        recipient_email = "hmzaakram295@gmail.com"

        if not sender_email or not sender_password:
            logging.error("Mail credentials not configured")
            return False, "Server email configuration missing"

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = recipient_email
            msg['Subject'] = f"[{type.upper()}] {subject}"
            msg['Reply-To'] = user_email

            body = f"""
            You have received a new {type} message.

            Name: {name}
            Email: {user_email}
            Subject: {subject}

            Message:
            {message}
            """

            msg.attach(MIMEText(body, 'plain'))

            # Connect to SMTP server (Gmail)
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            
            return True, "Email sent successfully"

        except Exception as e:
            logging.error(f"Failed to send email: {str(e)}")
            return False, str(e)
