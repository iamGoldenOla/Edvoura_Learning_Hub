-- EDVOURA LEARNING HUB: SEED CURRICULUM MAPS
-- This script seeds the `curriculum_maps` table with ground-truth educational data.
-- We use DO blocks to dynamically look up subject and grade level IDs to avoid hardcoded UUID errors.

DO $$
DECLARE
    v_math_id UUID;
    v_english_id UUID;
    v_science_id UUID;
    v_pri3_id UUID;
    v_jss1_id UUID;
    v_sss1_id UUID;
BEGIN
    -- 1. Look up existing subjects (Create if they don't exist to ensure the script doesn't fail)
    SELECT id INTO v_math_id FROM public.subjects WHERE name ILIKE 'Mathematics' LIMIT 1;
    IF v_math_id IS NULL THEN
        INSERT INTO public.subjects (name, description) VALUES ('Mathematics', 'Core Mathematics') RETURNING id INTO v_math_id;
    END IF;

    SELECT id INTO v_english_id FROM public.subjects WHERE name ILIKE 'English Language' LIMIT 1;
    IF v_english_id IS NULL THEN
        INSERT INTO public.subjects (name, description) VALUES ('English Language', 'Core English') RETURNING id INTO v_english_id;
    END IF;

    SELECT id INTO v_science_id FROM public.subjects WHERE name ILIKE 'Basic Science' LIMIT 1;
    IF v_science_id IS NULL THEN
        INSERT INTO public.subjects (name, description) VALUES ('Basic Science', 'Core Science') RETURNING id INTO v_science_id;
    END IF;

    -- 2. Look up existing grade levels
    SELECT id INTO v_pri3_id FROM public.grade_levels WHERE code = 'PRI3' LIMIT 1;
    SELECT id INTO v_jss1_id FROM public.grade_levels WHERE code = 'JSS1' LIMIT 1;
    SELECT id INTO v_sss1_id FROM public.grade_levels WHERE code = 'SSS1' LIMIT 1;

    -- 3. Seed PRI3 Basic Science (WAEC/NECO Curriculum)
    IF v_pri3_id IS NOT NULL THEN
        INSERT INTO public.curriculum_maps (system_type, grade_level_id, subject_id, topic, learning_objectives, difficulty_weight)
        VALUES 
        (
            'WAEC', v_pri3_id, v_science_id, 
            'Living and Non-Living Things', 
            '["Identify characteristics of living things", "Differentiate between living and non-living things in the environment", "Give examples of 5 living things and 5 non-living things"]'::jsonb, 
            3
        ),
        (
            'WAEC', v_pri3_id, v_science_id, 
            'The Human Body: Sense Organs', 
            '["Name the five sense organs", "State the function of each sense organ", "Explain how to care for the sense organs"]'::jsonb, 
            4
        );
    END IF;

    -- 4. Seed JSS1 Mathematics (WAEC/NECO Curriculum)
    IF v_jss1_id IS NOT NULL THEN
        INSERT INTO public.curriculum_maps (system_type, grade_level_id, subject_id, topic, learning_objectives, difficulty_weight)
        VALUES 
        (
            'WAEC', v_jss1_id, v_math_id, 
            'Number Bases', 
            '["Understand the concept of base 10 and other number bases", "Convert from base 10 to base 2 (Binary)", "Convert from base 2 to base 10"]'::jsonb, 
            6
        ),
        (
            'WAEC', v_jss1_id, v_math_id, 
            'Basic Algebraic Expressions', 
            '["Understand algebraic symbols and variables", "Simplify algebraic expressions by collecting like terms", "Expand expressions with brackets"]'::jsonb, 
            5
        );
    END IF;

    -- 5. Seed SSS1 English Language (WAEC Curriculum)
    IF v_sss1_id IS NOT NULL THEN
        INSERT INTO public.curriculum_maps (system_type, grade_level_id, subject_id, topic, learning_objectives, difficulty_weight)
        VALUES 
        (
            'WAEC', v_sss1_id, v_english_id, 
            'Formal Letter Writing', 
            '["Identify the structure of a formal letter (Addresses, Date, Salutation, Heading, Body, Sign-off)", "Write a formal letter of complaint to a given authority", "Use appropriate formal vocabulary and tone"]'::jsonb, 
            7
        ),
        (
            'WAEC', v_sss1_id, v_english_id, 
            'Comprehension: Finding the Main Idea', 
            '["Read a passage and identify the topic sentence in each paragraph", "Summarize the main idea of a text in one sentence", "Differentiate between main ideas and supporting details"]'::jsonb, 
            6
        );
    END IF;

END $$;
