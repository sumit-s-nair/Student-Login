document.getElementById('edit-user-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const userId = window.userId;
    const data = {
        math: document.getElementById('math').value,
        science: document.getElementById('science').value,
        english: document.getElementById('english').value,
        webdev: document.getElementById('webdev').value
    };

    try {
        const response = await fetch(`/admin/edit-user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('User marks updated successfully');
            window.location.href = '/admin/dashboard';
        } else {
            const error = await response.text();
            alert(`Failed to update user marks: ${error}`);
        }
    } catch (error) {
        console.error('Error updating user marks:', error);
        alert('Failed to update user marks due to a network error');
    }
});

document.getElementById('cancel').addEventListener('click', function() {
    window.location.href = '/admin/dashboard';
});

document.getElementById('go-back').addEventListener('click', function() {
    window.location.href = '/admin/dashboard';
});
