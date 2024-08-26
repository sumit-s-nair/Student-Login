const initialClasses = {
    profile: '',
    banner: '',
    grades: ''
};

// Store the initial classes of the elements
function storeInitialClasses() {
    const profile = document.querySelector('#profile');
    const banner = document.querySelector('#banner');
    const grades = document.querySelector('#grades');

    if (profile) {
        initialClasses.profile = profile.className;
    }
    if (banner) {
        initialClasses.banner = banner.className;
    }
    if (grades) {
        initialClasses.grades = grades.className;
    }
}

function updateElementClasses() {
    const profile = document.querySelector('#profile');
    const banner = document.querySelector('#banner');
    const grades = document.querySelector('#grades');

    // Check if the screen width is less than 768px
    if (window.innerWidth < 768) {
        if (profile) profile.classList.add('hidden');
        if (banner) banner.classList.remove('hidden');
        if (grades) grades.classList.remove('hidden');
    } else {
        if (profile) profile.className = initialClasses.profile;
        if (banner) banner.className = initialClasses.banner;
        if (grades) grades.className = initialClasses.grades;
    }
}

function toggleMenu() {
    const profile = document.querySelector('#profile');
    const banner = document.querySelector('#banner');
    const grades = document.querySelector('#grades');

    if (profile) {
        profile.classList.remove('hidden');
        if (banner) banner.classList.add('hidden');
        if (grades) grades.classList.add('hidden');
    }
    
}

window.addEventListener('resize', updateElementClasses);

document.addEventListener('DOMContentLoaded', () => {
    storeInitialClasses();
    updateElementClasses(); 

    // Add event listener for menu button click
    const menuIcon = document.querySelector('.menu-icon');
    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                menuIcon.classList.toggle('active');

                const isActive = menuIcon.classList.contains('active');
                
                if (isActive) {
                    toggleMenu();
                    }
                else {
                    updateElementClasses();
                }
            }
        });
    }
});