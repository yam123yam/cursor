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

async function exportToCSV() {
    try {
        const response = await fetch('/api/athletes');
        const athletes = await response.json();
        
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
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error exporting data. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('csvImportForm').addEventListener('submit', importCSV);
}); 