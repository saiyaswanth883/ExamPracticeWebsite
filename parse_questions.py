#!/usr/bin/env python3
"""
Parse exam questions and answers from extracted PDF text
"""

import json
import re
from pathlib import Path

def parse_computer1_pdf(text_file):
    """Parse Computer (1).pdf format"""
    with open(text_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find answers section
    answers_match = re.search(r'ANSWERS:\s*\n(.*?)$', content, re.DOTALL)
    if not answers_match:
        print("Warning: No answers section found")
        return []
    
    # Extract answers
    answers_text = answers_match.group(1)
    answers_dict = {}
    
    # Parse answer table format (e.g., "1.  2  11.  1  21.  2")
    answer_lines = [line.strip() for line in answers_text.split('\n') if line.strip()]
    for line in answer_lines:
        # Match pattern like "1.  2  11.  1  21.  2  31.  2"
        matches = re.findall(r'(\d+)\.\s+(\d+)', line)
        for q_num, answer in matches:
            answers_dict[int(q_num)] = int(answer)
    
    # Extract questions
    questions = []
    # Find all question blocks
    question_pattern = r'(\d+)\.\s+(.*?)(?=\n\s*A\))'
    option_pattern = r'([A-D])\)\s+([^\n]+)'
    
    # Split by question numbers
    lines = content.split('\n')
    current_question = None
    current_options = []
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Check if it's a new question
        q_match = re.match(r'^(\d+)\.\s+(.+)', line)
        if q_match:
            # Save previous question if exists
            if current_question and current_options:
                q_num = current_question['number']
                if q_num in answers_dict:
                    current_question['options'] = current_options
                    current_question['correctAnswer'] = answers_dict[q_num] - 1  # 0-indexed
                    questions.append(current_question)
            
            # Start new question
            q_num = int(q_match.group(1))
            q_text = q_match.group(2).strip()
            current_question = {
                'id': q_num,
                'number': q_num,
                'question': q_text
            }
            current_options = []
        
        # Check if it's an option
        opt_match = re.match(r'^([A-D])\)\s+(.+)', line)
        if opt_match and current_question:
            option_text = opt_match.group(2).strip()
            current_options.append(option_text)
    
    # Don't forget the last question
    if current_question and current_options:
        q_num = current_question['number']
        if q_num in answers_dict:
            current_question['options'] = current_options
            current_question['correctAnswer'] = answers_dict[q_num] - 1
            questions.append(current_question)
    
    return questions

def parse_pdf_generic(text_file, file_id):
    """Generic parser for PDFs - extracts basic structure"""
    with open(text_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    lines = content.split('\n')
    
    current_question = None
    current_options = []
    
    for line in lines:
        line = line.strip()
        
        # Question pattern
        q_match = re.match(r'^(\d+)[\.\)]\s+(.+)', line)
        if q_match:
            # Save previous question
            if current_question and current_options:
                if len(current_options) >= 4:
                    current_question['options'] = current_options[:4]
                    questions.append(current_question)
            
            # New question
            q_num = int(q_match.group(1))
            q_text = q_match.group(2).strip()
            current_question = {
                'id': f"{file_id}_{q_num}",
                'number': q_num,
                'question': q_text,
                'correctAnswer': 0  # Default
            }
            current_options = []
        
        # Option pattern
        opt_match = re.match(r'^([A-Da-d1-4][\)\.])\s+(.+)', line)
        if opt_match and current_question:
            option_text = opt_match.group(2).strip()
            if option_text and len(current_options) < 4:
                current_options.append(option_text)
    
    # Last question
    if current_question and current_options:
        if len(current_options) >= 4:
            current_question['options'] = current_options[:4]
            questions.append(current_question)
    
    return questions

def create_exercises_structure(questions, questions_per_exercise=25):
    """Group questions into exercises"""
    exercises = []
    for i in range(0, len(questions), questions_per_exercise):
        exercise_num = (i // questions_per_exercise) + 1
        exercise_questions = questions[i:i + questions_per_exercise]
        exercises.append({
            'id': exercise_num,
            'name': f'Exercise {exercise_num}',
            'questions': exercise_questions,
            'totalQuestions': len(exercise_questions)
        })
    return exercises

def main():
    # Parse all PDFs
    data = {
        'files': []
    }
    
    # Computer (1).pdf
    print("Parsing Computer (1).pdf...")
    comp1_questions = parse_computer1_pdf('data/computer1_raw.txt')
    if comp1_questions:
        comp1_exercises = create_exercises_structure(comp1_questions, 25)
        data['files'].append({
            'id': 'computer1',
            'name': 'Computer (1)',
            'exercises': comp1_exercises
        })
        print(f"  Found {len(comp1_questions)} questions in {len(comp1_exercises)} exercises")
    
    # Computer.pdf
    print("Parsing Computer.pdf...")
    comp_questions = parse_pdf_generic('data/computer_raw.txt', 'computer')
    if comp_questions:
        comp_exercises = create_exercises_structure(comp_questions, 25)
        data['files'].append({
            'id': 'computer',
            'name': 'Computer',
            'exercises': comp_exercises
        })
        print(f"  Found {len(comp_questions)} questions in {len(comp_exercises)} exercises")
    
    # General.pdf
    print("Parsing General.pdf...")
    general_questions = parse_pdf_generic('data/general_raw.txt', 'general')
    if general_questions:
        general_exercises = create_exercises_structure(general_questions, 25)
        data['files'].append({
            'id': 'general',
            'name': 'General',
            'exercises': general_exercises
        })
        print(f"  Found {len(general_questions)} questions in {len(general_exercises)} exercises")
    
    # Save to JSON
    output_file = 'data/questions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Successfully created {output_file}")
    print(f"  Total files: {len(data['files'])}")
    for file in data['files']:
        print(f"  - {file['name']}: {len(file['exercises'])} exercises")

if __name__ == '__main__':
    main()
