import os
import glob
import re

def make_idempotent():
    for f in glob.glob('supabase/migrations/*.sql'):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 1. Policies: drop policy if exists ... before create policy
        # Matches: create policy "name" on table
        policy_pattern = re.compile(r'create policy\s+\"([^\"]+)\"\s+on\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE | re.MULTILINE)
        
        # We need to be careful with newlines. 
        # The replacement will preserve the "on table" part but add the drop before it.
        # However, re.sub with a function or careful group usage is better.
        
        def replace_policy(match):
            name = match.group(1)
            table = match.group(2)
            return f'drop policy if exists "{name}" on {table};\ncreate policy "{name}" on {table}'

        new_content = policy_pattern.sub(replace_policy, content)
        
        # 2. Also ensure tables use IF NOT EXISTS if not already
        new_content = re.sub(r'create table (?!if not exists)', 'create table if not exists ', new_content, flags=re.IGNORECASE)
        
        # 3. Triggers: drop trigger if exists ... before create trigger (if not using create or replace)
        # Note: Postgres 14+ supports CREATE OR REPLACE TRIGGER, but many environments are 13 or lower.
        # Actually, Supabase is usually 15+. Let's check for "create trigger"
        trigger_pattern = re.compile(r'create trigger\s+([a-zA-Z0-9_\.]+)\s+([a-z]+)\s+([a-z\s]+)\s+on\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE)
        
        def replace_trigger(match):
            name = match.group(1)
            table = match.group(4)
            return f'drop trigger if exists {name} on {table};\n{match.group(0)}'
        
        # Only add drop if it doesn't already have one nearby
        # For simplicity, let's just do it.
        # But wait, I already did "create or replace trigger" in the previous turn.
        # Let's ensure it's "create or replace trigger" everywhere.
        new_content = re.sub(r'create trigger', 'create or replace trigger', new_content, flags=re.IGNORECASE)

        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")

if __name__ == "__main__":
    make_idempotent()
