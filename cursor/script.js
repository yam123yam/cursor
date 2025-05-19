// Store athletes in localStorage
let athletes = JSON.parse(localStorage.getItem('athletes')) || [];

// Define sorting orders
const cookieGroupOrder = {
    'Chocolate Chip': 1,
    'Oatmeal Raisin': 2,
    'Snickerdoodle': 3,
    'Peanut Butter': 4,
    'Sugar': 5,
    'Double Chocolate': 6
};

const teamOrder = {
    'Varsity': 1,
    'JV': 2,
    'A': 3,
    'Dev Squad': 4
};

// Helper function to get athlete display name
function getAthleteDisplayName(athlete) {
    return `${athlete.firstName} ${athlete.lastName}`.trim();
}

// Helper function to create athlete element
function createAthleteElement(athlete, index) {
    const athleteItem = document.createElement('div');
    athleteItem.className = `athlete ${athlete.present ? 'present' : 'absent'}`;
    athleteItem.innerHTML = `
        <div class="athlete-main">
            <span class="name">${getAthleteDisplayName(athlete)}</span>
            <div class="athlete-details">
                <span class="gender">Gender: ${athlete.gender === 'B' ? 'Boy' : athlete.gender === 'G' ? 'Girl' : 'N/A'}</span>
                <span class="grade">Grade: ${athlete.grade || 'N/A'}</span>
                <span class="team">Team: ${athlete.team || 'N/A'}</span>
                <span class="workout-group">Group: ${athlete.workoutGroup || 'N/A'}</span>
            </div>
        </div>
        <div class="athlete-actions">
            <button class="attendance-btn ${athlete.present ? 'present' : 'absent'}" onclick="toggleAttendance(${index})">${athlete.present ? 'Present' : 'Absent'}</button>
            <button class="attendance-btn" onclick="removeAthlete(${index})" style="background-color: #666;">Remove</button>
        </div>
    `;
    return athleteItem;
}

// Initialize the attendance list
function initializeAttendanceList() {
    const attendanceList = document.getElementById('attendanceList');
    if (!attendanceList) return;
    
    attendanceList.innerHTML = '';
    
    // Sort athletes before displaying
    sortAthletes();
    
    athletes.forEach((athlete, index) => {
        attendanceList.appendChild(createAthleteElement(athlete, index));
    });
    
    updateStats();
}

// Add a new athlete
function addAthlete() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const gender = document.getElementById('gender').value;
    const grade = document.getElementById('grade').value;
    const team = document.getElementById('team').value;
    const workoutGroup = document.getElementById('workoutGroup').value;
    
    if (!firstName || !lastName || !grade || !team || !workoutGroup) {
        alert('Please fill in all required fields');
        return;
    }
    
    athletes.push({
        firstName,
        lastName,
        gender,
        grade,
        team,
        workoutGroup,
        present: false,
        attendanceHistory: []
    });
    
    saveAthletes();
    clearInputFields();
    updateAttendanceList();
}

// Clear input fields
function clearInputFields() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('grade').value = '';
    document.getElementById('team').value = '';
    document.getElementById('workoutGroup').value = '';
}

// Save athletes to localStorage
function saveAthletes() {
    try {
        localStorage.setItem('athletes', JSON.stringify(athletes));
    } catch (error) {
        console.error('Error saving athletes:', error);
        alert('Error saving data. Please try again.');
    }
}

// Toggle attendance status
function toggleAttendance(index) {
    if (index < 0 || index >= athletes.length) return;
    
    athletes[index].present = !athletes[index].present;
    const today = new Date().toISOString().split('T')[0];
    
    if (!athletes[index].attendanceHistory) {
        athletes[index].attendanceHistory = [];
    }
    
    athletes[index].attendanceHistory.push({
        date: today,
        present: athletes[index].present
    });
    
    saveAthletes();
    updateAttendanceList();
}

// Remove an athlete
function removeAthlete(index) {
    if (index < 0 || index >= athletes.length) return;
    
    if (confirm('Are you sure you want to remove this athlete?')) {
        athletes.splice(index, 1);
        saveAthletes();
        initializeAttendanceList();
    }
}

// Remove all athletes
function confirmRemoveAll() {
    if (confirm('Are you sure you want to remove ALL athletes? This action cannot be undone.')) {
        athletes = [];
        saveAthletes();
        initializeAttendanceList();
    }
}

// For compatibility with the button in index.html
function removeAllAthletes() {
    confirmRemoveAll();
}

// Sort athletes
function sortAthletes() {
    const sortBy = document.getElementById('sortBy')?.value || 'name';
    
    athletes.sort((a, b) => {
        switch(sortBy) {
            case 'team':
                const aTeamOrder = teamOrder[a.team] || 999;
                const bTeamOrder = teamOrder[b.team] || 999;
                if (aTeamOrder !== bTeamOrder) return aTeamOrder - bTeamOrder;
                return getAthleteDisplayName(a).localeCompare(getAthleteDisplayName(b));
            
            case 'group':
                const aGroupOrder = cookieGroupOrder[a.workoutGroup] || 999;
                const bGroupOrder = cookieGroupOrder[b.workoutGroup] || 999;
                if (aGroupOrder !== bGroupOrder) return aGroupOrder - bGroupOrder;
                return getAthleteDisplayName(a).localeCompare(getAthleteDisplayName(b));
            
            case 'name':
                const nameCompare = getAthleteDisplayName(a).localeCompare(getAthleteDisplayName(b));
                if (nameCompare !== 0) return nameCompare;
                return (teamOrder[a.team] || 999) - (teamOrder[b.team] || 999);
            
            case 'grade':
                const gradeCompare = (a.grade || '0').localeCompare(b.grade || '0');
                if (gradeCompare !== 0) return gradeCompare;
                return getAthleteDisplayName(a).localeCompare(getAthleteDisplayName(b));
            
            default:
                return 0;
        }
    });
}

// Filter athletes
function filterAthletes() {
    const gradeFilter = document.getElementById('gradeFilter')?.value || '';
    const teamFilter = document.getElementById('teamFilter')?.value || '';
    const groupFilter = document.getElementById('groupFilter')?.value || '';
    
    const filteredAthletes = athletes.filter(athlete => {
        const gradeMatch = !gradeFilter || athlete.grade === gradeFilter;
        const teamMatch = !teamFilter || athlete.team === teamFilter;
        const groupMatch = !groupFilter || athlete.workoutGroup === groupFilter;
        return gradeMatch && teamMatch && groupMatch;
    });
    
    const attendanceList = document.getElementById('attendanceList');
    if (!attendanceList) return;
    
    attendanceList.innerHTML = '';
    
    filteredAthletes.forEach((athlete, index) => {
        const originalIndex = athletes.indexOf(athlete);
        attendanceList.appendChild(createAthleteElement(athlete, originalIndex));
    });
}

// Update statistics
function updateStats() {
    const totalAthletesElement = document.getElementById('totalAthletes');
    const presentCountElement = document.getElementById('presentCount');
    
    if (totalAthletesElement) {
        totalAthletesElement.textContent = athletes.length;
    }
    
    if (presentCountElement) {
        presentCountElement.textContent = athletes.filter(athlete => athlete.present).length;
    }
}

// Export to CSV
function exportToCSV() {
    try {
        const headers = ['First Name', 'Last Name', 'Grade', 'Team', 'Workout Group', 'Present', 'Last Updated'];
        const rows = athletes.map(athlete => [
            athlete.firstName,
            athlete.lastName,
            athlete.grade || 'N/A',
            athlete.team || 'N/A',
            athlete.workoutGroup || 'N/A',
            athlete.present ? 'Yes' : 'No',
            new Date().toLocaleString()
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
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error exporting data. Please try again.');
    }
}

// Function to update workout group dropdowns
function updateWorkoutGroupDropdowns() {
    // Get unique workout groups from athletes
    const workoutGroups = [...new Set(athletes.map(a => a.workoutGroup).filter(Boolean))].sort();
    
    // Update the add athlete dropdown
    const workoutGroupSelect = document.getElementById('workoutGroup');
    const currentAddValue = workoutGroupSelect.value;
    workoutGroupSelect.innerHTML = '<option value="">Select Workout Group</option>';
    workoutGroups.forEach(group => {
        workoutGroupSelect.innerHTML += `<option value="${group}">${group}</option>`;
    });
    workoutGroupSelect.value = currentAddValue;

    // Update the filter dropdown
    const groupFilterSelect = document.getElementById('groupFilter');
    const currentFilterValue = groupFilterSelect.value;
    groupFilterSelect.innerHTML = '<option value="">All Workout Groups</option>';
    workoutGroups.forEach(group => {
        groupFilterSelect.innerHTML += `<option value="${group}">${group}</option>`;
    });
    groupFilterSelect.value = currentFilterValue;
}

// Import from CSV
function handleCSVImport(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            console.log('CSV content:', text);
            const rows = text.split('\n');
            
            if (rows.length < 2) {
                throw new Error('CSV file must have at least a header row and one data row');
            }

            // Parse header row and find variations of column names
            const headers = rows[0].split(',').map(header => header.trim().toLowerCase().replace(/^"|"$/g, ''));
            console.log('Headers found:', headers);

            // Find all team columns and use the last one
            const teamColumns = headers.reduce((acc, header, index) => {
                if (header.includes('team')) {
                    acc.push(index);
                }
                return acc;
            }, []);

            // Find column indices with flexible matching
            const findColumn = (possibleNames) => {
                return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
            };

            const columnIndices = {
                firstName: findColumn(['first']),
                lastName: findColumn(['last']),
                grade: findColumn(['grade']),
                team: teamColumns[teamColumns.length - 1] // Use the last team column
            };

            console.log('Column indices:', columnIndices);

            // Valid team names (case-insensitive)
            const validTeams = {
                'varsity': 'Varsity',
                'v': 'Varsity',
                'jv': 'JV',
                'a': 'A',
                'dev': 'Dev Squad',
                'dev squad': 'Dev Squad',
                'devsquad': 'Dev Squad',
                'development': 'Dev Squad'
            };

            // Process data rows
            const newAthletes = [];
            const warnings = [];
            let currentWorkoutGroup = '';
            
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) {
                    console.log(`Row ${i}: Empty row, skipping`);
                    continue;
                }

                const cells = row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
                console.log(`Row ${i}: Raw cells:`, cells);
                
                // Check if this is a workout group header row
                const nonEmptyCells = cells.filter(cell => cell.trim());
                console.log(`Row ${i}: Non-empty cells:`, nonEmptyCells);

                // A row is a workout group header if:
                // 1. It has exactly one non-empty cell, OR
                // 2. First cell has content but name columns are empty
                const isWorkoutHeader = nonEmptyCells.length === 1 || 
                    (cells[0].trim() && !cells[columnIndices.firstName]?.trim() && !cells[columnIndices.lastName]?.trim());

                if (isWorkoutHeader) {
                    currentWorkoutGroup = nonEmptyCells[0];
                    console.log(`Row ${i}: Found workout group header: "${currentWorkoutGroup}"`);
                    continue;
                }

                // Skip rows that don't have enough cells
                if (cells.length < headers.length) {
                    console.log(`Row ${i}: Not enough cells, skipping`);
                    continue;
                }

                // Get base values
                const firstName = cells[columnIndices.firstName] || '';
                const lastName = cells[columnIndices.lastName] || '';
                const grade = cells[columnIndices.grade] || '';
                let team = cells[columnIndices.team] || '';

                // Skip rows without name (likely headers or empty rows)
                if (!firstName && !lastName) {
                    console.log(`Row ${i}: No name found, skipping`);
                    continue;
                }

                console.log(`Row ${i}: Processing athlete: ${firstName} ${lastName}, Team: ${team}, Workout Group: ${currentWorkoutGroup}`);

                // Normalize team name from team column
                const teamLower = team.toLowerCase();
                team = validTeams[teamLower] || '';
                if (!team && cells[columnIndices.team]) {
                    warnings.push(`Invalid team "${cells[columnIndices.team]}" for ${firstName} ${lastName}`);
                }

                newAthletes.push({
                    firstName,
                    lastName,
                    gender: '',
                    grade,
                    team,
                    workoutGroup: currentWorkoutGroup,
                    present: false,
                    attendanceHistory: []
                });
            }

            console.log('Final processed athletes:', newAthletes);
            console.log('Unique workout groups found:', [...new Set(newAthletes.map(a => a.workoutGroup).filter(Boolean))]);

            if (newAthletes.length === 0) {
                throw new Error('No valid athletes found in CSV file');
            }

            athletes = newAthletes;
            saveAthletes();
            updateWorkoutGroupDropdowns();
            updateAttendanceList();

            // Show import summary
            const missingTeams = newAthletes.filter(a => !a.team).length;
            const uniqueWorkoutGroups = [...new Set(newAthletes.map(a => a.workoutGroup).filter(Boolean))];
            
            let message = `Successfully imported ${newAthletes.length} athletes.\n`;
            if (missingTeams > 0) message += `\n${missingTeams} athletes have missing or invalid teams.`;
            message += `\n\nFound workout groups: ${uniqueWorkoutGroups.join(', ')}`;
            if (warnings.length > 0) {
                message += '\n\nWarnings:\n' + warnings.join('\n');
            }
            
            alert(message);

        } catch (error) {
            console.error('Error importing CSV:', error);
            alert('Error importing data: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

// Update the attendance list with filtering and sorting
function updateAttendanceList() {
    const gradeFilter = document.getElementById('gradeFilter').value;
    const genderFilter = document.getElementById('genderFilter').value;
    const teamFilter = document.getElementById('teamFilter').value;
    const groupFilter = document.getElementById('groupFilter').value;
    
    // Filter athletes based on selected criteria
    let filteredAthletes = athletes.filter(athlete => {
        const gradeMatch = !gradeFilter || athlete.grade === gradeFilter;
        const genderMatch = !genderFilter || athlete.gender === genderFilter;
        const teamMatch = !teamFilter || athlete.team === teamFilter;
        const groupMatch = !groupFilter || athlete.workoutGroup === groupFilter;
        return gradeMatch && genderMatch && teamMatch && groupMatch;
    });

    // Sort athletes
    if (gradeFilter) {
        filteredAthletes.sort((a, b) => {
            const gradeCompare = parseInt(a.grade) - parseInt(b.grade);
            if (gradeCompare !== 0) return gradeCompare;
            return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        });
    } else if (teamFilter) {
        filteredAthletes.sort((a, b) => {
            const teamCompare = (teamOrder[a.team] || 999) - (teamOrder[b.team] || 999);
            if (teamCompare !== 0) return teamCompare;
            return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        });
    } else {
        filteredAthletes.sort((a, b) => {
            return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        });
    }

    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = '';
    filteredAthletes.forEach((athlete) => {
        const originalIndex = athletes.indexOf(athlete);
        attendanceList.appendChild(createAthleteElement(athlete, originalIndex));
    });
    updateStats();
}

// Add a global importFromCSV function for the file input
function importFromCSV(event) {
    const file = event.target.files[0];
    if (file) {
        handleCSVImport(file);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize attendance list
    updateWorkoutGroupDropdowns();
    updateAttendanceList();
    
    // Add event listener for Enter key in lastName input
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
        lastNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addAthlete();
            }
        });
    }
    
    const excelFileInput = document.getElementById('excelFile');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleCSVImport(file);
            }
        });
    }
}); 