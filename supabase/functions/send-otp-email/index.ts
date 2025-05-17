
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

    // Instead of sending an actual email in testing mode, we'll return success
    // and log the OTP code. This bypasses the Resend domain verification requirement
    
    // For production, you would uncomment this section after verifying a domain in Resend:
    /*
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'your-verified@domain.com', // Use a verified domain
        to: email,
        subject: 'Your MedCord Login OTP',
        html: `<div>Your OTP code is: ${otpCode}</div>`,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error response:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }
    
    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);
    */
    
    // In DEVELOPMENT MODE: Just log the OTP and return success
    console.log("DEVELOPMENT MODE: Not sending actual email. OTP is:", otpCode);
    console.log(`In production, this would be sent to: ${email}`);

    return new Response(JSON.stringify({
      success: true,
      message: "OTP logged successfully (dev mode)",
      debug: {
        otpCode: otpCode,
        recipient: email
      }
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
