document.getElementById('deleteAccountButton').addEventListener('click', function() {
    confirmDelete();
});

function confirmDelete() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        fetch('/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/login';
            } else {
                alert('Error deleting account.');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for delete buttons
    document.querySelectorAll('.danger.icon').forEach(button => {
        button.addEventListener('click', async (event) => {
            const userId = event.currentTarget.dataset.id; 

            try {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                    const response = await fetch(`/admin/delete-user/${userId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete user');
                    }
                    
                    // Refresh the page after successful deletion
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        });
    });

    document.querySelectorAll('.edit.icon').forEach(button => {
        button.addEventListener('click', (event) => {
            const userId = event.currentTarget.dataset.id;

            // Redirect to the edit user page
            window.location.href = `/admin/edit-user/${userId}`;
        });
    });
});

