// Global variables
let athletes = [];
let filteredAthletes = [];
let currentEditIndex = -1;

// Constants
const VALID_TEAMS = {
    'varsity': 'Varsity',
    'v': 'Varsity',
    'jv': 'JV',
    'j': 'JV',
    'a': 'A',
    'dev': 'Dev Squad',
    'dev squad': 'Dev Squad',
    'devsquad': 'Dev Squad',
    'development': 'Dev Squad',
    'd': 'Dev Squad'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadAthletes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add athlete form submission
    document.querySelector('.input-group').addEventListener('submit', (e) => {
        e.preventDefault();
        addAthlete();
    });

    // Filter changes
    document.getElementById('gradeFilter').addEventListener('change', updateAttendanceList);
    document.getElementById('teamFilter').addEventListener('change', updateAttendanceList);
    document.getElementById('groupFilter').addEventListener('change', updateAttendanceList);
}

// Load athletes from localStorage
function loadAthletes() {
    const storedAthletes = localStorage.getItem('athletes');
    if (storedAthletes) {
        athletes = JSON.parse(storedAthletes);
        filteredAthletes = [...athletes];
        updateFilters();
        updateAttendanceList();
    }
}

// Save athletes to localStorage
function saveAthletes() {
    localStorage.setItem('athletes', JSON.stringify(athletes));
    updateFilters();
    updateAttendanceList();
}

// Add a new athlete
function addAthlete() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const grade = document.getElementById('grade').value;
    const team = document.getElementById('team').value;
    const workoutGroup = document.getElementById('workoutGroup').value;

    if (!firstName || !lastName || !grade || !team || !workoutGroup) {
        alert('Please fill in all required fields');
        return;
    }

    const athlete = {
        firstName,
        lastName,
        grade,
        team,
        workoutGroup,
        present: false,
        attendanceHistory: []
    };

    athletes.push(athlete);
    saveAthletes();

    // Clear form
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('grade').value = '';
    document.getElementById('team').value = '';
    document.getElementById('workoutGroup').value = '';
}

// Update the filters dropdowns
function updateFilters() {
    const workoutGroups = new Set();
    athletes.forEach(athlete => {
        if (athlete.workoutGroup) {
            workoutGroups.add(athlete.workoutGroup);
        }
    });

    const groupFilter = document.getElementById('groupFilter');
    const workoutGroupSelect = document.getElementById('workoutGroup');
    const editWorkoutGroup = document.getElementById('editWorkoutGroup');

    // Clear existing options except the first one
    while (groupFilter.options.length > 1) groupFilter.remove(1);
    while (workoutGroupSelect.options.length > 1) workoutGroupSelect.remove(1);
    while (editWorkoutGroup.options.length > 1) editWorkoutGroup.remove(1);

    // Add new options
    workoutGroups.forEach(group => {
        groupFilter.add(new Option(group, group));
        workoutGroupSelect.add(new Option(group, group));
        editWorkoutGroup.add(new Option(group, group));
    });
}

// Update the attendance list display
function updateAttendanceList() {
    const gradeFilter = document.getElementById('gradeFilter').value;
    const teamFilter = document.getElementById('teamFilter').value;
    const groupFilter = document.getElementById('groupFilter').value;

    filteredAthletes = athletes.filter(athlete => {
        return (!gradeFilter || athlete.grade === gradeFilter) &&
               (!teamFilter || athlete.team === teamFilter) &&
               (!groupFilter || athlete.workoutGroup === groupFilter);
    });

    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = '';

    filteredAthletes.forEach((athlete, index) => {
        const athleteElement = document.createElement('div');
        athleteElement.className = `athlete-item ${athlete.present ? 'present' : ''}`;
        athleteElement.innerHTML = `
            <div class="athlete-info">
                <span class="name">${athlete.firstName} ${athlete.lastName}</span>
                <span class="details">Grade ${athlete.grade} - ${athlete.team} - ${athlete.workoutGroup}</span>
            </div>
            <div class="athlete-actions">
                <button class="btn btn-sm btn-primary" onclick="toggleAttendance(${index})">
                    ${athlete.present ? 'Present' : 'Absent'}
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editAthlete(${index})">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="removeAthlete(${index})">
                    Remove
                </button>
            </div>
        `;
        attendanceList.appendChild(athleteElement);
    });

    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalAthletes').textContent = athletes.length;
    document.getElementById('presentCount').textContent = athletes.filter(a => a.present).length;
}

// Toggle attendance for an athlete
function toggleAttendance(index) {
    const athlete = athletes[index];
    athlete.present = !athlete.present;
    athlete.attendanceHistory.push({
        date: new Date().toISOString().split('T')[0],
        present: athlete.present
    });
    saveAthletes();
}

// Toggle attendance for all athletes
function toggleAllAttendance() {
    const allPresent = athletes.every(a => a.present);
    athletes.forEach(athlete => {
        athlete.present = !allPresent;
        athlete.attendanceHistory.push({
            date: new Date().toISOString().split('T')[0],
            present: athlete.present
        });
    });
    saveAthletes();
}

// Edit an athlete
function editAthlete(index) {
    const athlete = athletes[index];
    currentEditIndex = index;

    document.getElementById('editFirstName').value = athlete.firstName;
    document.getElementById('editLastName').value = athlete.lastName;
    document.getElementById('editGrade').value = athlete.grade;
    document.getElementById('editTeam').value = athlete.team;
    document.getElementById('editWorkoutGroup').value = athlete.workoutGroup;

    const modal = new bootstrap.Modal(document.getElementById('editAthleteModal'));
    modal.show();
}

// Save athlete edit
function saveAthleteEdit() {
    if (currentEditIndex === -1) return;

    const athlete = athletes[currentEditIndex];
    athlete.firstName = document.getElementById('editFirstName').value.trim();
    athlete.lastName = document.getElementById('editLastName').value.trim();
    athlete.grade = document.getElementById('editGrade').value;
    athlete.team = document.getElementById('editTeam').value;
    athlete.workoutGroup = document.getElementById('editWorkoutGroup').value;

    if (!athlete.firstName || !athlete.lastName || !athlete.grade || !athlete.team || !athlete.workoutGroup) {
        alert('Please fill in all required fields');
        return;
    }

    saveAthletes();
    bootstrap.Modal.getInstance(document.getElementById('editAthleteModal')).hide();
    currentEditIndex = -1;
}

// Remove an athlete
function removeAthlete(index) {
    if (confirm('Are you sure you want to remove this athlete?')) {
        athletes.splice(index, 1);
        saveAthletes();
    }
}

// Remove all athletes
function removeAllAthletes() {
    if (confirm('Are you sure you want to remove ALL athletes? This cannot be undone!')) {
        athletes = [];
        saveAthletes();
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['First Name', 'Last Name', 'Grade', 'Team', 'Workout Group', 'Present'];
    const csvContent = [
        headers.join(','),
        ...athletes.map(athlete => [
            athlete.firstName,
            athlete.lastName,
            athlete.grade,
            athlete.team,
            athlete.workoutGroup,
            athlete.present ? 'Yes' : 'No'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Import from CSV
function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result.split('\n');
        const headers = content[0].split(',').map(h => h.trim().toLowerCase().replace('"', ''));
        
        // Find column indices
        const columnIndices = {
            firstName: headers.findIndex(h => h.includes('first')),
            lastName: headers.findIndex(h => h.includes('last')),
            grade: headers.findIndex(h => h.includes('grade')),
            team: headers.findIndex(h => h.includes('team')),
            workoutGroup: headers.findIndex(h => h.includes('workout'))
        };

        const newAthletes = [];
        const warnings = [];

        // Process each row
        for (let i = 1; i < content.length; i++) {
            if (!content[i].trim()) continue;

            const cells = content[i].split(',').map(cell => cell.trim().replace('"', ''));
            
            // Skip rows without name
            if (!cells[columnIndices.firstName] && !cells[columnIndices.lastName]) continue;

            // Try to find team from various columns
            let team = '';
            if (columnIndices.team >= 0) {
                team = cells[columnIndices.team] || '';
            } else {
                // Look for team in any column
                for (let j = 0; j < cells.length; j++) {
                    const cell = cells[j].toLowerCase();
                    if (Object.keys(VALID_TEAMS).some(key => cell.includes(key))) {
                        team = cells[j];
                        break;
                    }
                }
            }

            const teamLower = team.toLowerCase();
            const normalizedTeam = VALID_TEAMS[teamLower] || '';

            if (!normalizedTeam && team) {
                warnings.push(`Invalid team "${team}" for ${cells[columnIndices.firstName]} ${cells[columnIndices.lastName]}`);
            }

            newAthletes.push({
                firstName: cells[columnIndices.firstName] || '',
                lastName: cells[columnIndices.lastName] || '',
                grade: cells[columnIndices.grade] || '',
                team: normalizedTeam,
                workoutGroup: cells[columnIndices.workoutGroup] || '',
                present: false,
                attendanceHistory: []
            });
        }

        athletes = newAthletes;
        saveAthletes();

        if (warnings.length > 0) {
            alert('Import completed with warnings:\n\n' + warnings.join('\n'));
        } else {
            alert(`Successfully imported ${newAthletes.length} athletes`);
        }

        event.target.value = '';
    };
    reader.readAsText(file);
} 