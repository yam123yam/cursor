// Global state
let athletes = [];
let filteredAthletes = [];

// Constants
const teamOrder = {
    'Varsity': 1,
    'JV': 2,
    'A': 3,
    'Dev Squad': 4
};

const GRADE_ORDER = ['7', '8', '9', '10', '11', '12'];

// Helper Functions
function getAthleteDisplayName(athlete) {
    return `${athlete.firstName} ${athlete.lastName}`.trim();
}

function createAthleteElement(athlete, index) {
    const athleteItem = document.createElement('div');
    athleteItem.className = `athlete ${athlete.present ? 'present' : 'absent'}`;
    athleteItem.innerHTML = `
        <div class="athlete-main">
            <span class="name">${getAthleteDisplayName(athlete)}</span>
            <div class="athlete-details">
                <span class="grade">Grade: ${athlete.grade || 'N/A'}</span>
                <span class="team">Team: ${athlete.team || 'N/A'}</span>
                <span class="workout-group">Group: ${athlete.workoutGroup || 'N/A'}</span>
            </div>
        </div>
        <div class="athlete-actions">
            <button class="btn btn-sm btn-warning me-2" onclick="showEditAthleteModal(${index})">Edit</button>
            <button class="btn btn-sm ${athlete.present ? 'btn-success' : 'btn-danger'}" 
                    onclick="toggleAttendance(${index})">
                ${athlete.present ? 'Present' : 'Absent'}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="removeAthlete(${index})">Remove</button>
        </div>
    `;
    return athleteItem;
}

// Update Functions
function updateStats() {
    document.getElementById('totalAthletes').textContent = filteredAthletes.length;
    document.getElementById('presentCount').textContent = filteredAthletes.filter(a => a.present).length;
}

function updateFilters() {
    console.log('Updating filters with athletes:', athletes);
    // Only show grades that are in GRADE_ORDER and present in the data
    const gradesPresent = new Set(athletes.map(a => a.grade && a.grade.toString()).filter(Boolean));
    const grades = GRADE_ORDER.filter(g => gradesPresent.has(g));
    console.log('Available grades:', grades);
    const gradeFilter = document.getElementById('gradeFilter');
    gradeFilter.innerHTML = '<option value="">All Grades</option>' +
        grades.map(grade => `<option value="${grade}">${grade}</option>`).join('');

    // Update team filter
    const teams = [...new Set(athletes.map(a => a.team).filter(Boolean))].sort();
    const teamFilter = document.getElementById('teamFilter');
    teamFilter.innerHTML = '<option value="">All Teams</option>' +
        teams.map(team => `<option value="${team}">${team}</option>`).join('');

    // Update workout group filter
    const groups = [...new Set(athletes.map(a => a.workoutGroup).filter(Boolean))].sort();
    const groupFilter = document.getElementById('groupFilter');
    groupFilter.innerHTML = '<option value="">All Workout Groups</option>' +
        groups.map(group => `<option value="${group}">${group}</option>`).join('');

    // Update workout group dropdown in add form
    const workoutGroup = document.getElementById('workoutGroup');
    workoutGroup.innerHTML = '<option value="">Select Group</option>' +
        groups.map(group => `<option value="${group}">${group}</option>`).join('');
}

function updateAttendanceList() {
    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = '';
    
    filteredAthletes.forEach((athlete, index) => {
        const originalIndex = athletes.indexOf(athlete);
        attendanceList.appendChild(createAthleteElement(athlete, originalIndex));
    });
    
    updateStats();
}

// Filter and Sort Functions
function filterAthletes() {
    const gradeFilter = document.getElementById('gradeFilter').value;
    const teamFilter = document.getElementById('teamFilter').value;
    const groupFilter = document.getElementById('groupFilter').value;

    // First, reset filtered athletes to a copy of all athletes
    filteredAthletes = [...athletes];

    // Then apply filters if they exist
    if (gradeFilter || teamFilter || groupFilter) {
        filteredAthletes = filteredAthletes.filter(athlete => {
            // Normalize athlete values to handle null/undefined
            const athleteGrade = (athlete.grade || '').toString().trim();
            const athleteTeam = (athlete.team || '').trim();
            const athleteGroup = (athlete.workoutGroup || '').trim();

            // Match against filters
            const gradeMatch = !gradeFilter || athleteGrade === gradeFilter;
            const teamMatch = !teamFilter || athleteTeam === teamFilter;
            const groupMatch = !groupFilter || athleteGroup === groupFilter;

            return gradeMatch && teamMatch && groupMatch;
        });
    }

    // Always sort after filtering
    sortAthletes();
    updateAttendanceList();
}

function sortAthletes() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredAthletes.sort((a, b) => {
        const aName = getAthleteDisplayName(a);
        const bName = getAthleteDisplayName(b);
        const aGradeIdx = GRADE_ORDER.indexOf((a.grade || '').toString());
        const bGradeIdx = GRADE_ORDER.indexOf((b.grade || '').toString());
        const aTeam = (a.team || '').trim();
        const bTeam = (b.team || '').trim();
        const aGroup = (a.workoutGroup || '').trim();
        const bGroup = (b.workoutGroup || '').trim();
        
        switch(sortBy) {
            case 'team':
                const aTeamOrder = teamOrder[aTeam] || 999;
                const bTeamOrder = teamOrder[bTeam] || 999;
                if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
                if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
                if (aGradeIdx !== bGradeIdx) return aGradeIdx - bGradeIdx;
                return aName.localeCompare(bName);
            
            case 'group':
                if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
                if (aTeam !== bTeam) {
                    const aTeamOrder = teamOrder[aTeam] || 999;
                    const bTeamOrder = teamOrder[bTeam] || 999;
                    if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
                }
                if (aGradeIdx !== bGradeIdx) return aGradeIdx - bGradeIdx;
                return aName.localeCompare(bName);
            
            case 'grade':
                if (aGradeIdx !== bGradeIdx) return aGradeIdx - bGradeIdx;
                if (aTeam !== bTeam) {
                    const aTeamOrder = teamOrder[aTeam] || 999;
                    const bTeamOrder = teamOrder[bTeam] || 999;
                    if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
                }
                if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
                return aName.localeCompare(bName);
            
            case 'name':
            default:
                if (aName !== bName) return aName.localeCompare(bName);
                if (aTeam !== bTeam) {
                    const aTeamOrder = teamOrder[aTeam] || 999;
                    const bTeamOrder = teamOrder[bTeam] || 999;
                    if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
                }
                if (aGroup !== bGroup) return aGroup.localeCompare(bGroup);
                return aGradeIdx - bGradeIdx;
        }
    });
}

// API Functions
async function loadAthletes() {
    try {
        const response = await fetch('/api/athletes');
        athletes = await response.json();
        filteredAthletes = [...athletes];
        updateFilters();
        filterAthletes();
    } catch (error) {
        console.error('Error loading athletes:', error);
        alert('Error loading athletes. Please try again.');
    }
}

async function addAthlete(event) {
    event.preventDefault();
    
    const athlete = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        grade: document.getElementById('grade').value,
        team: document.getElementById('team').value,
        workoutGroup: document.getElementById('workoutGroup').value,
        present: false
    };
    
    try {
        const response = await fetch('/api/athletes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(athlete)
        });
        
        if (response.ok) {
            const newAthlete = await response.json();
            athletes.push(newAthlete);
            updateFilters();
            filterAthletes();
            event.target.reset();
        } else {
            throw new Error('Failed to add athlete');
        }
    } catch (error) {
        console.error('Error adding athlete:', error);
        alert('Error adding athlete. Please try again.');
    }
}

async function toggleAttendance(index) {
    try {
        const response = await fetch(`/api/athletes/${index}/attendance`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            const updatedAthlete = await response.json();
            athletes[index] = updatedAthlete;
            filterAthletes();
        } else {
            throw new Error('Failed to update attendance');
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        alert('Error updating attendance. Please try again.');
    }
}

async function removeAthlete(index) {
    const athlete = athletes[index];
    const athleteName = getAthleteDisplayName(athlete);
    
    // First confirmation
    if (!confirm(`Are you sure you want to remove ${athleteName}?`)) {
        return;
    }
    
    // Second confirmation
    if (!confirm(`This action cannot be undone. Really remove ${athleteName}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/athletes/${index}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            athletes.splice(index, 1);
            updateFilters();
            filterAthletes();
        } else {
            throw new Error('Failed to remove athlete');
        }
    } catch (error) {
        console.error('Error removing athlete:', error);
        alert('Error removing athlete. Please try again.');
    }
}

async function removeAllAthletes() {
    // First confirmation
    if (!confirm('Are you sure you want to remove ALL athletes?')) {
        return;
    }
    
    // Second confirmation with count
    if (!confirm(`This will remove ${athletes.length} athletes and cannot be undone. Really proceed?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/athletes/all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            athletes = [];
            filteredAthletes = [];
            updateFilters();
            updateAttendanceList();
        } else {
            throw new Error('Failed to remove all athletes');
        }
    } catch (error) {
        console.error('Error removing all athletes:', error);
        alert('Error removing all athletes. Please try again.');
    }
}

async function importCSV(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/import-csv', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            athletes = result.athletes;
            updateFilters();
            filterAthletes();
            
            if (result.warnings.length > 0) {
                alert('Import completed with warnings:\n\n' + result.warnings.join('\n'));
            } else {
                alert(result.message);
            }
            
            fileInput.value = '';
        } else {
            throw new Error(result.error || 'Failed to import CSV');
        }
    } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV. Please try again.');
    }
}

function exportToCSV() {
    const headers = ['First Name', 'Last Name', 'Grade', 'Team', 'Workout Group', 'Present'];
    const rows = athletes.map(athlete => [
        athlete.firstName,
        athlete.lastName,
        athlete.grade || '',
        athlete.team || '',
        athlete.workoutGroup || '',
        athlete.present ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Add this function to show the edit modal with athlete details
function showEditAthleteModal(index) {
    const athlete = athletes[index];
    document.getElementById('editAthleteIndex').value = index;
    document.getElementById('editFirstName').value = athlete.firstName || '';
    document.getElementById('editLastName').value = athlete.lastName || '';
    document.getElementById('editGrade').value = athlete.grade || '';
    document.getElementById('editTeam').value = athlete.team || '';
    document.getElementById('editWorkoutGroup').value = athlete.workoutGroup || '';
    const modal = new bootstrap.Modal(document.getElementById('editAthleteModal'));
    modal.show();
}

// Handle edit form submission
async function handleEditAthlete(event) {
    event.preventDefault();
    const index = parseInt(document.getElementById('editAthleteIndex').value);
    const updatedAthlete = {
        ...athletes[index],
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        grade: document.getElementById('editGrade').value,
        team: document.getElementById('editTeam').value,
        workoutGroup: document.getElementById('editWorkoutGroup').value,
        present: athletes[index].present,
        attendanceHistory: athletes[index].attendanceHistory || []
    };
    console.log('Sending updated athlete:', updatedAthlete);
    try {
        const response = await fetch(`/api/athletes/${index}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAthlete)
        });
        const result = await response.json();
        console.log('PUT response:', result);
        if (response.ok) {
            athletes[index] = result;
            updateFilters();
            filterAthletes();
            bootstrap.Modal.getInstance(document.getElementById('editAthleteModal')).hide();
        } else {
            throw new Error('Failed to update athlete');
        }
    } catch (error) {
        alert('Error updating athlete.');
        console.error(error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAthletes();
    
    const addAthleteForm = document.getElementById('addAthleteForm');
    if (addAthleteForm) {
        addAthleteForm.addEventListener('submit', addAthlete);
    }
    const csvImportForm = document.getElementById('csvImportForm');
    if (csvImportForm) {
        csvImportForm.addEventListener('submit', importCSV);
    }

    const gradeFilter = document.getElementById('gradeFilter');
    if (gradeFilter) {
        gradeFilter.addEventListener('change', filterAthletes);
    }
    const teamFilter = document.getElementById('teamFilter');
    if (teamFilter) {
        teamFilter.addEventListener('change', filterAthletes);
    }
    const groupFilter = document.getElementById('groupFilter');
    if (groupFilter) {
        groupFilter.addEventListener('change', filterAthletes);
    }
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            sortAthletes();
            updateAttendanceList();
        });
    }
    const editAthleteForm = document.getElementById('editAthleteForm');
    if (editAthleteForm) {
        editAthleteForm.addEventListener('submit', handleEditAthlete);
    }
}); 