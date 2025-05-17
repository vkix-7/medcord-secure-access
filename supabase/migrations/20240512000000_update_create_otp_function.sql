
-- Update the create_otp function to return the generated code and remove rate limiting
CREATE OR REPLACE FUNCTION public.create_otp(p_phone_number text, p_email text, p_user_id uuid, p_expires_in interval)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_code TEXT;
  v_identifier TEXT;
BEGIN
  -- Validate input
  IF p_phone_number IS NULL AND p_email IS NULL THEN
    RAISE EXCEPTION 'Either phone number or email must be provided';
  END IF;

  -- Set identifier
  v_identifier := COALESCE(p_phone_number, p_email);

  -- Generate 6-digit code
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  -- Store OTP
  INSERT INTO otp_attempts (
    user_id,
    phone_number,
    email,
    code,
    expires_at
  ) VALUES (
    p_user_id,
    p_phone_number,
    p_email,
    crypt(v_code, gen_salt('bf')),
    now() + COALESCE(p_expires_in, interval '5 minutes')
  );

  -- Return the generated code so it can be used by the email sending function
  RETURN v_code;
END;
$function$;

