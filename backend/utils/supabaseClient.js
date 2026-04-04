const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://your_project.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "your_anon_key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };
