
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

if (!resendApiKey) {
  throw new Error("Resend API key is required");
}

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

    // Send the email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',  // Using Resend's default domain
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

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({
      success: true,
      message: "OTP email sent successfully",
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
