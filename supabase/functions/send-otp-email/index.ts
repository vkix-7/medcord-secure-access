
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://zhieywexatjtbpkmmyda.supabase.co";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// EmailJS configuration - these would be set as environment variables
const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
const emailjsPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');
const emailjsPrivateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');

if (!serviceRoleKey) {
  throw new Error("Service role key is required");
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

    // Check if EmailJS environment variables are configured
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
      throw new Error("EmailJS configuration is missing. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY");
    }

    try {
      // Send email using EmailJS API
      const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          accessToken: emailjsPrivateKey,
          template_params: {
            to_email: email,
            otp_code: otpCode,
            app_name: 'MedCord',
            message: `Your MedCord login code is: ${otpCode}. This code will expire in 10 minutes.`
          }
        }),
      });
      
      if (!emailjsResponse.ok) {
        const errorText = await emailjsResponse.text();
        console.error("EmailJS API error response:", errorText);
        throw new Error(`Failed to send email via EmailJS: ${errorText}`);
      }
      
      const emailResult = await emailjsResponse.text();
      console.log("Email sent successfully via EmailJS:", emailResult);
      
      return new Response(JSON.stringify({
        success: true,
        message: "OTP email sent successfully via EmailJS",
        email_data: { status: 'sent', response: emailResult }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (emailError) {
      console.error("Failed to send email via EmailJS:", emailError);
      throw emailError;
    }
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
