from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__)

# Constants
VALID_TEAMS = {
    'varsity': 'Varsity',
    'v': 'Varsity',
    'jv': 'JV',
    'a': 'A',
    'dev': 'Dev Squad',
    'dev squad': 'Dev Squad',
    'devsquad': 'Dev Squad',
    'development': 'Dev Squad'
}

# Data storage
DATA_FILE = 'data/athletes.json'

def load_athletes():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_athletes(athletes):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(athletes, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/import-export')
def import_export():
    return render_template('import_export.html')

@app.route('/api/athletes', methods=['GET'])
def get_athletes():
    athletes = load_athletes()
    return jsonify(athletes)

@app.route('/api/athletes', methods=['POST'])
def add_athlete():
    athlete = request.json
    athletes = load_athletes()
    
    # Add attendance history if not present
    if 'attendanceHistory' not in athlete:
        athlete['attendanceHistory'] = []
    
    athletes.append(athlete)
    save_athletes(athletes)
    return jsonify(athlete)

@app.route('/api/athletes/<int:index>/attendance', methods=['PUT'])
def toggle_attendance(index):
    athletes = load_athletes()
    if 0 <= index < len(athletes):
        athletes[index]['present'] = not athletes[index]['present']
        # Add attendance record
        athletes[index]['attendanceHistory'].append({
            'date': datetime.now().strftime('%Y-%m-%d'),
            'present': athletes[index]['present']
        })
        save_athletes(athletes)
        return jsonify(athletes[index])
    return jsonify({'error': 'Athlete not found'}), 404

@app.route('/api/athletes/<int:index>', methods=['DELETE'])
def remove_athlete(index):
    athletes = load_athletes()
    if 0 <= index < len(athletes):
        removed = athletes.pop(index)
        save_athletes(athletes)
        return jsonify(removed)
    return jsonify({'error': 'Athlete not found'}), 404

@app.route('/api/import-csv', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    # Read the CSV file
    content = file.read().decode('utf-8').splitlines()
    
    # Process the CSV content
    headers = content[0].split(',')
    headers = [h.strip().lower().replace('"', '') for h in headers]
    
    # Find column indices
    team_columns = [i for i, h in enumerate(headers) if 'team' in h]
    column_indices = {
        'firstName': next((i for i, h in enumerate(headers) if 'first' in h), -1),
        'lastName': next((i for i, h in enumerate(headers) if 'last' in h), -1),
        'grade': next((i for i, h in enumerate(headers) if 'grade' in h), -1),
        'team': team_columns[-1] if team_columns else -1,
        'workoutGroup': len(headers) - 1  # Last column is workout group
    }
    
    new_athletes = []
    warnings = []
    current_workout_group = ''
    
    # Process each row
    for i, row in enumerate(content[1:], 1):
        if not row.strip():
            continue
            
        cells = [cell.strip().replace('"', '') for cell in row.split(',')]
        
        # Get the workout group from the last column
        row_workout_group = cells[-1].strip() if len(cells) > 0 else ''
        
        # Update current_workout_group if this row has a non-empty workout group
        if row_workout_group:
            current_workout_group = row_workout_group
            # If this row only contains a workout group, skip processing it as an athlete
            if len([cell for cell in cells[:-1] if cell.strip()]) == 0:
                continue
        
        # Get base values
        first_name = cells[column_indices['firstName']] if column_indices['firstName'] >= 0 and column_indices['firstName'] < len(cells) else ''
        last_name = cells[column_indices['lastName']] if column_indices['lastName'] >= 0 and column_indices['lastName'] < len(cells) else ''
        grade = cells[column_indices['grade']] if column_indices['grade'] >= 0 and column_indices['grade'] < len(cells) else ''
        team = cells[column_indices['team']] if column_indices['team'] >= 0 and column_indices['team'] < len(cells) else ''
        
        # Skip rows without name (likely headers or empty rows)
        if not first_name and not last_name:
            continue
            
        # Normalize team name
        team_lower = team.lower().strip()
        normalized_team = VALID_TEAMS.get(team_lower, '')
        if not normalized_team and team:
            warnings.append(f'Invalid team "{team}" for {first_name} {last_name}')
            
        new_athletes.append({
            'firstName': first_name,
            'lastName': last_name,
            'gender': '',
            'grade': grade,
            'team': normalized_team,
            'workoutGroup': current_workout_group,
            'present': False,
            'attendanceHistory': []
        })
    
    # Save the new athletes
    save_athletes(new_athletes)
    
    return jsonify({
        'message': f'Successfully imported {len(new_athletes)} athletes',
        'warnings': warnings,
        'athletes': new_athletes
    })

@app.route('/api/athletes/all', methods=['DELETE'])
def remove_all_athletes():
    save_athletes([])
    return jsonify({'message': 'All athletes removed successfully'})

@app.route('/stats')
def stats():
    return render_template('stats.html')

if __name__ == '__main__':
    app.run(debug=True) 