import { supabase } from '../supabase/supabaseClient';

// Step 1: Send OTP to phone
export async function sendPhoneOtp(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

// Step 2: Verify OTP code
export async function verifyPhoneOtp(phone: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'sms'
  });
  if (error) throw error;
  return data;
}

// Step 3: Fetch user profile from public.users
export async function getUserProfile() {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) throw authError;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return profile;
}

// Step 4: Update user info (name, handle, role)
export async function updateUserProfile({
  name,
  handle,
  role,
}: {
  name: string;
  handle: string;
  role: string;
}) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) throw authError;

  const { error } = await supabase
    .from('users')
    .update({ name, handle, role })
    .eq('user_id', user.id);

  if (error) throw error;
}

// Step 5: Create or upsert user profile after signup
export async function createOrUpdateUserProfile({
  name,
  role,
  handle,
}: {
  name: string;
  role: string;
  handle: string;
}): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw authError;

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        user_id: user.id,
        phone: user.phone ?? 'N/A',
        name,
        role,
        handle,
      },
      { onConflict: ['user_id'] }
    );

  if (error) throw error;
}

// Step 6: Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Step 7: Determine initial route based on auth session
export async function getInitialRoute(): Promise<"Home" | "Welcome"> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return "Welcome";
  return "Home";
}

// Step 8: Verify OTP and determine next screen
export async function verifyPhoneOtpAndRoute(phone: string, code: string): Promise<"Home" | "ProfileSetup"> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'sms',
  });

  if (error) throw error;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") throw profileError;

  return profile ? "Home" : "ProfileSetup";
}
