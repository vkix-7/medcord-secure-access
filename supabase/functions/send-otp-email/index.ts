
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the service role key from environment variables
const supabaseUrl = "https://zhieywexatjtbpkmmyda.supabase.co";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!serviceRoleKey) {
  throw new Error("Service role key is required");
}

// Set to true to enable actual email sending (requires verified domain in Resend)
const SEND_REAL_EMAILS = false;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      throw new Error("Email and OTP code are required");
    }

    console.log(`Sending OTP email to: ${email} with code: ${otpCode}`);

    let emailSendResult = null;
    
    // Check if we should send real emails
    if (SEND_REAL_EMAILS && resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'your-verified@domain.com', // Replace with your verified domain
            to: email,
            subject: 'Your MedCord Login OTP',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your MedCord Login Code</h2>
                <p>Hello,</p>
                <p>Your one-time password (OTP) for logging into MedCord is:</p>
                <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
                  ${otpCode}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
                <p>Thanks,<br>The MedCord Team</p>
              </div>
            `,
          }),
        });
        
        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error("Resend API error response:", errorData);
          throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
        }
        
        emailSendResult = await emailResponse.json();
        console.log("Email sent successfully:", emailSendResult);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        throw new Error(`Email sending failed: ${emailError.message}`);
      }
    } else {
      // In DEVELOPMENT MODE: Just log the OTP and return success
      console.log("DEVELOPMENT MODE: Not sending actual email. OTP is:", otpCode);
      console.log(`In production, this would be sent to: ${email}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: SEND_REAL_EMAILS ? "OTP email sent successfully" : "OTP logged successfully (dev mode)",
      debug: !SEND_REAL_EMAILS ? {
        otpCode: otpCode,
        recipient: email
      } : undefined,
      email_data: SEND_REAL_EMAILS ? emailSendResult : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in send-otp-email function:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to send OTP email",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
