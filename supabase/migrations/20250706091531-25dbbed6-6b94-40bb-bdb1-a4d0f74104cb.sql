-- Add profile links columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN github_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN leetcode_url TEXT,
ADD COLUMN codeforces_url TEXT,
ADD COLUMN geeksforgeeks_url TEXT,
ADD COLUMN codingame_url TEXT,
ADD COLUMN portfolio_url TEXT;