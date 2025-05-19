document.addEventListener('DOMContentLoaded', async () => {
    // Fetch athletes data
    let athletes = [];
    try {
        const response = await fetch('/api/athletes');
        athletes = await response.json();
    } catch (error) {
        alert('Failed to load athlete data.');
        return;
    }

    // 1. Overall Attendance Over Time (generic: count of present per date)
    const attendanceByDate = {};
    athletes.forEach(a => {
        if (Array.isArray(a.attendanceHistory)) {
            a.attendanceHistory.forEach(record => {
                if (!attendanceByDate[record.date]) attendanceByDate[record.date] = 0;
                if (record.present) attendanceByDate[record.date]++;
            });
        }
    });
    const dates = Object.keys(attendanceByDate).sort();
    const counts = dates.map(date => attendanceByDate[date]);

    // Draw chart
    if (window.Chart && document.getElementById('attendanceChart')) {
        new Chart(document.getElementById('attendanceChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Number Present',
                    data: counts,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25,135,84,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Present' }, beginAtZero: true }
                }
            }
        });
    }

    // 2. Most Absent List
    // Count absences for each athlete
    const absentCounts = athletes.map(a => {
        let absences = 0;
        if (Array.isArray(a.attendanceHistory)) {
            absences = a.attendanceHistory.filter(r => r.present === false).length;
        }
        return { name: `${a.firstName} ${a.lastName}`.trim(), absences };
    });
    absentCounts.sort((a, b) => b.absences - a.absences);
    const mostAbsentList = document.getElementById('mostAbsentList');
    absentCounts.slice(0, 10).forEach(a => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = a.name || '(No Name)';
        const badge = document.createElement('span');
        badge.className = 'badge bg-danger rounded-pill';
        badge.textContent = a.absences;
        li.appendChild(badge);
        mostAbsentList.appendChild(li);
    });
}); 