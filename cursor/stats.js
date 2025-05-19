// Get athletes data from localStorage
const athletes = JSON.parse(localStorage.getItem('athletes')) || [];

// Define cookie group order for sorting
const cookieGroupOrder = {
    'Chocolate Chip': 1,
    'Oatmeal Raisin': 2,
    'Snickerdoodle': 3,
    'Peanut Butter': 4,
    'Sugar': 5,
    'Double Chocolate': 6
};

// Define team order for sorting
const teamOrder = {
    'Varsity': 1,
    'JV A': 2,
    'JV B': 3,
    'Freshman A': 4,
    'Freshman B': 5
};

// Calculate and display statistics
function updateStatistics() {
    // Get filter values
    const gradeFilter = document.getElementById('gradeFilter')?.value || '';
    const teamFilter = document.getElementById('teamFilter')?.value || '';
    const groupFilter = document.getElementById('groupFilter')?.value || '';

    // Filter athletes based on selected criteria
    const filteredAthletes = athletes.filter(athlete => {
        const gradeMatch = !gradeFilter || athlete.grade === gradeFilter;
        const teamMatch = !teamFilter || athlete.team === teamFilter;
        const groupMatch = !groupFilter || athlete.workoutGroup === groupFilter;
        return gradeMatch && teamMatch && groupMatch;
    });

    // Update basic stats with filtered data
    document.getElementById('totalAthletes').textContent = filteredAthletes.length;
    
    const presentToday = filteredAthletes.filter(a => a.present).length;
    document.getElementById('presentToday').textContent = presentToday;
    document.getElementById('absentToday').textContent = filteredAthletes.length - presentToday;
    
    // Calculate average attendance rate for filtered athletes
    const totalAttendance = filteredAthletes.reduce((sum, athlete) => {
        if (!athlete.attendanceHistory) return sum;
        return sum + athlete.attendanceHistory.filter(h => h.present).length;
    }, 0);
    
    const totalRecords = filteredAthletes.reduce((sum, athlete) => {
        if (!athlete.attendanceHistory) return sum;
        return sum + athlete.attendanceHistory.length;
    }, 0);
    
    const avgRate = totalRecords > 0 ? (totalAttendance / totalRecords * 100).toFixed(1) : 0;
    document.getElementById('avgAttendance').textContent = `${avgRate}%`;
    
    // Show top athletes from filtered data
    const topAthletesDiv = document.getElementById('topAthletes');
    const athleteStats = filteredAthletes.map(athlete => {
        if (!athlete.attendanceHistory) return { 
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            rate: 0 
        };
        const presentCount = athlete.attendanceHistory.filter(h => h.present).length;
        const totalCount = athlete.attendanceHistory.length;
        return {
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            rate: totalCount > 0 ? (presentCount / totalCount * 100) : 0
        };
    });
    
    // Sort by attendance rate (descending) and then by name
    athleteStats.sort((a, b) => {
        if (b.rate !== a.rate) {
            return b.rate - a.rate;
        }
        // If rates are equal, sort by last name then first name
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.firstName.localeCompare(b.firstName);
    });
    
    const top5 = athleteStats.slice(0, 5);
    
    topAthletesDiv.innerHTML = top5.map(athlete => 
        `<p>${athlete.firstName} ${athlete.lastName}: ${athlete.rate.toFixed(1)}%</p>`
    ).join('');

    // Update workout group statistics with filtered data
    updateWorkoutGroupStats(filteredAthletes);
    
    // Create attendance chart with filtered data
    createAttendanceChart(filteredAthletes);
}

// Update workout group statistics
function updateWorkoutGroupStats(filteredAthletes) {
    const workoutGroupStatsDiv = document.getElementById('workoutGroupStats');
    if (!workoutGroupStatsDiv) return;

    // Get all unique workout groups from filtered athletes
    const workoutGroups = [...new Set(filteredAthletes.map(a => a.workoutGroup).filter(Boolean))];
    
    // Sort workout groups by predefined order
    workoutGroups.sort((a, b) => (cookieGroupOrder[a] || 999) - (cookieGroupOrder[b] || 999));

    // Calculate stats for each group
    const groupStats = workoutGroups.map(group => {
        const groupAthletes = filteredAthletes.filter(a => a.workoutGroup === group);
        const presentToday = groupAthletes.filter(a => a.present).length;
        
        const totalAttendance = groupAthletes.reduce((sum, athlete) => {
            if (!athlete.attendanceHistory) return sum;
            return sum + athlete.attendanceHistory.filter(h => h.present).length;
        }, 0);
        
        const totalRecords = groupAthletes.reduce((sum, athlete) => {
            if (!athlete.attendanceHistory) return sum;
            return sum + athlete.attendanceHistory.length;
        }, 0);
        
        const avgRate = totalRecords > 0 ? (totalAttendance / totalRecords * 100).toFixed(1) : 0;
        
        return {
            group,
            totalAthletes: groupAthletes.length,
            presentToday,
            avgRate
        };
    });

    // Create the widget HTML
    let html = `
        <div class="workout-group-stats">
            <h3>Workout Group Statistics</h3>
            <div class="group-stats-container">
    `;

    if (groupStats.length === 0) {
        html += `<p>No workout groups found with the current filters.</p>`;
    } else {
        groupStats.forEach(stat => {
            html += `
                <div class="group-stat-card">
                    <h4>${stat.group}</h4>
                    <div class="stat-details">
                        <p>Total Athletes: ${stat.totalAthletes}</p>
                        <p>Present Today: ${stat.presentToday}</p>
                        <p>Average Attendance: ${stat.avgRate}%</p>
                    </div>
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>
    `;

    workoutGroupStatsDiv.innerHTML = html;
}

// Create attendance chart
function createAttendanceChart(filteredAthletes) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Get last 14 days of attendance data
    const dates = Array.from({length: 14}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();
    
    // Calculate attendance data for each day
    const attendanceData = dates.map(date => {
        return filteredAthletes.filter(athlete => 
            athlete.attendanceHistory && 
            athlete.attendanceHistory.some(h => h.date === date && h.present)
        ).length;
    });

    // Calculate total athletes for each day
    const totalAthletesData = dates.map(date => {
        return filteredAthletes.filter(athlete => 
            athlete.attendanceHistory && 
            athlete.attendanceHistory.some(h => h.date === date)
        ).length;
    });
    
    // Destroy existing chart if it exists
    if (window.attendanceChart) {
        window.attendanceChart.destroy();
    }
    
    window.attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Present Athletes',
                    data: attendanceData,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Total Athletes',
                    data: totalAthletesData,
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Attendance Over Last 14 Days',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1a73e8',
                    bodyColor: '#333',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value} athletes`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Initialize statistics when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for filters
    const filters = ['gradeFilter', 'teamFilter', 'groupFilter'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', updateStatistics);
        }
    });

    // Initial update
    updateStatistics();
}); 